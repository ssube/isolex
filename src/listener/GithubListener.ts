import { doesExist, mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { Octokit } from '@octokit/rest';
import { Container, Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { FetchOptions, ListenerData } from '.';
import { BotServiceOptions, INJECT_STORAGE } from '../BotService';
import { Message } from '../entity/Message';
import { Tick } from '../entity/Tick';
import { ServiceEvent } from '../Service';
import { GithubClient, GithubClientData } from '../utils/github';
import { TYPE_TEXT } from '../utils/Mime';
import { SessionListener } from './SessionListener';

export interface GithubRepoOptions {
  owner: string;
  repo: string;
}

export interface GithubListenerData extends ListenerData {
  client: GithubClientData;
  repos: Array<GithubRepoOptions>;
  start: string;
}

@Inject(INJECT_STORAGE)
export class GithubListener extends SessionListener<GithubListenerData> {
  protected client?: GithubClient;
  protected container: Container;
  protected readonly tickRepository: Repository<Tick>;

  constructor(options: BotServiceOptions<GithubListenerData>) {
    super(options, 'isolex#/definitions/service-listener-github');
    this.container = options.container;
    this.tickRepository = mustExist(options[INJECT_STORAGE]).getRepository(Tick);
  }

  public async start() {
    this.client = await this.container.create(GithubClient, {
      data: this.data.client,
    });
  }

  public async notify(event: ServiceEvent): Promise<void> {
    await super.notify(event);

    if (event === ServiceEvent.Tick) {
      await this.fetchSince();
    }
  }

  public fetch(options: FetchOptions): Promise<Array<Message>> {
    throw new NotImplementedError();
  }

  public async send(msg: Message): Promise<void> {
    const ctx = mustExist(msg.context);
    const [owner, repo] = ctx.channel.id.split('/');
    const [type, issue] = ctx.channel.thread.split('/');
    const options = {
      body: msg.body,
      number: Number(issue),
      owner,
      repo,
    };

    if (type === 'issues') {
      this.logger.debug(options, 'commenting on github issue');
      await mustExist(this.client).client.issues.createComment(options);
    } else {
      this.logger.warn({ issue, type }, 'unable to comment on github issue type');
    }
  }

  protected async fetchSince() {
    const since = await this.getLastUpdate();

    await this.tickRepository.save(new Tick({
      intervalId: this.id,
      status: 0,
    }));

    for (const repo of this.data.repos) {
      const options = {
        owner: repo.owner,
        repo: repo.repo,
        since,
      };
      this.logger.debug(options, 'listing comments for repo');

      const response = await mustExist(this.client).client.issues.listCommentsForRepo(options);
      const comments = response.data;
      this.logger.debug({ comments }, 'got github comments');

      for (const comment of comments) {
        try {
          const msg = await this.convertMessage(comment, repo);
          await this.bot.receive(msg);
        } catch (err) {
          this.logger.error(err, 'error receiving github comment');
        }
      }
    }
  }

  protected async getLastUpdate() {
    const lastTick = await this.tickRepository.findOne({
      order: {
        createdAt: 'DESC',
        /* eslint-disable @typescript-eslint/no-explicit-any */
      } as any,
      where: {
        intervalId: this.id,
      },
    });

    if (doesExist(lastTick)) {
      return lastTick.updatedAt.toISOString();
    } else {
      return this.data.start;
    }
  }

  protected async convertMessage(msg: Octokit.IssuesListCommentsForRepoResponseItem, repo: GithubRepoOptions): Promise<Message> {
    const [thread] = mustExist(/((issues|pull)\/\d+)/.exec(msg.html_url));
    const uid = msg.user.id.toString();
    const context = await this.createContext({
      channel: {
        id: `${repo.owner}/${repo.repo}`,
        thread,
      },
      sourceUser: {
        name: msg.user.login,
        uid,
      },
    });

    const session = await this.getSession(uid);
    if (doesExist(session)) {
      this.logger.debug({ context, msg, session }, 'attaching session to message context');
      context.user = session.user;
    }

    return new Message({
      body: msg.body,
      context,
      labels: this.labels,
      reactions: [],
      type: TYPE_TEXT,
    });
  }
}

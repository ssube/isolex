import * as Octokit from '@octokit/rest';
import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { BotServiceOptions, INJECT_STORAGE } from 'src/BotService';
import { Message } from 'src/entity/Message';
import { Tick } from 'src/entity/Tick';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { FetchOptions, ListenerData } from 'src/listener';
import { SessionListener } from 'src/listener/SessionListener';
import { ServiceEvent } from 'src/Service';
import { doesExist, mustExist } from 'src/utils';
import { GithubClientData } from 'src/utils/github';
import { TYPE_TEXT } from 'src/utils/Mime';

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
  protected readonly client: Octokit;
  protected readonly tickRepository: Repository<Tick>;

  constructor(options: BotServiceOptions<GithubListenerData>) {
    super(options, 'isolex#/definitions/service-listener-github');

    this.client = new Octokit({
      headers: {
        authorization: `token ${options.data.client.token}`,
      },
    });
    this.tickRepository = mustExist(options[INJECT_STORAGE]).getRepository(Tick);
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
      await this.client.issues.createComment(options);
      return;
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

      const response = await this.client.issues.listCommentsForRepo(options);
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
      name: msg.user.login,
      uid,
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

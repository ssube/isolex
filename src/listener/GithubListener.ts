import * as Octokit from '@octokit/rest';
import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { BotServiceOptions, INJECT_STORAGE } from 'src/BotService';
import { User } from 'src/entity/auth/User';
import { Message } from 'src/entity/Message';
import { Session } from 'src/entity/Session';
import { Tick } from 'src/entity/Tick';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { FetchOptions, ListenerData } from 'src/listener';
import { BaseListener } from 'src/listener/BaseListener';
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
export class GithubListener extends BaseListener<GithubListenerData> {
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

  public createSession(uid: string, user: User): Promise<Session> {
    throw new NotImplementedError();
  }

  public getSession(uid: string): Promise<Session | undefined> {
    throw new NotImplementedError();
  }

  public async send(msg: Message): Promise<void> {
    // comment on github
  }

  protected async fetchSince() {
    const since = await this.getLastUpdate();

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
        const msg = await this.convertMessage(comment, repo);
        await this.bot.receive(msg);
      }
    }

    await this.tickRepository.save(new Tick({
      intervalId: this.id,
      status: 0,
    }));
  }

  protected async getLastUpdate() {
    const lastTick = await this.tickRepository.findOne({
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
    const context = await this.createContext({
      channel: {
        id: `${repo.owner}/${repo.repo}`,
        thread: msg.node_id,
      },
      name: msg.user.login,
      uid: msg.user.id.toString(),
    });
    return new Message({
      body: msg.body,
      context,
      labels: this.labels,
      reactions: [],
      type: TYPE_TEXT,
    });
  }
}

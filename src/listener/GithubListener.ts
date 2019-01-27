import { ListenerData, FetchOptions } from 'src/listener';
import { BaseListener } from 'src/listener/BaseListener';
import { GithubClientData } from 'src/utils/github';
import { BotServiceOptions } from 'src/BotService';
import { Message } from 'src/entity/Message';
import { User } from 'src/entity/auth/User';
import { Session } from 'src/entity/Session';
import { ServiceEvent } from 'src/Service';

export interface GithubListenerData extends ListenerData {
  client: GithubClientData;
}

export class GithubListener extends BaseListener<GithubListenerData> {
  constructor(options: BotServiceOptions<GithubListenerData>) {
    super(options, 'isolex#/definitions/service-listener-github');
  }

  public async notify(event: ServiceEvent): Promise<void> {
    await super.notify(event);

    if (event === ServiceEvent.Tick) {
      await this.fetchSince();
    }
  }

  public fetch(options: FetchOptions): Promise<Array<Message>> {
    throw new Error("Method not implemented.");
  }

  public createSession(uid: string, user: User): Promise<Session> {
    throw new Error("Method not implemented.");
  }

  public getSession(uid: string): Promise<Session | undefined> {
    throw new Error("Method not implemented.");
  }

  public async send(msg: Message): Promise<void> {
    // command on github
  }

  protected async fetchSince() {
    // fetch messages since last tick
    // convert
    // send
  }
}

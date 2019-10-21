import { json, RequestHandler } from 'express';
import { Inject } from 'noicejs';

import { Endpoint, EndpointData, HandlerMetadata, RouterOptions } from '.';
import { INJECT_STORAGE } from '../BotService';
import { User } from '../entity/auth/User';
import { UserRepository } from '../entity/auth/UserRepository';
import { ChannelData } from '../entity/Context';
import { Storage } from '../storage';
import { mustExist } from '../utils';
import { BaseEndpoint, BaseEndpointOptions } from './BaseEndpoint';

export interface HookEndpointData extends EndpointData {
  hookUser: string;
}

@Inject(INJECT_STORAGE)
export class HookEndpoint<TData extends HookEndpointData> extends BaseEndpoint<TData> implements Endpoint {
  protected readonly storage: Storage;
  protected hookUser?: User;

  constructor(options: BaseEndpointOptions<TData>, schema: string) {
    super(options, schema);

    this.storage = mustExist(options[INJECT_STORAGE]);
  }

  public async start() {
    await super.start();

    const repository = this.storage.getCustomRepository(UserRepository);
    const user = await repository.findOneOrFail({
      id: this.data.hookUser,
    });
    this.hookUser = await repository.loadRoles(user);
  }

  protected getHandlerMiddleware(metadata: HandlerMetadata, options: RouterOptions): Array<RequestHandler> {
    return [
      ...super.getHandlerMiddleware(metadata, options),
      json(),
    ];
  }

  protected async createHookContext(channel: ChannelData) {
    const user = mustExist(this.hookUser);
    return this.createContext({
      channel,
      name: user.name,
      uid: this.data.hookUser,
      user,
    });
  }
}

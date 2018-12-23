import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { Command, CommandVerb } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Parser } from 'src/parser/Parser';
import { mapToDict } from 'src/utils/Map';

import { BaseController } from './BaseController';
import { Controller, ControllerOptions } from './Controller';

export const NOUN_FRAGMENT = 'fragment';

export type CompletionControllerData = any;
export type CompletionControllerOptions = ControllerOptions<CompletionControllerData>;

@Inject('bot', 'services', 'storage')
export class CompletionController extends BaseController<CompletionControllerData> implements Controller {
  protected storage: Connection;
  protected fragmentRepository: Repository<Fragment>;

  constructor(options: CompletionControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-completion', [NOUN_FRAGMENT]);

    this.storage = options.storage;
    this.fragmentRepository = this.storage.getRepository(Fragment);
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'completing command');

    switch (cmd.noun) {
      case NOUN_FRAGMENT:
        return this.handleFragment(cmd);
      default:
        return this.reply(cmd.context, 'invalid noun');
    }
  }

  public async handleFragment(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createFragment(cmd);
      case CommandVerb.Update:
        return this.updateFragment(cmd);
      default:
        return this.reply(cmd.context, 'invalid verb');
    }
  }

  public async createFragment(cmd: Command): Promise<void> {
    const key = cmd.getHead('key');
    const msg = cmd.getHeadOrDefault('msg', `missing required argument: ${key}`);
    const noun = cmd.getHead('noun');
    const parserId = cmd.getHead('parser');
    const verb = cmd.getHead('verb') as CommandVerb;

    const fragment = await this.fragmentRepository.save(new Fragment({
      data: cmd.data,
      key,
      labels: cmd.labels,
      noun,
      parserId,
      verb,
    }));

    this.logger.debug({ data: mapToDict(cmd.data), fragment }, 'creating fragment for later completion');

    // @TODO: send this message elsewhere (not a direct reply)
    return this.reply(cmd.context, `${fragment.id} (${key}): ${msg}`);
  }

  public async updateFragment(cmd: Command): Promise<void> {
    const id = cmd.getHead('id');
    this.logger.debug({ id }, 'getting fragment to complete');

    const fragment = await this.fragmentRepository.findOne({
      id,
    });

    if (isNil(fragment)) {
      return this.reply(cmd.context, 'fragment not found');
    }

    this.logger.debug({ fragment }, 'attempting to complete fragment');

    try {
      this.logger.debug({ parserId: fragment.parserId }, 'getting parser for fragment');
      const parser = this.services.getService<Parser>({ id: fragment.parserId });
      const value = cmd.get('next');
      const commands = await parser.complete(cmd.context, fragment, value);
      await this.bot.executeCommand(...commands);
    } catch (err) {
      this.logger.error(err, 'error completing fragment');
      await this.reply(cmd.context, 'error completing fragment');
    }
  }
}

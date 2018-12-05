import { isNil } from 'lodash';
import { Inject, BaseError } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { Command, CommandVerb } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { Parser } from 'src/parser/Parser';
import { mapToDict } from 'src/utils/Map';
import { TYPE_TEXT } from 'src/utils/Mime';

import { BaseController } from './BaseController';
import { Controller, ControllerOptions } from './Controller';

export const NOUN_FRAGMENT = 'fragment';

export type CompletionControllerData = any;
export type CompletionControllerOptions = ControllerOptions<CompletionControllerData>;

@Inject('storage')
export class CompletionController extends BaseController<CompletionControllerData> implements Controller {
  protected storage: Connection;
  protected fragmentRepository: Repository<Fragment>;

  constructor(options: CompletionControllerOptions) {
    super({
      ...options,
      nouns: [NOUN_FRAGMENT],
    });

    if (isNil(options.storage)) {
      throw new BaseError('missing dependencies');
    }
    this.storage = options.storage;
    this.fragmentRepository = this.storage.getRepository(Fragment);
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'completing command');

    if (cmd.noun === NOUN_FRAGMENT) {
      return this.handleFragment(cmd);
    }

    await this.bot.sendMessage();
  }

  public async handleFragment(cmd: Command): Promise<void> {
    if (cmd.verb === CommandVerb.Create) {
      return this.createFragment(cmd);
    }
    if (cmd.verb === CommandVerb.Update) {
      return this.updateFragment(cmd);
    }

    await this.bot.sendMessage();
  }

  public async createFragment(cmd: Command): Promise<void> {
    const key = cmd.getHead('key');
    const msg = cmd.getHeadOrDefault('msg', `missing required argument: ${key}`);
    const noun = cmd.getHead('noun');
    const parserId = cmd.getHead('parser');
    const verb = cmd.getHead('verb') as CommandVerb;

    const fragment = await this.fragmentRepository.create({
      data: cmd.data,
      key,
      labels: cmd.labels,
      noun,
      parserId,
      verb,
    });

    this.logger.debug({ data: mapToDict(cmd.data), fragment }, 'creating fragment for later completion');

    // @TODO: send this message elsewhere (not a direct reply)
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `${fragment.id} (${key}): ${msg}`));
  }

  public async updateFragment(cmd: Command): Promise<void> {
    const id = cmd.getHead('id');
    this.logger.debug({ id }, 'getting fragment to complete');

    const fragment = await this.fragmentRepository.findOne({
      id,
    });

    if (isNil(fragment)) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'fragment not found'));
      return;
    }

    this.logger.debug({ fragment }, 'attempting to complete fragment');

    try {
      this.logger.debug({ parserId: fragment.parserId }, 'getting parser for fragment');
      const parser = this.bot.getService<Parser>(fragment.parserId);
      const value = cmd.get('next');
      const commands = await parser.complete(cmd.context, fragment, value);
      await this.bot.emitCommand(...commands);
    } catch (err) {
      this.logger.error(err, 'error completing fragment');
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'error completing fragment'));
    }
  }
}

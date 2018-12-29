import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { Parser } from 'src/parser/Parser';
import { mapToDict } from 'src/utils/Map';

export const NOUN_FRAGMENT = 'fragment';

export type CompletionControllerData = any;
export type CompletionControllerOptions = ControllerOptions<CompletionControllerData>;

@Inject('storage')
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

    this.logger.debug({ fragment, parserId: fragment.parserId }, 'attempting to complete fragment');

    try {
      const parser = this.services.getService<Parser>({ id: fragment.parserId });
      const value = cmd.get('next');
      const commands = await parser.complete(cmd.context, fragment, value);

      // the commands have been completed (or additional completions issued), so even if they fail,
      // the previous fragment should be cleaned up. If parsing fails, the fragment should not be
      // cleaned up.
      await this.fragmentRepository.delete(fragment.id);
      await this.bot.executeCommand(...commands);
    } catch (err) {
      this.logger.error(err, 'error completing fragment');
      return this.reply(cmd.context, 'error completing fragment');
    }
  }
}

export function createCompletion(cmd: Command, key: string, msg: string): Command {
  if (!cmd.context.parser) {
    throw new InvalidArgumentError('command has no parser to prompt for completion');
  }

  const existingData = mapToDict(cmd.data);
  return new Command({
    context: cmd.context,
    data: {
      ...existingData,
      key: [key],
      msg: [msg],
      noun: [cmd.noun],
      parser: [cmd.context.parser.id],
      verb: [cmd.verb],
    },
    labels: {},
    noun: NOUN_FRAGMENT,
    verb: CommandVerb.Create,
  });
}

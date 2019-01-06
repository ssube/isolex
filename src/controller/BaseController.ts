import { isNil, isString } from 'lodash';
import { Inject, MissingValueError } from 'noicejs';

import { BotService, INJECT_LOCALE } from 'src/BotService';
import { getHandlerOptions, HandlerOptions } from 'src/controller';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { User } from 'src/entity/auth/User';
import { Command } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Listener } from 'src/listener/Listener';
import { ServiceModule } from 'src/module/ServiceModule';
import { ServiceDefinition } from 'src/Service';
import { applyTransforms } from 'src/transform/helpers';
import { Transform, TransformData } from 'src/transform/Transform';
import { doesExist, getMethods, mustExist } from 'src/utils';
import { Locale } from 'src/utils/Locale';
import { TYPE_JSON, TYPE_TEXT } from 'src/utils/Mime';
import { TemplateScope } from 'src/utils/Template';

export type HandlerMethod = (this: BaseController<ControllerData>, cmd: Command, ctx: Context) => Promise<void>;
export type BaseControllerOptions<TData extends ControllerData> = ControllerOptions<TData>;

export enum ErrorReplyType {
  EntityExists = 'entity-exists',
  EntityMissing = 'entity-missing',
  GrantMissing = 'grant-missing',
  InvalidNoun = 'invalid-noun',
  InvalidVerb = 'invalid-verb',
  SessionExists = 'session-exists',
  SessionMissing = 'session-missing',
  Unknown = 'unknown',
}

@Inject('services', INJECT_LOCALE)
export abstract class BaseController<TData extends ControllerData> extends BotService<TData> implements Controller {
  protected readonly nouns: Set<string>;

  // services
  protected readonly locale: Locale;
  protected readonly services: ServiceModule;
  protected readonly transforms: Array<Transform>;

  constructor(options: BaseControllerOptions<TData>, schemaPath: string, nouns: Array<string> = []) {
    super(options, schemaPath);

    this.locale = options[INJECT_LOCALE];
    this.nouns = new Set(nouns);
    this.services = options.services;
    this.transforms = [];
  }

  public async start() {
    await super.start();

    const transforms: Array<ServiceDefinition<TransformData>> = this.data.transforms;
    for (const def of transforms) {
      const transform = await this.services.createService<Transform, TransformData>(def);
      this.transforms.push(transform);
    }
  }

  public async check(cmd: Command): Promise<boolean> {
    this.logger.debug({ controllerId: this.id, noun: cmd.noun, verb: cmd.verb }, 'checking command');

    if (!this.nouns.has(cmd.noun)) {
      this.logger.debug({ noun: cmd.noun }, 'command noun not present');
      return false;
    }

    if (!await this.checkFilters(cmd, this.filters)) {
      this.logger.debug('command failed filters');
      return false;
    }

    this.logger.debug({ cmd }, 'controller can handle command');
    return true;
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'finding handler method for command');

    for (const method of getMethods(this)) {
      const options = getHandlerOptions(method);
      if (isNil(options)) {
        continue;
      }

      this.logger.debug({ cmd, options }, 'checking potential handler method');
      if (!this.checkCommand(cmd, options)) {
        continue;
      }

      this.logger.debug({ method: method.name, options }, 'found matching handler method');
      return this.invokeHandler(cmd, options, method as HandlerMethod);
    }

    this.logger.warn({ cmd }, 'no handler method for command');
  }

  protected checkCommand(cmd: Command, options: HandlerOptions): boolean {
    return cmd.noun === options.noun && cmd.verb === options.verb;
  }

  protected async invokeHandler(cmd: Command, options: HandlerOptions, handler: HandlerMethod): Promise<void> {
    const ctx = mustExist(cmd.context);
    if (doesExist(options.rbac)) {
      if (options.rbac.user === true && isNil(ctx.user)) {
        return this.errorReply(ctx, ErrorReplyType.SessionMissing);
      }

      const grants = [];
      if (Array.isArray(options.rbac.grants)) {
        grants.push(...options.rbac.grants);
      }

      if (options.rbac.defaultGrant === true) {
        grants.push(`${options.noun}:${options.verb}`);
      }

      if (!ctx.checkGrants(grants)) {
        return this.errorReply(ctx, ErrorReplyType.GrantMissing);
      }
    }

    try {
      await handler.call(this, cmd, ctx);
    } catch (err) {
      this.logger.error(err, 'error during handler method');
      return this.errorReply(ctx, ErrorReplyType.Unknown, err.message);
    }
  }

  protected async transform(cmd: Command, type: string, body: TemplateScope): Promise<TemplateScope> {
    return applyTransforms(this.transforms, cmd, type, body);
  }

  protected async transformJSON(cmd: Command, data: TemplateScope): Promise<void> {
    this.logger.debug({ data }, 'transforming json body');

    const body = await this.transform(cmd, TYPE_JSON, data);

    if (isString(body)) {
      return this.reply(mustExist(cmd.context), body);
    } else {
      this.logger.error({ body }, 'final transform did not return a string');
    }
  }

  protected async errorReply(ctx: Context, errCode: ErrorReplyType, msg?: string): Promise<void> {
    switch (errCode) {
      case ErrorReplyType.GrantMissing:
        return this.reply(ctx, this.locale.translate('error.grant.missing'));
      case ErrorReplyType.SessionMissing:
        return this.reply(ctx, this.locale.translate('error.session.missing'));
      default:
        return this.reply(ctx, `${errCode} error: ${msg}`);
    }
  }

  protected async reply(ctx: Context, body: string): Promise<void> {
    await this.bot.sendMessage(Message.reply(ctx, TYPE_TEXT, body));
  }

  protected getSourceOrFail(ctx: Context): Listener {
    const source = ctx.source;
    if (isNil(source)) {
      throw new MissingValueError('context source must not be nil');
    }
    return source;
  }

  protected getUserOrFail(ctx: Context): User {
    const user = ctx.user;
    if (isNil(user)) {
      throw new MissingValueError('context user must not be nil');
    }
    return user;
  }
}

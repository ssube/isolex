import { isNil, isString } from 'lodash';
import { BaseError } from 'noicejs';

import { NOUN_FRAGMENT } from 'src/controller/CompletionController';
import { Command, CommandVerb } from 'src/entity/Command';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { Schema } from 'src/schema';
import { mapToDict } from 'src/utils/Map';
import { isNumber } from 'util';

export function createCompletion(cmd: Command, key: string, msg: string): Command {
  if (isNil(cmd.context.parser)) {
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

type CollectData = number | string | Array<string>;

interface CollectFields {
  [key: string]: CollectData;
}

interface CollectInputKey<TData extends CollectData> {
  default: TData;
  prompt: string;
  required: boolean;
}

type CollectInput<TData extends CollectFields> = {
  [K in keyof TData]: CollectInputKey<TData[K]>;
};

interface CompleteCollectResult<TData> {
  complete: true;
  data: TData;
}

interface IncompleteCollectResult<TData> {
  complete: false;
  fragment: Command;
}

type CollectResult<TData> = CompleteCollectResult<TData> | IncompleteCollectResult<TData>;

export function collectOrComplete<TData extends CollectFields>(cmd: Command, fields: CollectInput<TData>): CollectResult<TData> {
  const results = new Map<string, CollectData>();
  for (const [key, def] of Object.entries(fields)) {
    const exists = cmd.has(key);
    if (def.required && !exists) {
      return {
        complete: false,
        fragment: createCompletion(cmd, key, def.prompt),
      };
    }

    if (exists) {
      const value = cmd.get(key);
      const coerced = collectValue(value, def.default);
      if (isNil(coerced)) {
        return {
          complete: false,
          fragment: createCompletion(cmd, key, def.prompt),
        };
      }
      results.set(key, coerced);
    } else {
      results.set(key, def.default);
    }
  }

  return {
    complete: true,
    data: mapToDict(results) as TData,
  };
}

export function collectValue(value: CollectData, defaultValue: CollectData): CollectData | undefined {
  const schema = new Schema({
    properties: {
      value: buildValueSchema(defaultValue),
    },
    required: ['value'],
    type: 'object',
  });

  const coercedValue = { value };
  if (schema.match(coercedValue)) {
    return coercedValue.value;
  } else {
    throw new BaseError('value type error');
  }
}

export function buildValueSchema(defaultValue: CollectData) {
  if (Array.isArray(defaultValue)) {
    return {
      type: 'array',
      items: {
        default: defaultValue[0],
        type: 'string',
      },
    };
  }

  if (isString(defaultValue)) {
    return {
      default: defaultValue,
      type: 'string',
    };
  }

  if (isNumber(defaultValue)) {
    return {
      default: defaultValue,
      type: 'number',
    };
  }

  return {
    type: 'null',
  };
}

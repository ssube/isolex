import { isNil, isString } from 'lodash';
import { BaseError } from 'noicejs';
import { isNumber } from 'util';

import { NOUN_FRAGMENT } from 'src/controller/CompletionController';
import { Command, CommandVerb } from 'src/entity/Command';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { Schema } from 'src/schema';
import { Dict, mapToDict, dictToMap } from 'src/utils/Map';

export function createCompletion(cmd: Command, key: string, msg: string): Command {
  if (isNil(cmd.context.parser)) {
    throw new InvalidArgumentError('command has no parser to prompt for completion');
  }

  const existingData = mapToDict(cmd.data);
  const fragment = new Command();
  fragment.context = cmd.context;
  fragment.data = dictToMap({
      ...existingData,
      key: [key],
      msg: [msg],
      noun: [cmd.noun],
      parser: [cmd.context.parser.id],
      verb: [cmd.verb],
  });
  fragment.noun = NOUN_FRAGMENT;
  fragment.verb = CommandVerb.Create;
  return fragment;
}

type CollectData = number | string | Array<string>;

interface CollectKey<TData> {
  default: TData;
  prompt: string;
  required: boolean;
}

type CollectInput<TData extends Dict<CollectData>> = {
  [K in keyof TData]: CollectKey<TData[K]>;
};

interface CompleteCollectResult<TData> {
  complete: true;
  data: TData;
}

interface IncompleteCollectResult {
  complete: false;
  fragment: Command;
}

export type CollectResult<TData> = CompleteCollectResult<TData> | IncompleteCollectResult;

export function collectOrComplete<TData extends Dict<CollectData>>(cmd: Command, fields: CollectInput<TData>): CollectResult<TData> {
  const results = new Map<string, CollectData>();
  for (const [key, def] of Object.entries(fields)) {
    const exists = cmd.has(key);

    if (exists) {
      const coerced = collectValue(cmd.get(key), def.default);
      results.set(key, coerced);
      continue;
    }

    if (def.required) {
      return {
        complete: false,
        fragment: createCompletion(cmd, key, def.prompt),
      };
    }

    results.set(key, def.default);
  }

  return {
    complete: true,
    data: mapToDict(results) as TData,
  };
}

export function collectValue(value: CollectData, defaultValue: CollectData): CollectData {
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
      items: {
        default: defaultValue[0],
        type: 'string',
      },
      type: 'array',
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

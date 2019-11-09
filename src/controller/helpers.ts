import { isNumber, isString } from 'lodash';
import { BaseError } from 'noicejs';

import { Command, CommandOptions, CommandVerb } from '../entity/Command';
import { Parser } from '../parser';
import { Schema } from '../schema';
import { mustExist } from '../utils';
import { Dict, makeDict, makeMap } from '../utils/Map';
import { NOUN_FRAGMENT } from './CompletionController';

export function createCommandCompletion(cmd: Command, key: string, msg: string): Command {
  const ctx = mustExist(cmd.context);
  const parser = mustExist(ctx.parser);
  return createCompletion(cmd, key, msg, parser);
}

export function createCompletion(cmd: CommandOptions, key: string, msg: string, parser: Parser): Command {
  const existingData = makeDict(cmd.data);
  const data = makeMap({
    ...existingData,
    key: [key],
    msg: [msg],
    noun: [cmd.noun],
    parser: [parser.id],
    verb: [cmd.verb],
  });
  return new Command({
    context: cmd.context,
    data,
    labels: cmd.labels,
    noun: NOUN_FRAGMENT,
    verb: CommandVerb.Create,
  });
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
        fragment: createCommandCompletion(cmd, key, def.prompt),
      };
    }

    results.set(key, def.default);
  }

  return {
    complete: true,
    data: makeDict(results) as TData,
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
  const result = schema.match(coercedValue);
  if (result.valid) {
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

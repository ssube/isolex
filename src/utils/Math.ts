import { isNil } from 'lodash';
import {
  all as allFactories,
  ConfigOptions,
  create as createMath,
  format as mathFormat,
  FormatOptions,
  MathJsStatic,
  MathNode,
  typeOf as mathTypeOf,
} from 'mathjs';

import { TemplateScope } from './Template';

export interface MathCreate {
  create(options: math.ConfigOptions): MathJsStatic;
}

export interface ResultSet {
  entries: Array<string>;
}

export type ResultFormatBoolean = 'keep' | 'hide';

export interface ResultFormatOptions {
  list: {
    join: string;
  };
  number: FormatOptions;
  node: {
    implicit: ResultFormatBoolean;
    parenthesis: ResultFormatBoolean;
  };
}

export function formatResult(body: unknown, scope: TemplateScope, options: ResultFormatOptions): string {
  if (isNil(body)) {
    return 'nil result';
  }

  const type = mathTypeOf(body);
  switch (type) {
    case 'boolean':
    case 'number':
    case 'string':
      return String(body);
    case 'Date':
      return (body as Date).toString();
    case 'Array':
      return (body as Array<unknown>).map((it) => formatResult(it, scope, options)).join(options.list.join);
    case 'Object':
      return JSON.stringify(body);
    case 'RegExp':
      return 'regexp';
    case 'BigNumber':
    case 'Complex':
    case 'Fraction':
    case 'Matrix':
    case 'Range':
    case 'Unit':
      return mathFormat(body, options.number);
    case 'ResultSet':
      return formatResult((body as ResultSet).entries, scope, options);
    case 'AccessorNode':
    case 'ArrayNode':
    case 'AssignmentNode':
    case 'BlockNode':
    case 'ConditionalNode':
    case 'ConstantNode':
    case 'FunctionAssignmentNode':
    case 'FunctionNode':
    case 'IndexNode':
    case 'ObjectNode':
    case 'OperatorNode':
    case 'ParenthesisNode':
    case 'RangeNode':
    case 'SymbolNode':
      return (body as MathNode).toString(options.node);
    default:
      return `unknown result type: ${JSON.stringify(body)}`;
  }
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

/**
 * Since each user needs to create a math environment with typed options, the container needs to inject an instance of
 * something (this).
 */
export class MathFactory {
  public create(options: ConfigOptions): MathJsStatic {
    return createMath(allFactories, options) as MathJsStatic;
  }
}

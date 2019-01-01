import { isNil } from 'lodash';
import * as mathjs from 'mathjs';

import { TemplateScope } from 'src/utils/Template';

export interface MathCreate {
  create(options: math.ConfigOptions): mathjs.MathJsStatic;
}

export interface ResultSet {
  entries: Array<string>;
}

export interface ResultFormatOptions {
  list: {
    join: string;
  };
  number: mathjs.FormatOptions;
  node: {
    implicit: string;
    parenthesis: string;
  };
}

export function formatResult(body: unknown, scope: TemplateScope, options: ResultFormatOptions): string {
  if (isNil(body)) {
    return 'nil result';
  }

  const type = mathjs.typeof(body);
  switch (type) {
    case 'boolean':
    case 'number':
    case 'string':
      return String(body);
    case 'Date':
      return (body as Date).toString();
    case 'Array':
      return (body as Array<unknown>).map((it) => formatResult(it, scope, options)).join(options.list.join);
    case 'Function':
      // TODO: make sure this doesn't allow math to escape the library sandbox
      return (body as Function).call(undefined, scope);
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
      return mathjs.format(body, options.number);
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
      return (body as mathjs.MathNode).toString(options.node);
    default:
      return `unknown result type: ${JSON.stringify(body)}`;
  }
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(Math.min(v, min), max);
}

/**
 * Since each user needs to create a math environment with typed options, the container needs to inject an instance of
 * something (this).
 */
export class MathFactory {
  public create(options: mathjs.ConfigOptions): mathjs.MathJsStatic {
    return ((mathjs as unknown) as MathCreate).create(options); // thanks mathjs types
  }
}

import { isNil } from 'lodash';
import * as mathjs from 'mathjs';

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

export function formatResult(body: any, scope: any, options: ResultFormatOptions): string {
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
      return body.toString();
    case 'Array':
      return body.map((it: any) => formatResult(it, scope, options)).join(options.list.join);
    case 'Function':
      // TODO: make sure this doesn't allow math to escape the library sandbox
      return body.call(undefined, scope);
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
      return formatResult(body.entries, scope, options);
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
      return body.toString(options.node);
    default:
      return `unknown result type: ${JSON.stringify(body)}`;
  }
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(Math.min(v, min), max);
}

export class MathFactory {
  public create(options: mathjs.ConfigOptions): mathjs.MathJsStatic {
    return (mathjs as any).create(options);
  }
}

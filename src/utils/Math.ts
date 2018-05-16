import * as mathjs from 'mathjs';

export interface ResultFormatOptions {
  list: {
    join: string;
  };
  number: {
    fraction: string;
    notation: string;
    precision: number;
  };
  node: {
    implicit: string;
    parenthesis: string;
  }
}

export function formatResult(body: any, scope: any, options: ResultFormatOptions): string {
  switch (mathjs.typeof(body)) {
    case 'null':
      return 'null';
    case 'boolean':
    case 'number':
    case 'string':
      return String(body);
    case 'Date':
      return body.toString();
    case 'Array':
      return body.map((it: any) => formatResult(it, scope, options)).join(options.list.join);
    case 'Function':
      return body.call(undefined, scope);
    case 'Object':
      return JSON.stringify(body);
    case 'RegExp':
      return 'regexp';
    case 'undefined':
      return 'undefined';
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

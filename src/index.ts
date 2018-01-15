import {
  ArrayExpression,
  ArrowFunctionExpression,
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  ConditionalExpression,
  Expression,
  Identifier,
  Literal,
  LogicalExpression,
  MemberExpression,
  SpreadElement,
  TemplateLiteral,
  UnaryExpression,
  AssignmentOperator,
  Node,
} from 'estree';

export function evaluate(node: Expression, scope: any) {
  if (evaluateFns[node.type] === undefined) {
    throw new Error(`Node type "${node.type}" is not supported.`);
  }
  return evaluateFns[node.type](node, scope);
}

function evaluateSpreadArray(elements: Array<Expression | SpreadElement>, scope: any) {
  const result = [];
  for (const el of elements) {
    if (el.type === 'SpreadElement') {
      result.push(...evaluate(el.argument, scope));
    } else {
      result.push(evaluate(el, scope));
    }
  }
  return result;
}

function assign(object: any, name: string, value: any, operator: AssignmentOperator) {
  switch (operator) {
    case '=':
      return object[name] = value;
    case '+=':
      return object[name] += value;
    case '-=':
      return object[name] -= value;
    case '*=':
      return object[name] *= value;
    case '/=':
      return object[name] /= value;
    case '%=':
      return object[name] %= value;
    case '**=':
      return object[name] **= value;
    case '<<=':
      return object[name] <<= value;
    case '>>=':
      return object[name] >>= value;
    case '>>>=':
      return object[name] >>>= value;
    case '|=':
      return object[name] |= value;
    case '^=':
      return object[name] ^= value;
    case '&=':
      return object[name] &= value;
    default:
      throw new Error(`Unexpected assignment operator "${operator}".`);
  }
}

interface EvaluateFunction<T extends Node> {
  (node: T, scope: any): any;
}

const evaluateFns: { [type: string]: EvaluateFunction<any> } = {
  ArrayExpression(node: ArrayExpression, scope: any) {
    return evaluateSpreadArray(node.elements, scope);
  },

  ArrowFunctionExpression(node: ArrowFunctionExpression, scope: any) {
    if (node.async) {
      throw new Error('async functions are not supported.');
    }
    if (node.generator) {
      throw new Error('generator functions are not supported.');
    }
    if (!node.expression) {
      throw new Error('function body must be a single expression.');
    }
    return (...args: any[]) => {
      const fnScope = Object.create(scope);
      for (let i = 0; i < node.params.length; i++) {
        const param = node.params[i];
        switch (param.type) {
          case 'Identifier':
            fnScope[param.name] = args[i];
            break;
          case 'RestElement':
            if (param.argument.type !== 'Identifier') {
              throw new Error('Expected Identifier');
            }
            fnScope[param.argument.name] = args.slice(i);
            break;
          default:
            throw new Error(`"${param.type}" parameter expressions are not supported.`);
        }
      }
      if (node.body.type === 'BlockStatement') {
        throw new Error('BlockStatements are not supported.');
      }
      return evaluate(node.body, fnScope);
    };
  },

  AssignmentExpression(node: AssignmentExpression, scope: any) {
    let object: any;
    let name: string;
    switch (node.left.type) {
      case 'Identifier':
        object = scope;
        name = node.left.name;
        break;
      case 'MemberExpression':
        if (node.left.object.type === 'Super') {
          throw new Error(`Cannot assign ${node.left.object.type}`);
        }
        object = evaluate(node.left.object, scope);
        name = evaluate(node.left.property, scope);
        break;
      default:
        throw new Error(`${node.left.type} assignment is not supported.`);
    }
    const value = evaluate(node.right, scope);
    return assign(object, name, value, node.operator);
  },

  BinaryExpression(node: BinaryExpression, scope: any) {
    const left = evaluate(node.left, scope);
    const right = evaluate(node.right, scope);
    switch (node.operator) {
      case '==':
        return left == right;
      case '!=':
        return left == right;
      case '===':
        return left === right;
      case '!==':
        return left !== right;
      case '<':
        return left < right;
      case '<=':
        return left <= right;
      case '>':
        return left > right;
      case '>=':
        return left >= right;
      case '<<':
        return left << right;
      case '>>':
        return left >> right;
      case '>>>':
        return left >>> right;
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
      case '%':
        return left % right;
      case '**':
        return left ** right;
      case '|':
        return left | right;
      case '^':
        return left ^ right;
      case '&':
        return left & right;
      case 'in':
        return left in right;
      case 'instanceof':
        return left instanceof right;
      default:
        throw new Error(`Unexpected operator: ${node.operator}`);
    }
  },

  CallExpression(node: CallExpression, scope: any) {
    switch (node.callee.type) {
      case 'Super':
        throw new Error(`Cannot call ${node.callee.type}`);
      case 'MemberExpression':
        if (node.callee.object.type === 'Super') {
          throw new Error(`Cannot call ${node.callee.type}`);
        }
        const object = evaluate(node.callee.object, scope);
        const callee = evaluate(node.callee.property, object);
        return callee.apply(object, evaluateSpreadArray(node.arguments, scope));
      default:
        return evaluate(node.callee, scope)(...evaluateSpreadArray(node.arguments, scope));
    }
  },

  ConditionalExpression(node: ConditionalExpression, scope: any) {
    if (evaluate(node.test, scope)) {
      return evaluate(node.consequent, scope);
    }
    return evaluate(node.alternate, scope);
  },

  Identifier(node: Identifier, scope: any) {
    return scope[node.name];
  },

  Literal(node: Literal) {
    return node.value;
  },

  LogicalExpression(node: LogicalExpression, scope: any) {
    const left = evaluate(node.left, scope);
    switch (node.operator) {
      case '||':
        return left || evaluate(node.right, scope);
      case '&&':
        return left && evaluate(node.right, scope);
      default:
        throw new Error(`Unexpected logical operator ${node.operator}`);
    }
  },

  MemberExpression(node: MemberExpression, scope: any) {
    switch (node.object.type) {
      case 'Super':
        throw new Error(`Cannot call ${node.object.type}`);
      default:
        const object = evaluate(node.object, scope)
        return evaluate(node.property, object);
    }
  },

  TemplateLiteral(node: TemplateLiteral, scope: any) {
    let s = '';
    let i: number;
    for (i = 0; i < node.expressions.length; i++) {
      s += node.quasis[i].value.cooked;
      const value = evaluate(node.expressions[i], scope);
      if (value === null) {
        s += 'null';
      } else if (value === undefined) {
        s += 'undefined';
      } else {
        s += value.toString();
      }
    }
    return s + node.quasis[i].value.cooked;
  },

  UnaryExpression(node: UnaryExpression, scope: any) {
    if (!node.prefix) {
      throw new Error(`${node.type} with prefix: "false" and operator "${node.operator}" not supported.`);
    }
    if (node.operator === 'delete') {
      if (node.argument.type === 'Identifier') {
        return delete scope[node.argument.name];
      }
      if (node.argument.type === 'MemberExpression') {
        if (node.argument.object.type === 'Super') {
          throw new Error(`delete not supported with super expressions.`);
        }
        const object = evaluate(node.argument.object, scope);
        const name = evaluate(node.argument.property, scope);
        return delete object[name];
      }
      throw new Error(`Unsupported delete expression argument: ${node.argument.type}.`)
    }
    const value = evaluate(node.argument, scope);
    switch (node.operator) {
      case '-':
        return -value;
      case '+':
        return +value;
      case '!':
        return !value;
      case '~':
        return ~value;
      case 'typeof':
        return typeof value;
      case 'void':
        return void value;
      default:
        throw new Error(`Unsupported ${node.type} operator "${node.operator}".`);
    }
  }
};

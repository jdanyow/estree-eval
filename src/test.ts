import { deepStrictEqual, strictEqual } from 'assert';
import { parseExpressionAt } from 'acorn';
import { evaluate } from './index';

function parse(expression: string) {
  return parseExpressionAt(expression, 0);
}

strictEqual(evaluate(parse('1 === 0'), {}), false);
strictEqual(evaluate(parse('0 === 0'), {}), true);
strictEqual(evaluate(parse('1 !== 0'), {}), true);
strictEqual(evaluate(parse('0 == "0"'), {}), true);
strictEqual(evaluate(parse('1 === 0'), {}), false);
strictEqual(evaluate(parse('0 === 0'), {}), true);
deepStrictEqual(evaluate(parse('[]'), {}), []);
deepStrictEqual(evaluate(parse('[1, 2, 3]'), {}), [1, 2, 3]);
deepStrictEqual(evaluate(parse('[1, 2, 3, ...[4, 5, 6]]'), {}), [1, 2, 3, 4, 5, 6]);
strictEqual(evaluate(parse('a.length'), { a: 'xyz' }), 3);
strictEqual(evaluate(parse('a.toString(2)'), { a: 8 }), '1000');
strictEqual(evaluate(parse('a.toString(...[2])'), { a: 8 }), '1000');
strictEqual(evaluate(parse('/abc/.test(\'abcdefg\')'), {}), true);
strictEqual(evaluate(parse('!false'), {}), true);
deepStrictEqual(evaluate(parse('[1, 2, 3].map(x => x * x)'), {}), [1, 4, 9]);
strictEqual(evaluate(parse('void true'), {}), undefined);
strictEqual(evaluate(parse('delete a'), { a: { b: 0 } }), true);
strictEqual(evaluate(parse('delete a.b'), { a: { b: 0 } }), true);
strictEqual(evaluate(parse('`hello ${x}!`'), { x: 'world' }), 'hello world!');
strictEqual(evaluate(parse('`hello ${x}!`'), { x: null }), 'hello null!');
strictEqual(evaluate(parse('`hello ${x}!`'), {}), 'hello undefined!');
strictEqual(evaluate(parse('true || false'), {}), true);
strictEqual(evaluate(parse('true ? 1 : 0'), {}), 1);
strictEqual(evaluate(parse('false ? 1 : 0'), {}), 0);
strictEqual(evaluate(parse('(false || true) && (false || true)'), {}), true);
strictEqual(evaluate(parse('a = 1'), {}), 1);
strictEqual(evaluate(parse('a += 1'), { a: 1 }), 2);
// deepStrictEqual(evaluate(parse('{ a, b, c } = x'), { x: { a: 1, b: 2, c: 3 } }), { a: 1, b: 2, c: 3 });

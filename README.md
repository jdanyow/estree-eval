# estree-eval

[![Appveyor Build status](https://ci.appveyor.com/api/projects/status/github/jdanyow/estree-eval?svg=true)](https://ci.appveyor.com/project/jdanyow/estree-eval)
[![npm package](https://img.shields.io/npm/v/estree-eval.svg)](https://www.npmjs.com/package/estree-eval)
[![Greenkeeper badge](https://badges.greenkeeper.io/jdanyow/estree-eval.svg)](https://greenkeeper.io/)

Evaluate estrees:

```js
import { evaluate } from 'estree-eval';
import { parseExpressionAt } from 'acorn';

const ast = parseExpressionAt('message.toUpperCase()', 0);

const scope = { message: 'hello world' };

const result = evaluate(ast, scope); // HELLO WORLD
```

[Try this package](https://runkit.com/jdanyow/estree-eval) in your browser using runkit.

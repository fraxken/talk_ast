"use strict";

// Require Third-party Dependencies
import { ESTree, Helpers, VarDeclaration } from "node-estree";
import * as astring from "astring";

// const log = (body) => ESTree.CallExpression(Helpers.AutoChainStr("console.log"), body);
const log = (log) => Helpers.AutoChainStr("console.log()", { log });
const callFn = (id: string, value: ESTree.LiteralValue) => ESTree.CallExpression(ESTree.Identifier(id), [ESTree.Literal(value)])

function* program(): IterableIterator<ESTree.ProgramBodyItem> {
  {
    const returnArrow = ESTree.ReturnStatement(
      ESTree.ArrowFunctionExpression(ESTree.BinaryExpression("+", ESTree.Identifier("a"), ESTree.Identifier("b")), {
        async: false,
        expression: false,
        generator: false,
        params: [ESTree.Identifier("b")]
      })
    );

    yield ESTree.FunctionDeclaration(ESTree.Identifier("add"), {
      async: false,
      generator: false,
      body: ESTree.BlockStatement([returnArrow]),
      params: [
        ESTree.AssignmentPattern(ESTree.Identifier("a"), ESTree.Literal(1))
      ]
    });
  }

  yield VarDeclaration.const("add10", callFn("add", 10));

  yield ESTree.ExpressionStatement(log([
    callFn("add10", 5)
  ]));
}

const prog = ESTree.Program("module", [...program()]);

// console.log(JSON.stringify(prog, null, 2));
console.log(astring.generate(prog));

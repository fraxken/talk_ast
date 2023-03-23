"use strict";

// Require Node.js Dependencies
import fs from "fs";
import path from "path";

// Require Third-party Dependencies
import { ESTree } from "node-estree";
import { walk } from "estree-walker";
import * as meriyah from "meriyah";
import * as astring from "astring";
import kleur from "kleur";

const strToAnalyze = fs.readFileSync(path.join(__dirname, "..", "codes", "exemple.js"), "utf-8");
const { body } = meriyah.parseScript(strToAnalyze, {
  next: true, loc: true, raw: true, module: false
});

interface props {
  kind: ESTree.VariableKind,
  const: boolean,
  used: boolean
}
const identifiers = new Map<string, props>();

function updateId(id: ESTree.Identifier, properties: Partial<props>): void {
  const registryId = identifiers.get(id.name);
  if (typeof registryId === "undefined") {
    return;
  }

  for (const [key, value] of Object.entries(properties)) {
    registryId[key] = value;
  }
}

function* getIdentifiersDeclarator(declarations: ESTree.VariableDeclarator[]): IterableIterator<[ESTree.Identifier, number]> {
  for (let i = 0; i < declarations.length; i++) {
    const declarator = declarations[i];
    if (declarator.id.type === "Identifier") {
      const id = declarator.id as ESTree.Identifier;

      yield [id, i];
    }
  }
}

// Nous recherchons divers informations sur les identifiers dans le code
walk(body, {
  enter(node, parent) {
    if (node.type === "VariableDeclaration") {
      const { declarations, kind } = node as ESTree.VariableDeclaration;

      for (const [id] of getIdentifiersDeclarator(declarations)) {
        identifiers.set(id.name, { kind, const: true, used: false });
      }
    }
    else if (node.type === "AssignmentExpression") {
      const assignExpr = node as ESTree.AssignmentExpression;
      if (assignExpr.left.type === "Identifier") {
        updateId(assignExpr.left as ESTree.Identifier, { used: true, const: false });
      }

      this.skip();
    }
    else if (node.type === "Identifier" && parent.type !== "VariableDeclarator") {
      updateId(node as ESTree.Identifier, { used: true });
    }
  }
});

// Log des informations récupérés!
console.log(identifiers);
console.log("");

walk(body, {
  enter(node) {
    if (node.type !== "VariableDeclaration") {
      return;
    }

    const varDeclaration = node as ESTree.VariableDeclaration;
    const ids = [...getIdentifiersDeclarator(varDeclaration.declarations)]
      .map(([id]) => identifiers.get(id.name));

    const used = ids.some((id) => id?.used);
    if (used) {
      varDeclaration.kind = ids.every((id) => id?.const) ? "const" : "let";

      return this.skip();
    }

    return this.remove();
  }
});

const transformedBody = body.filter((line) => typeof line !== "undefined");
const code = astring.generate(ESTree.Program("script", transformedBody as any));
console.log(kleur.yellow().bold(code));

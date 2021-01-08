"use strict";

// Require Node.js Dependencies
import fs from "fs";
import path from "path";

// Require Third-party Dependencies
import { walk } from "estree-walker";
import * as meriyah from "meriyah";

const strToAnalyze = fs.readFileSync(
    path.join(__dirname, "..", "codes", "exemple.js"), "utf-8");

const { body } = meriyah.parseScript(strToAnalyze, {
    next: true, loc: true, raw: true, module: false
});

const identifiersName = new Set();

walk(body, {
    enter(node, parent) {
        if (node.type === "Identifier") {
            identifiersName.add(node.name);
        }
        // console.log(node);
        // console.log(parent);
        // console.log("--------------");
    }
});

console.log(identifiersName);

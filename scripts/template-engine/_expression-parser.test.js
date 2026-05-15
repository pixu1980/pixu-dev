// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  evaluateCondition,
  evaluateExpression,
  isJavaScriptExpression,
  parseExpression,
} from "./_expression-parser.js";

test("expression parser handles filters, arguments, and JavaScript expressions", () => {
  assert.deepEqual(
    parseExpression("title | truncate:4 | upper").filters.map((filter) => filter.name),
    ["truncate", "upper"],
  );
  assert.deepEqual(parseExpression("title | truncate(4, 'x')").filters[0].args, [4, "x"]);
  assert.equal(isJavaScriptExpression("items.length > 0"), true);
  assert.equal(parseExpression("items.length > 0").jsExpression, "items.length > 0");
});

test("expression evaluator resolves paths, filters, pipes in JS, math, and conditions", () => {
  const filters = { upper: (value) => String(value).toUpperCase() };
  const data = { title: "hello", items: ["a"], count: 2 };

  assert.equal(evaluateExpression(parseExpression("title | upper"), data, filters), "HELLO");
  assert.equal(evaluateExpression(parseExpression("count + 2"), data, filters), 4);
  assert.equal(evaluateCondition("items.length > 0", data), true);
});

import assert from "node:assert/strict";
import test from "node:test";
import { evaluateEssayFixture, summarizeEssayEval } from "../lib/evals/essayAutoresearch";
import { essayAutoresearchFixtures } from "./autoresearch-fixtures";

test("autoresearch essay eval passes grounded synthetic essay", () => {
  const result = evaluateEssayFixture(essayAutoresearchFixtures[0]);
  assert.equal(result.status, "pass");
  assert.equal(result.forbiddenClaimsFound.length, 0);
  assert.equal(result.missingRequiredIdeas.length, 0);
});

test("autoresearch essay eval catches fabricated and stylistically risky essay", () => {
  const result = evaluateEssayFixture(essayAutoresearchFixtures[1]);
  assert.equal(result.status, "fail");
  assert.equal(result.gates.noForbiddenClaims, false);
  assert.equal(result.gates.noSuspectedTricolon, false);
  assert.ok(result.forbiddenClaimsFound.includes("founded the pantry"));
});

test("autoresearch essay eval summary reports pass and fail counts", () => {
  const results = essayAutoresearchFixtures.map(evaluateEssayFixture);
  const summary = summarizeEssayEval(results);
  assert.equal(summary.fixtures, 2);
  assert.equal(summary.passed, 1);
  assert.equal(summary.failed, 1);
});

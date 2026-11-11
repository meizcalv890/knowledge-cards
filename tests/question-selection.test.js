import test from "node:test";
import assert from "node:assert/strict";
import { selectQuestions } from "../js/question-selection.js";

const pool = Array.from({ length: 30 }, (_, index) => ({
  id: `KC-${String(index + 1).padStart(3, "0")}`,
}));

test("selects unseen questions before previously seen questions", () => {
  const selected = selectQuestions(pool, 5, ["KC-001", "KC-002"], () => 0);
  assert.equal(selected.length, 5);
  assert.ok(selected.every((question) => !["KC-001", "KC-002"].includes(question.id)));
});

test("fills the requested session with seen questions only when needed", () => {
  const seen = pool.slice(0, 28).map((question) => question.id);
  const selected = selectQuestions(pool, 5, seen, () => 0);
  assert.equal(selected.length, 5);
  assert.equal(selected.filter((question) => !seen.includes(question.id)).length, 2);
  assert.equal(new Set(selected.map((question) => question.id)).size, 5);
});

test("starts a new randomized cycle after every question has been seen", () => {
  const seen = pool.map((question) => question.id);
  const selected = selectQuestions(pool, 10, seen, () => 0);
  assert.equal(selected.length, 10);
  assert.equal(new Set(selected.map((question) => question.id)).size, 10);
});

test("never returns duplicate questions and caps at pool size", () => {
  const selected = selectQuestions(pool, 99, [], () => 0);
  assert.equal(selected.length, pool.length);
  assert.equal(new Set(selected.map((question) => question.id)).size, pool.length);
});

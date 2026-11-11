import test from "node:test";
import assert from "node:assert/strict";
import { categories, questions } from "../js/data.js";

test("dataset contains 100 questions in every declared category", () => {
  assert.equal(categories.length, 6);
  assert.equal(questions.length, 600);
  const categoryIds = new Set(categories.map((category) => category.id));
  for (const question of questions) {
    assert.ok(categoryIds.has(question.category), `${question.id}: unknown category`);
  }
});

test("every question has a unique ID and valid difficulty", () => {
  const ids = questions.map((question) => question.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const question of questions) {
    assert.ok(["easy", "medium", "hard"].includes(question.difficulty), question.id);
  }
});

test("every quiz question has four unique options including its answer", () => {
  for (const question of questions) {
    assert.equal(question.options.length, 4, question.id);
    assert.equal(new Set(question.options).size, 4, `${question.id}: duplicate option`);
    assert.ok(
      question.options.includes(question.answer),
      `${question.id}: answer is not exactly present in options`,
    );
    assert.ok(question.question.trim(), `${question.id}: empty question`);
    assert.ok(question.explanation.trim(), `${question.id}: empty explanation`);
  }
});

test("every category has questions at all three difficulty levels", () => {
  for (const category of categories) {
    const inCategory = questions.filter((q) => q.category === category.id);
    assert.ok(inCategory.length >= 50, `${category.id} has fewer than 50 questions`);
    for (const difficulty of ["easy", "medium", "hard"]) {
      assert.ok(
        inCategory.some((q) => q.difficulty === difficulty),
        `${category.id} has no ${difficulty} questions`,
      );
    }
  }
});

test("each category has enough questions for 10, 15, and 20-card sessions", () => {
  for (const category of categories) {
    const count = questions.filter((q) => q.category === category.id).length;
    for (const amount of [10, 15, 20]) {
      assert.ok(count >= amount, `${category.id} cannot fill a ${amount}-question session`);
    }
  }
});

test("every category has a balanced mix of difficulty levels", () => {
  for (const category of categories) {
    const inCategory = questions.filter((q) => q.category === category.id);
    for (const difficulty of ["easy", "medium", "hard"]) {
      assert.ok(
        inCategory.filter((q) => q.difficulty === difficulty).length >= 10,
        `${category.id} has too few ${difficulty} questions`,
      );
    }
  }
});

test("question prompts are unique across the complete dataset", () => {
  const prompts = questions.map((question) => question.question.trim().toLocaleLowerCase("id"));
  assert.equal(new Set(prompts).size, prompts.length, "duplicate question prompts found");
});

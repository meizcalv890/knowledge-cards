import test from "node:test";
import assert from "node:assert/strict";

const STORAGE_KEY = "knowledge-cards-v1";
let store;

globalThis.localStorage = {
  getItem(key) {
    return Object.hasOwn(store, key) ? store[key] : null;
  },
  setItem(key, value) {
    store[key] = String(value);
  },
};

const { loadData, saveData, recordGame } = await import("../js/storage.js");

test.beforeEach(() => {
  store = {};
});

test("loadData returns safe defaults when storage is empty", () => {
  assert.deepEqual(loadData(), {
    gamesPlayed: 0,
    totalPoints: 0,
    bestScore: 0,
    soundEnabled: true,
    history: [],
    seenQuestionIds: [],
  });
});

test("loadData recovers from malformed JSON", () => {
  store[STORAGE_KEY] = "{broken json";
  assert.equal(loadData().gamesPlayed, 0);
});

test("loadData sanitizes invalid saved values", () => {
  store[STORAGE_KEY] = JSON.stringify({
    gamesPlayed: -4,
    totalPoints: "many",
    bestScore: 25,
    soundEnabled: "yes",
    history: "not-an-array",
    seenQuestionIds: ["KC-001", 12, "bad-id", "KC-002", "KC-001"],
  });

  assert.deepEqual(loadData(), {
    gamesPlayed: 0,
    totalPoints: 0,
    bestScore: 25,
    soundEnabled: true,
    history: [],
    seenQuestionIds: ["KC-001", "KC-002"],
  });
});

test("saveData persists normalized data", () => {
  assert.equal(saveData({
    gamesPlayed: 2,
    totalPoints: 30,
    bestScore: 20,
    soundEnabled: false,
    history: [],
    seenQuestionIds: ["KC-004"],
  }), true);
  assert.equal(loadData().soundEnabled, false);
  assert.equal(loadData().totalPoints, 30);
  assert.deepEqual(loadData().seenQuestionIds, ["KC-004"]);
});

test("recordGame updates totals and keeps at most 30 history records", () => {
  const initial = {
    gamesPlayed: 2,
    totalPoints: 20,
    bestScore: 10,
    soundEnabled: true,
    history: Array.from({ length: 30 }, () => ({
      mode: "quiz",
      category: "science",
      score: 1,
      correct: 1,
      total: 1,
      date: new Date().toISOString(),
    })),
  };

  const updated = recordGame(initial, {
    mode: "quiz",
    category: "history",
    score: 30,
    correct: 3,
    total: 5,
    questionIds: ["KC-201", "KC-202"],
  });

  assert.equal(updated.gamesPlayed, 3);
  assert.deepEqual(updated.seenQuestionIds, ["KC-201", "KC-202"]);
  assert.equal(updated.totalPoints, 50);
  assert.equal(updated.bestScore, 30);
  assert.equal(updated.history.length, 30);
  assert.equal(updated.history[0].category, "history");
  assert.equal(loadData().gamesPlayed, 3);
});

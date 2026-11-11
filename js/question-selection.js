/**
 * Select a randomized session, prioritizing questions not completed before.
 * Previously seen questions are used only when the unseen pool is too small
 * to fill the requested session. A session never contains duplicate IDs.
 */
function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function selectQuestions(pool, amount, seenIds = [], random = Math.random) {
  const safeAmount = Math.max(0, Math.min(Number.isFinite(amount) ? Math.floor(amount) : 0, pool.length));
  if (safeAmount === 0) return [];

  const seen = new Set(Array.isArray(seenIds) ? seenIds : []);
  const unseenPool = pool.filter((question) => !seen.has(question.id));
  const seenPool = pool.filter((question) => seen.has(question.id));

  const fresh = shuffle(unseenPool, random).slice(0, safeAmount);
  if (fresh.length === safeAmount) return fresh;

  const needed = safeAmount - fresh.length;
  return [...fresh, ...shuffle(seenPool, random).slice(0, needed)];
}

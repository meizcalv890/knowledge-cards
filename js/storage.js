const STORAGE_KEY = "knowledge-cards-v1";

const defaultData = {
  gamesPlayed: 0,
  totalPoints: 0,
  bestScore: 0,
  soundEnabled: true,
  history: [],
};

export function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...defaultData };

    const parsed = JSON.parse(saved);

    return {
      ...defaultData,
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch (error) {
    console.error("Failed to load saved data:", error);
    return { ...defaultData };
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save data:", error);
    return false;
  }
}

export function recordGame(data, result) {
  const updated = {
    ...data,
    gamesPlayed: data.gamesPlayed + 1,
    totalPoints: data.totalPoints + result.score,
    bestScore: Math.max(data.bestScore, result.score),
    history: [
      {
        mode: result.mode,
        category: result.category,
        score: result.score,
        correct: result.correct,
        total: result.total,
        date: new Date().toISOString(),
      },
      ...data.history,
    ].slice(0, 30),
  };

  saveData(updated);
  return updated;
}

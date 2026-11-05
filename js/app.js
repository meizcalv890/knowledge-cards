import { categories, questions } from "./data.js";
import { loadData, recordGame, saveData } from "./storage.js";

const app = document.querySelector("#app");

let saved = loadData();
let soundEnabled = saved.soundEnabled;

let game = {
  mode: null,
  category: "all",
  difficulty: "all",
  amount: 10,
  cards: [],
  index: 0,
  score: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  answered: false,
  flipped: false,
};

const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

function playSound(frequency = 440, duration = 0.1) {
  if (!soundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + duration,
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + duration);

    oscillator.onended = () => context.close();
  } catch (error) {
    console.warn("Audio unavailable:", error);
  }
}

function updateHeader() {
  document.querySelector("#header-best").textContent = saved.bestScore;
  document.querySelector("#sound-toggle").textContent = soundEnabled
    ? "🔊"
    : "🔇";
}

function showHome() {
  app.innerHTML = `
    <section class="screen home-screen">
      <div class="hero">
        <div class="hero-copy">
          <span class="eyebrow">YOUR DAILY BRAIN BREAK ✦</span>
          <h1>Learn something<br><span>new today.</span></h1>
          <p>Small questions. Big discoveries. How much do you really know?</p>
          <button class="primary-button" id="start-button">
            Let's play <span>→</span>
          </button>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="art-spark spark-one">✦</div>
          <div class="art-spark spark-two">✳</div>
          <div class="art-card card-back"></div>
          <div class="art-card card-middle"></div>
          <div class="art-card card-front">
            <span>?</span><small>Did you know?</small>
          </div>
          <div class="art-orbit"></div>
        </div>
      </div>

      <div class="section-heading">
        <div>
          <span class="eyebrow">CHOOSE YOUR EXPERIENCE</span>
          <h2>How do you want to play?</h2>
        </div>
      </div>

      <div class="mode-grid">
        <button class="mode-card flash-mode" data-mode="flashcard">
          <span class="mode-icon">🃏</span>
          <span class="mode-tag">LEARN AT YOUR PACE</span>
          <strong>Flashcards</strong>
          <span class="mode-description">
            Flip cards, discover answers, and learn new things.
          </span>
          <span class="mode-arrow">Explore →</span>
        </button>

        <button class="mode-card quiz-mode" data-mode="quiz">
          <span class="mode-icon">⚡</span>
          <span class="mode-tag">TEST YOUR KNOWLEDGE</span>
          <strong>Quick Quiz</strong>
          <span class="mode-description">
            Pick the right answer and build your winning streak.
          </span>
          <span class="mode-arrow">Challenge yourself →</span>
        </button>
      </div>

      <section class="dashboard">
        <div class="section-heading">
          <div>
            <span class="eyebrow">YOUR JOURNEY</span>
            <h2>Little wins add up.</h2>
          </div>
        </div>
        <div class="stats-grid">
          <div class="dashboard-card">
            <span>🎮</span>
            <strong id="stat-games">${saved.gamesPlayed}</strong>
            <small>Games played</small>
          </div>
          <div class="dashboard-card">
            <span>⭐</span>
            <strong id="stat-points">${saved.totalPoints}</strong>
            <small>Total points</small>
          </div>
          <div class="dashboard-card">
            <span>🏅</span>
            <strong id="stat-best">${saved.bestScore}</strong>
            <small>Best score</small>
          </div>
        </div>
      </section>

      <footer class="footer">Made for curious minds. <span>✳</span></footer>
    </section>
  `;
  updateHeader();
}

function showSetup(mode) {
  game.mode = mode; // Simpan mode yang dipilih

  game.category = "all";
  game.difficulty = "all";
  game.amount = 10;

  const modeName = mode === "flashcard" ? "Flashcards" : "Quick Quiz";
  const icon = mode === "flashcard" ? "🃏" : "⚡";

  app.innerHTML = `
    <section class="screen">
      <div class="game-panel">
        <button class="back-button" id="back-home">← Back to home</button>

        <div class="panel-title">${icon} ${modeName}</div>
        <p class="panel-subtitle">
          Customize your session before the fun begins.
        </p>

        <label class="option-label">01 — CHOOSE A CATEGORY</label>

        <div class="category-grid">
          <button class="category-option selected" data-category="all">
            🌟 All Topics
          </button>
          ${categories
            .map(
              (category) => `
            <button class="category-option" data-category="${category.id}">
              ${category.icon} ${category.name}
            </button>
          `,
            )
            .join("")}
        </div>

        <label class="option-label">02 — DIFFICULTY</label>
        <div class="choice-row">
          <button class="choice-button selected" data-difficulty="all">All</button>
          <button class="choice-button" data-difficulty="easy">Easy</button>
          <button class="choice-button" data-difficulty="medium">Medium</button>
          <button class="choice-button" data-difficulty="hard">Hard</button>
        </div>

        <label class="option-label">03 — NUMBER OF QUESTIONS</label>
        <div class="choice-row">
          <button class="choice-button selected" data-amount="10">10</button>
          <button class="choice-button" data-amount="15">15</button>
          <button class="choice-button" data-amount="20">20</button>
        </div>

        <button class="primary-button start-game" id="begin-game">
          Start playing →
        </button>
      </div>
    </section>
  `;
}

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function beginGame() {
  let available = questions.filter((question) => {
    const categoryMatch =
      game.category === "all" || question.category === game.category;

    const difficultyMatch =
      game.difficulty === "all" || question.difficulty === game.difficulty;

    return categoryMatch && difficultyMatch;
  });

  if (!available.length) {
    alert("No questions found for this selection.");
    return;
  }

  game.cards = shuffle(available).slice(
    0,
    Math.min(game.amount, available.length),
  );

  game.index = 0;
  game.score = 0;
  game.correct = 0;
  game.streak = 0;
  game.bestStreak = 0;
  game.answered = false;
  game.flipped = false;

  playSound(520);
  renderGame();
}

function currentCard() {
  return game.cards[game.index];
}

function getCategoryName(id) {
  return categories.find((category) => category.id === id)?.name ?? "General";
}

function renderProgress() {
  return (game.index / game.cards.length) * 100;
}

function renderGame() {
  if (game.index >= game.cards.length) {
    showResults();
    return;
  }

  if (game.mode === "flashcard") {
    renderFlashcard();
  } else {
    renderQuiz();
  }
}

function renderGameHeader() {
  return `
    <div class="game-header">
      <div class="game-meta">
        <span>${getCategoryName(game.category === "all" ? currentCard().category : game.category)}</span>
        <span>${game.index + 1} / ${game.cards.length}</span>
        <span>⭐ ${game.score}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${renderProgress()}%"></div>
      </div>
    </div>
  `;
}

function renderFlashcard() {
  const card = currentCard();

  app.innerHTML = `
    <section class="screen">
      ${renderGameHeader()}

      <div class="game-card-wrap">
        <div class="flashcard" id="flashcard">
          <div class="card-face card-front-face">
            <small>QUESTION · ${game.index + 1}</small>
            <h2>${escapeHTML(card.question)}</h2>
            <small>CLICK TO REVEAL</small>
          </div>

          <div class="card-face card-back-face">
            <small>THE ANSWER</small>
            <h2>${escapeHTML(card.answer)}</h2>
            <p>${escapeHTML(card.explanation)}</p>
          </div>
        </div>
      </div>

      <p class="flip-hint" id="flip-hint">
        Tap the card to discover the answer.
      </p>

      <div class="game-actions">
        <button class="action-button practice-button" id="need-practice" disabled>
          ↻ Need Practice
        </button>
        <button class="action-button know-button" id="knew-it" disabled>
          ✓ I Knew It
        </button>
      </div>

      <div style="text-align:center;margin-top:18px">
        <button class="back-button" id="quit-game">Quit session</button>
      </div>
    </section>
  `;

  document.querySelector("#flashcard").addEventListener("click", flipCard);
}

function flipCard() {
  if (game.flipped) return;

  game.flipped = true;

  document.querySelector("#flashcard").classList.add("flipped");
  document.querySelector("#flip-hint").textContent =
    "How well did you know this answer?";

  document.querySelector("#need-practice").disabled = false;
  document.querySelector("#knew-it").disabled = false;

  playSound(620);
}

function answerFlashcard(known) {
  if (!game.flipped) return;

  if (known) {
    game.score += 10;
    game.correct++;
    game.streak++;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    playSound(740);
  } else {
    game.streak = 0;
    playSound(260);
  }

  game.index++;
  game.flipped = false;

  renderGame();
}

function renderQuiz() {
  const card = currentCard();

  app.innerHTML = `
    <section class="screen">
      ${renderGameHeader()}

      <div class="quiz-question">
        <span class="eyebrow">
          ${getCategoryName(card.category).toUpperCase()} · ${card.difficulty.toUpperCase()}
        </span>
        <h2>${escapeHTML(card.question)}</h2>

        <div class="answer-grid">
          ${shuffle(card.options)
            .map(
              (option, index) => `
            <button class="answer-button" data-answer="${escapeHTML(option)}">
              <span>${String.fromCharCode(65 + index)}.</span>
              ${escapeHTML(option)}
            </button>
          `,
            )
            .join("")}
        </div>

        <div class="feedback" id="feedback" aria-live="polite"></div>
      </div>

      <div style="text-align:center;margin-top:20px">
        <button class="back-button" id="quit-game">Quit session</button>
      </div>
    </section>
  `;
}

function answerQuiz(selected) {
  if (game.answered) return;

  game.answered = true;

  const card = currentCard();
  const correct = selected === card.answer;

  if (correct) {
    game.score += 10;
    game.correct++;
    game.streak++;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    playSound(740);
  } else {
    game.streak = 0;
    playSound(260);
  }

  document.querySelectorAll(".answer-button").forEach((button) => {
    const value = button.dataset.answer;

    button.disabled = true;

    if (value === card.answer) {
      button.classList.add("correct");
    } else if (value === selected) {
      button.classList.add("wrong");
    }
  });

  document.querySelector("#feedback").innerHTML = correct
    ? `✓ Correct! ${escapeHTML(card.explanation)}`
    : `✗ Not quite! The answer is ${escapeHTML(card.answer)}. ${escapeHTML(card.explanation)}`;

  const nextButton = document.createElement("button");
  nextButton.className = "primary-button";
  nextButton.style.marginTop = "15px";
  nextButton.textContent =
    game.index === game.cards.length - 1 ? "See results →" : "Next question →";

  nextButton.addEventListener("click", () => {
    game.index++;
    game.answered = false;
    renderGame();
  });

  document.querySelector(".quiz-question").append(nextButton);
}

function showResults() {
  const total = game.cards.length;
  const accuracy = Math.round((game.correct / total) * 100);

  saved = recordGame(saved, {
    mode: game.mode,
    category: game.category,
    score: game.score,
    correct: game.correct,
    total,
  });

  updateHeader();

  let message = "Every question is a new opportunity!";

  if (accuracy >= 90) {
    message = "Outstanding! You're a knowledge superstar!";
  } else if (accuracy >= 70) {
    message = "Amazing work! You're getting sharper!";
  } else if (accuracy >= 50) {
    message = "Good effort! Keep exploring new things!";
  }

  app.innerHTML = `
    <section class="screen">
      <div class="result-panel">
        <div class="result-icon">${accuracy >= 70 ? "🏆" : "🌱"}</div>
        <span class="eyebrow">SESSION COMPLETE</span>
        <h1>Well played!</h1>
        <p class="result-caption">${message}</p>

        <div class="result-score">${game.score}</div>
        <div class="result-caption">TOTAL POINTS</div>

        <div class="result-stats">
          <div class="result-stat">
            <strong>${game.correct}/${total}</strong>
            <small>Correct / Known</small>
          </div>
          <div class="result-stat">
            <strong>${accuracy}%</strong>
            <small>Accuracy</small>
          </div>
          <div class="result-stat">
            <strong>${game.bestStreak}</strong>
            <small>Best streak</small>
          </div>
        </div>

        <p class="result-caption">
          ${game.mode === "flashcard" ? "Cards you knew" : "Correct quiz answers"}
        </p>

        <div class="result-actions">
          <button class="primary-button" id="play-again">Play again ↻</button>
          <button class="action-button" id="result-home">Home</button>
        </div>
      </div>
    </section>
  `;

  playSound(800, 0.25);
}


function handleClick(event) {
  const target = event.target.closest("button");
  if (!target) return;

  // Home navigation
  if (
    target.id === "back-home" ||
    target.id === "result-home" ||
    target.id === "brand-home"
  ) {
    showHome();
    return;
  }

  // Quick start
  if (target.id === "start-button") {
    showSetup("flashcard");
    return;
  }

  // Explicit game mode selection
  if (target.dataset.mode) {
    showSetup(target.dataset.mode);
    return;
  }

  // Category selection
  if (target.dataset.category) {
    game.category = target.dataset.category;

    document.querySelectorAll("[data-category]").forEach((button) => {
      button.classList.toggle("selected", button === target);
    });

    return;
  }

  // Difficulty selection
  if (target.dataset.difficulty) {
    game.difficulty = target.dataset.difficulty;

    document.querySelectorAll("[data-difficulty]").forEach((button) => {
      button.classList.toggle("selected", button === target);
    });

    return;
  }

  // Question amount selection
  if (target.dataset.amount) {
    game.amount = Number(target.dataset.amount);

    document.querySelectorAll("[data-amount]").forEach((button) => {
      button.classList.toggle("selected", button === target);
    });

    return;
  }

  if (target.id === "begin-game") {
    beginGame();
    return;
  }

  if (target.id === "knew-it") {
    answerFlashcard(true);
    return;
  }

  if (target.id === "need-practice") {
    answerFlashcard(false);
    return;
  }

  if (target.id === "quit-game") {
    if (confirm("End this session and return home?")) {
      showHome();
    }
    return;
  }

  if (target.dataset.answer !== undefined) {
    answerQuiz(target.dataset.answer);
    return;
  }

  if (target.id === "play-again") {
    showSetup(game.mode);
  }
}


app.addEventListener("click", handleClick);

document.querySelector("#sound-toggle").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  saved.soundEnabled = soundEnabled;
  saveData(saved);
  updateHeader();
  playSound();
});

document.querySelector("#brand-home").addEventListener("click", (event) => {
  event.preventDefault();
  showHome();
});

showHome();

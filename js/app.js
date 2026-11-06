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

/* =====================================
   SVG ICON SYSTEM
===================================== */

const iconPaths = {
  flask: `
    <path d="M9 3h6"/>
    <path d="M10 3v7.2L5.5 18a2 2 0 0 0 1.7 3h9.6a2 2 0 0 0 1.7-3L14 10.2V3"/>
    <path d="M8 15h8"/>
  `,
  landmark: `
    <path d="m3 9 9-6 9 6"/>
    <path d="M4 10h16"/>
    <path d="M5 10v9"/>
    <path d="M9 10v9"/>
    <path d="M15 10v9"/>
    <path d="M19 10v9"/>
    <path d="M3 21h18"/>
  `,
  globe: `
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18"/>
    <path d="M12 3a15 15 0 0 1 0 18"/>
    <path d="M12 3a15 15 0 0 0 0 18"/>
  `,
  laptop: `
    <rect x="4" y="4" width="16" height="12" rx="2"/>
    <path d="M2 20h20"/>
    <path d="M8 20h8"/>
  `,
  leaf: `
    <path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-8 8-16Z"/>
    <path d="M4 21c3-5 7-8 12-11"/>
  `,
  lightbulb: `
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
    <path d="M8.5 14.5a7 7 0 1 1 7 0c-.8.6-1.2 1.4-1.3 2.5h-4.4c-.1-1.1-.5-1.9-1.3-2.5Z"/>
  `,
  cards: `
    <rect x="5" y="5" width="13" height="16" rx="2"/>
    <path d="M9 5V3h10a2 2 0 0 1 2 2v12h-3"/>
    <path d="M9 10h5"/>
    <path d="M9 14h5"/>
  `,
  zap: `
    <path d="m13 2-3 9h7l-6 11 1-9H5l8-11Z"/>
  `,
  trophy: `
    <path d="M8 21h8"/>
    <path d="M12 17v4"/>
    <path d="M7 4h10v6a5 5 0 0 1-10 0V4Z"/>
    <path d="M7 7H4v2a4 4 0 0 0 4 4"/>
    <path d="M17 7h3v2a4 4 0 0 1-4 4"/>
  `,
  gamepad: `
    <path d="M6 11h4"/>
    <path d="M8 9v4"/>
    <path d="M16 10h.01"/>
    <path d="M18 12h.01"/>
    <path d="M7 6h10a4 4 0 0 1 3.8 5.3l-1.2 4a3 3 0 0 1-4.7 1.4L12 15l-2.9 1.7a3 3 0 0 1-4.7-1.4l-1.2-4A4 4 0 0 1 7 6Z"/>
  `,
  star: `
    <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>
  `,
  medal: `
    <circle cx="12" cy="8" r="5"/>
    <path d="m8.2 12-1.2 9 5-3 5 3-1.2-9"/>
  `,
  volume: `
    <path d="M11 5 6 9H3v6h3l5 4V5Z"/>
    <path d="M15 9a5 5 0 0 1 0 6"/>
    <path d="M18 6a9 9 0 0 1 0 12"/>
  `,
  volumeOff: `
    <path d="M11 5 6 9H3v6h3l5 4V5Z"/>
    <path d="m17 9 5 6"/>
    <path d="m22 9-5 6"/>
  `,
  arrowRight: `
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  `,
  arrowLeft: `
    <path d="M19 12H5"/>
    <path d="m12 19-7-7 7-7"/>
  `,
  check: `
    <path d="m5 12 4 4L19 6"/>
  `,
  refresh: `
    <path d="M20 7v5h-5"/>
    <path d="M4 17v-5h5"/>
    <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12"/>
    <path d="M4 12l2.8 5a7 7 0 0 0 11.6-2"/>
  `,
  home: `
    <path d="m3 10 9-7 9 7"/>
    <path d="M5 9v12h14V9"/>
    <path d="M9 21v-7h6v7"/>
  `,
  x: `
    <path d="m18 6-12 12"/>
    <path d="m6 6 12 12"/>
  `,
  sprout: `
    <path d="M12 22v-9"/>
    <path d="M12 13C5 13 4 8 4 4c5 0 8 2 8 7"/>
    <path d="M12 16c0-5 3-8 8-8 0 5-2 8-8 8Z"/>
  `,
  award: `
    <circle cx="12" cy="8" r="6"/>
    <path d="m8.2 13-1.2 8 5-3 5 3-1.2-8"/>
    <path d="m10 8 1.3 1.3L14 7"/>
  `,
  book: `
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/>
    <path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20"/>
  `,
  target: `
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="5"/>
    <circle cx="12" cy="12" r="1"/>
  `,
};

function icon(name, size = 20, className = "") {
  const paths = iconPaths[name] || iconPaths.star;

  return `
    <svg
      class="ui-icon ${className}"
      width="${size}"
      height="${size}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      ${paths}
    </svg>
  `;
}

/* =====================================
   UTILITIES
===================================== */

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
  const headerBest = document.querySelector("#header-best");
  const soundToggle = document.querySelector("#sound-toggle");

  if (headerBest) {
    headerBest.textContent = saved.bestScore;
  }

  if (soundToggle) {
    soundToggle.innerHTML = icon(soundEnabled ? "volume" : "volumeOff", 20);

    soundToggle.setAttribute(
      "aria-label",
      soundEnabled ? "Turn sound off" : "Turn sound on",
    );

    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  }
}

function getCategoryName(id) {
  return categories.find((category) => category.id === id)?.name ?? "General";
}

function getCategoryIcon(id) {
  return categories.find((category) => category.id === id)?.icon ?? "lightbulb";
}

/* =====================================
   HOME SCREEN
===================================== */

function showHome() {
  app.innerHTML = `
    <section class="screen home-screen">

      <div class="hero">
        <div class="hero-copy">
          <span class="eyebrow">YOUR DAILY BRAIN BREAK ✦</span>

          <h1>
            Learn something<br>
            <span>new today.</span>
          </h1>

          <p>
            Small questions. Big discoveries.
            How much do you really know?
          </p>

          <button class="primary-button" id="start-button">
            Let's play
            ${icon("arrowRight", 18)}
          </button>
        </div>

        <div class="hero-art" aria-hidden="true">
          <div class="art-spark spark-one">✦</div>
          <div class="art-spark spark-two">✳</div>
          <div class="art-card card-back"></div>
          <div class="art-card card-middle"></div>

          <div class="art-card card-front">
            <span>?</span>
            <small>Did you know?</small>
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
          <span class="mode-icon">
            ${icon("cards", 28)}
          </span>

          <span class="mode-tag">LEARN AT YOUR PACE</span>

          <strong>Flashcards</strong>

          <span class="mode-description">
            Flip cards, discover answers, and learn new things.
          </span>

          <span class="mode-arrow">
            Explore ${icon("arrowRight", 16)}
          </span>
        </button>

        <button class="mode-card quiz-mode" data-mode="quiz">
          <span class="mode-icon">
            ${icon("zap", 28)}
          </span>

          <span class="mode-tag">TEST YOUR KNOWLEDGE</span>

          <strong>Quick Quiz</strong>

          <span class="mode-description">
            Pick the right answer and build your winning streak.
          </span>

          <span class="mode-arrow">
            Challenge yourself ${icon("arrowRight", 16)}
          </span>
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
            <span class="dashboard-icon">
              ${icon("gamepad", 22)}
            </span>
            <strong id="stat-games">${saved.gamesPlayed}</strong>
            <small>Games played</small>
          </div>

          <div class="dashboard-card">
            <span class="dashboard-icon">
              ${icon("star", 22)}
            </span>
            <strong id="stat-points">${saved.totalPoints}</strong>
            <small>Total points</small>
          </div>

          <div class="dashboard-card">
            <span class="dashboard-icon">
              ${icon("medal", 22)}
            </span>
            <strong id="stat-best">${saved.bestScore}</strong>
            <small>Best score</small>
          </div>

        </div>
      </section>

      <footer class="footer">
        Made for curious minds.
        <span class="footer-mark">✳</span>
      </footer>

    </section>
  `;

  updateHeader();
}

/* =====================================
   SETUP SCREEN
===================================== */

function showSetup(mode) {
  game.mode = mode;

  game.category = "all";
  game.difficulty = "all";
  game.amount = 10;

  const modeName = mode === "flashcard" ? "Flashcards" : "Quick Quiz";

  const modeIcon = mode === "flashcard" ? "cards" : "zap";

  app.innerHTML = `
    <section class="screen setup-screen">

      <div class="game-panel">

        <button class="back-button" id="back-home">
          ${icon("arrowLeft", 17)}
          Back to home
        </button>

        <div class="setup-heading">
          <div class="setup-mode-icon">
            ${icon(modeIcon, 28)}
          </div>

          <div>
            <div class="panel-title">${modeName}</div>
            <p class="panel-subtitle">
              Customize your session before the fun begins.
            </p>
          </div>
        </div>

        <div class="setup-section">
          <label class="option-label">
            <span>01</span>
            CHOOSE A CATEGORY
          </label>

          <div class="category-grid">

            <button
              class="category-option selected"
              data-category="all"
            >
              <span class="category-icon">
                ${icon("globe", 20)}
              </span>
              <span>All Topics</span>
            </button>

            ${categories
              .map(
                (category) => `
                  <button
                    class="category-option"
                    data-category="${escapeHTML(category.id)}"
                    style="--category-color: ${escapeHTML(category.color)}"
                  >
                    <span class="category-icon">
                      ${icon(category.icon, 20)}
                    </span>
                    <span>${escapeHTML(category.name)}</span>
                  </button>
                `,
              )
              .join("")}

          </div>
        </div>

        <div class="setup-section">
          <label class="option-label">
            <span>02</span>
            DIFFICULTY
          </label>

          <div class="choice-row">
            <button class="choice-button selected" data-difficulty="all">
              All
            </button>

            <button class="choice-button" data-difficulty="easy">
              Easy
            </button>

            <button class="choice-button" data-difficulty="medium">
              Medium
            </button>

            <button class="choice-button" data-difficulty="hard">
              Hard
            </button>
          </div>
        </div>

        <div class="setup-section">
          <label class="option-label">
            <span>03</span>
            NUMBER OF QUESTIONS
          </label>

          <div class="choice-row">
            <button class="choice-button selected" data-amount="10">
              10
            </button>

            <button class="choice-button" data-amount="15">
              15
            </button>

            <button class="choice-button" data-amount="20">
              20
            </button>
          </div>
        </div>

        <button class="primary-button start-game" id="begin-game">
          Start playing
          ${icon("arrowRight", 18)}
        </button>

      </div>
    </section>
  `;
}

/* =====================================
   GAME LOGIC
===================================== */

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function beginGame() {
  const available = questions.filter((question) => {
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
  const card = currentCard();
  const categoryId = game.category === "all" ? card.category : game.category;

  return `
    <div class="game-header">

      <div class="game-meta">

        <span class="game-category">
          ${icon(getCategoryIcon(categoryId), 17)}
          ${escapeHTML(getCategoryName(categoryId))}
        </span>

        <span class="game-counter">
          ${game.index + 1}
          <span>/</span>
          ${game.cards.length}
        </span>

        <span class="game-score">
          ${icon("star", 17)}
          ${game.score}
        </span>

      </div>

      <div
        class="progress-track"
        role="progressbar"
        aria-label="Game progress"
        aria-valuemin="0"
        aria-valuemax="${game.cards.length}"
        aria-valuenow="${game.index}"
      >
        <div
          class="progress-fill"
          style="width:${renderProgress()}%"
        ></div>
      </div>

    </div>
  `;
}

/* =====================================
   FLASHCARD SCREEN
===================================== */

function renderFlashcard() {
  const card = currentCard();

  app.innerHTML = `
    <section class="screen game-screen">

      ${renderGameHeader()}

      <div class="game-card-wrap">

        <div class="flashcard" id="flashcard">

          <div class="card-face card-front-face">
            <small>
              QUESTION
              <span>·</span>
              ${game.index + 1}
            </small>

            <h2>${escapeHTML(card.question)}</h2>

            <div class="card-reveal-hint">
              ${icon("refresh", 17)}
              CLICK TO REVEAL
            </div>
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

        <button
          class="action-button practice-button"
          id="need-practice"
          disabled
        >
          ${icon("refresh", 18)}
          Need Practice
        </button>

        <button
          class="action-button know-button"
          id="knew-it"
          disabled
        >
          ${icon("check", 18)}
          I Knew It
        </button>

      </div>

      <div class="game-exit">
        <button class="back-button" id="quit-game">
          Quit session
        </button>
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

/* =====================================
   QUIZ SCREEN
===================================== */

function renderQuiz() {
  const card = currentCard();

  app.innerHTML = `
    <section class="screen game-screen">

      ${renderGameHeader()}

      <div class="quiz-question">

        <div class="quiz-question-meta">
          <span class="quiz-category">
            ${icon(getCategoryIcon(card.category), 16)}
            ${escapeHTML(getCategoryName(card.category))}
          </span>

          <span class="difficulty-tag difficulty-${escapeHTML(card.difficulty)}">
            ${escapeHTML(card.difficulty)}
          </span>
        </div>

        <h2>${escapeHTML(card.question)}</h2>

        <div class="answer-grid">

          ${shuffle(card.options)
            .map(
              (option, index) => `
                <button
                  class="answer-button"
                  data-answer="${escapeHTML(option)}"
                >
                  <span class="answer-letter">
                    ${String.fromCharCode(65 + index)}
                  </span>

                  <span class="answer-text">
                    ${escapeHTML(option)}
                  </span>
                </button>
              `,
            )
            .join("")}

        </div>

        <div
          class="feedback"
          id="feedback"
          aria-live="polite"
        ></div>

      </div>

      <div class="game-exit">
        <button class="back-button" id="quit-game">
          Quit session
        </button>
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
    ? `
      <div class="feedback-heading">
        ${icon("check", 19)}
        Correct!
      </div>
      <p>${escapeHTML(card.explanation)}</p>
    `
    : `
      <div class="feedback-heading">
        ${icon("x", 19)}
        Not quite!
      </div>
      <p>
        The answer is
        <strong>${escapeHTML(card.answer)}</strong>.
        ${escapeHTML(card.explanation)}
      </p>
    `;

  const nextButton = document.createElement("button");

  nextButton.className = "primary-button quiz-next-button";

  nextButton.innerHTML =
    game.index === game.cards.length - 1
      ? `See results ${icon("arrowRight", 18)}`
      : `Next question ${icon("arrowRight", 18)}`;

  nextButton.addEventListener("click", () => {
    game.index++;
    game.answered = false;
    renderGame();
  });

  document.querySelector(".quiz-question").append(nextButton);
}

/* =====================================
   RESULTS SCREEN
===================================== */

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
  let resultIcon = "sprout";
  let resultLabel = "KEEP EXPLORING";

  if (accuracy >= 90) {
    message = "Outstanding! You're a knowledge superstar!";
    resultIcon = "trophy";
    resultLabel = "EXCELLENT WORK";
  } else if (accuracy >= 70) {
    message = "Amazing work! You're getting sharper!";
    resultIcon = "award";
    resultLabel = "GREAT JOB";
  } else if (accuracy >= 50) {
    message = "Good effort! Keep exploring new things!";
    resultIcon = "star";
    resultLabel = "NICE PROGRESS";
  }

  app.innerHTML = `
    <section class="screen results-screen">

      <div class="result-panel">

        <div class="result-icon">
          ${icon(resultIcon, 34)}
        </div>

        <span class="eyebrow">${resultLabel}</span>

        <h1>Well played!</h1>

        <p class="result-caption">
          ${message}
        </p>

        <div class="result-score">
          ${game.score}
        </div>

        <div class="result-caption result-score-label">
          TOTAL POINTS
        </div>

        <div class="result-stats">

          <div class="result-stat">
            <span class="result-stat-icon">
              ${icon("check", 17)}
            </span>

            <strong>${game.correct}/${total}</strong>
            <small>Correct / Known</small>
          </div>

          <div class="result-stat">
            <span class="result-stat-icon">
              ${icon("target", 17)}
            </span>

            <strong>${accuracy}%</strong>
            <small>Accuracy</small>
          </div>

          <div class="result-stat">
            <span class="result-stat-icon">
              ${icon("zap", 17)}
            </span>

            <strong>${game.bestStreak}</strong>
            <small>Best streak</small>
          </div>

        </div>

        <p class="result-caption result-mode-caption">
          ${
            game.mode === "flashcard"
              ? "Cards you knew"
              : "Correct quiz answers"
          }
        </p>

        <div class="result-actions">

          <button class="primary-button" id="play-again">
            Play again
            ${icon("refresh", 18)}
          </button>

          <button class="action-button" id="result-home">
            ${icon("home", 18)}
            Home
          </button>

        </div>

      </div>
    </section>
  `;

  playSound(800, 0.25);
}

/* =====================================
   EVENT HANDLING
===================================== */

function handleClick(event) {
  const target = event.target.closest("button");

  if (!target) return;

  if (
    target.id === "back-home" ||
    target.id === "result-home" ||
    target.id === "brand-home"
  ) {
    showHome();
    return;
  }

  if (target.id === "start-button") {
    showSetup("flashcard");
    return;
  }

  if (target.dataset.mode) {
    showSetup(target.dataset.mode);
    return;
  }

  if (target.dataset.category !== undefined) {
    game.category = target.dataset.category;

    document.querySelectorAll("[data-category]").forEach((button) => {
      button.classList.toggle("selected", button === target);
    });

    return;
  }

  if (target.dataset.difficulty !== undefined) {
    game.difficulty = target.dataset.difficulty;

    document.querySelectorAll("[data-difficulty]").forEach((button) => {
      button.classList.toggle("selected", button === target);
    });

    return;
  }

  if (target.dataset.amount !== undefined) {
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

/* =====================================
   HEADER EVENTS
===================================== */

const soundToggle = document.querySelector("#sound-toggle");

if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    saved.soundEnabled = soundEnabled;

    saveData(saved);
    updateHeader();

    playSound();
  });
}

const brandHome = document.querySelector("#brand-home");

if (brandHome) {
  brandHome.addEventListener("click", (event) => {
    event.preventDefault();
    showHome();
  });
}

/* =====================================
   INITIALIZATION
===================================== */

showHome();

// -----------------------------
// App configuration and defaults
// -----------------------------
const STORAGE_KEY = 'flashcard-quiz-app-cards';
const THEME_KEY = 'flashcard-quiz-theme';
const AUTH_KEY = 'flashcard-quiz-auth';

const defaultCards = [
  { question: 'What does HTML stand for?', answer: 'HyperText Markup Language' },
  { question: 'What does CSS stand for?', answer: 'Cascading Style Sheets' },
  { question: 'What does JavaScript do?', answer: 'It adds interactivity to web pages' },
  { question: 'What does Python commonly do?', answer: 'It is used for automation, data science, and web development' },
  { question: 'What does SQL stand for?', answer: 'Structured Query Language' }
];

const quizQuestions = [
  {
    question: 'Which tag is used to create a hyperlink in HTML?',
    options: ['<link>', '<a>', '<img>', '<div>'],
    correctAnswerIndex: 1
  },
  {
    question: 'Which CSS property changes the text color?',
    options: ['background-color', 'color', 'margin', 'padding'],
    correctAnswerIndex: 1
  },
  {
    question: 'Which keyword declares a variable in JavaScript?',
    options: ['var', 'function', 'class', 'if'],
    correctAnswerIndex: 0
  },
  {
    question: 'Which Python data type is used for text?',
    options: ['int', 'float', 'str', 'bool'],
    correctAnswerIndex: 2
  },
  {
    question: 'Which SQL statement retrieves data from a table?',
    options: ['INSERT', 'UPDATE', 'DELETE', 'SELECT'],
    correctAnswerIndex: 3
  },
  {
    question: 'What does CSS stand for?',
    options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
    correctAnswerIndex: 1
  },
  {
    question: 'Which HTML tag is used for the largest heading?',
    options: ['<h1>', '<h6>', '<head>', '<header>'],
    correctAnswerIndex: 0
  },
  {
    question: 'Which JavaScript function is used to print to the browser console?',
    options: ['console.log()', 'print()', 'alert()', 'document.write()'],
    correctAnswerIndex: 0
  },
  {
    question: 'Which Python keyword defines a function?',
    options: ['func', 'define', 'def', 'lambda'],
    correctAnswerIndex: 2
  },
  {
    question: 'Which SQL clause filters rows?',
    options: ['ORDER BY', 'GROUP BY', 'WHERE', 'JOIN'],
    correctAnswerIndex: 2
  }
];

let cards = [];
let currentIndex = 0;
let showAnswer = false;
let editingIndex = null;
let quizCurrentIndex = 0;
let quizScore = 0;
let quizAnswers = [];

const questionEl = document.getElementById('flashcard-question');
const answerEl = document.getElementById('flashcard-answer');
const cardCounterEl = document.getElementById('card-counter');
const showAnswerBtn = document.getElementById('show-answer-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const form = document.getElementById('flashcard-form');
const questionInput = document.getElementById('question-input');
const answerInput = document.getElementById('answer-input');
const deleteBtn = document.getElementById('delete-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const logoutBtn = document.getElementById('logout-btn');
const welcomeMessage = document.getElementById('welcome-message');
const navLinks = document.querySelectorAll('.nav-link');
const authScreen = document.querySelector('.auth-screen');
const app = document.querySelector('.app');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const startQuizBtn = document.getElementById('start-quiz-btn');
const quizSection = document.querySelector('.quiz-section');
const quizCard = document.getElementById('quiz-card');
const quizQuestionEl = document.getElementById('quiz-question');
const quizOptionsEl = document.getElementById('quiz-options');
const quizProgressEl = document.getElementById('quiz-progress');
const quizNextBtn = document.getElementById('quiz-next-btn');
const quizRestartBtn = document.getElementById('quiz-restart-btn');
const quizStatusEl = document.getElementById('quiz-status');
const quizResultEl = document.getElementById('quiz-result');

function loadCards() {
  const savedCards = localStorage.getItem(STORAGE_KEY);

  if (savedCards) {
    try {
      const parsed = JSON.parse(savedCards);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cards = parsed;
        return;
      }
    } catch (error) {
      console.warn('Unable to parse saved cards:', error);
    }
  }

  cards = defaultCards;
}

function saveCards() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.warn('Unable to save flashcards:', error);
  }
}

function renderCard() {
  if (cards.length === 0) {
    questionEl.textContent = 'No Flashcards Available.';
    answerEl.textContent = '';
    answerEl.classList.add('hidden');
    cardCounterEl.textContent = 'No cards';
    questionInput.value = '';
    answerInput.value = '';
    editingIndex = null;
    return;
  }

  const card = cards[currentIndex];
  questionEl.textContent = card.question;
  answerEl.textContent = card.answer;
  answerEl.classList.toggle('hidden', !showAnswer);
  cardCounterEl.textContent = `Card ${currentIndex + 1} of ${cards.length}`;

  if (editingIndex !== null) {
    questionInput.value = cards[editingIndex].question;
    answerInput.value = cards[editingIndex].answer;
  } else {
    questionInput.value = card.question;
    answerInput.value = card.answer;
  }
}

function resetForm() {
  form.reset();
  editingIndex = null;
  showAnswer = false;
}

function applyTheme(theme) {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  themeToggleBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.warn('Unable to save theme preference:', error);
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
  applyTheme(initialTheme);
}

function showApp() {
  authScreen.classList.add('is-hidden');
  app.classList.remove('is-hidden');
}

function showLogin() {
  authScreen.classList.remove('is-hidden');
  app.classList.add('is-hidden');
}

function loadAuth() {
  const savedUser = localStorage.getItem(AUTH_KEY);
  if (!savedUser) {
    showLogin();
    return false;
  }

  try {
    const parsedUser = JSON.parse(savedUser);
    if (parsedUser && parsedUser.fullName) {
      welcomeMessage.textContent = `Welcome, ${parsedUser.fullName}`;
      showApp();
      return true;
    }
  } catch (error) {
    console.warn('Unable to parse saved user:', error);
  }

  showLogin();
  return false;
}

function saveAuth(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  welcomeMessage.textContent = 'Welcome, Guest';
}

function renderQuiz() {
  const question = quizQuestions[quizCurrentIndex];
  quizQuestionEl.textContent = question.question;
  quizProgressEl.textContent = `Question ${quizCurrentIndex + 1} of ${quizQuestions.length}`;
  quizOptionsEl.innerHTML = '';

  question.options.forEach((option, index) => {
    const optionBtn = document.createElement('button');
    optionBtn.type = 'button';
    optionBtn.className = 'quiz-option-btn';

    if (quizAnswers[quizCurrentIndex] === index) {
      optionBtn.classList.add('selected');
    }

    optionBtn.textContent = option;
    optionBtn.addEventListener('click', () => {
      quizAnswers[quizCurrentIndex] = index;
      renderQuiz();
    });

    quizOptionsEl.appendChild(optionBtn);
  });

  quizNextBtn.classList.remove('is-hidden');
  quizRestartBtn.classList.add('is-hidden');
  quizStatusEl.textContent = '';
  quizNextBtn.textContent = quizCurrentIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next';
}

function startQuiz() {
  quizCurrentIndex = 0;
  quizScore = 0;
  quizAnswers = [];
  quizSection.classList.remove('is-hidden');
  quizCard.classList.remove('is-hidden');
  quizResultEl.classList.add('is-hidden');
  quizResultEl.innerHTML = '';
  renderQuiz();
}

function finishQuiz() {
  quizScore = quizQuestions.reduce((total, question, index) => {
    return total + (quizAnswers[index] === question.correctAnswerIndex ? 1 : 0);
  }, 0);

  quizCard.classList.add('is-hidden');
  quizNextBtn.classList.add('is-hidden');
  quizRestartBtn.classList.remove('is-hidden');
  quizResultEl.classList.remove('is-hidden');
  quizResultEl.innerHTML = `
    <h3>Quiz Complete!</h3>
    <p>You scored ${quizScore} out of ${quizQuestions.length}.</p>
    <p>${quizScore === quizQuestions.length ? 'Perfect!' : quizScore >= 7 ? 'Great job!' : 'Keep practicing!'}</p>
  `;
}

function bindEvents() {
  showAnswerBtn.addEventListener('click', () => {
    if (cards.length === 0) return;

    showAnswer = !showAnswer;
    renderCard();
  });

  prevBtn.addEventListener('click', () => {
    if (cards.length === 0) return;

    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    editingIndex = null;
    showAnswer = false;
    renderCard();
  });

  nextBtn.addEventListener('click', () => {
    if (cards.length === 0) return;

    currentIndex = (currentIndex + 1) % cards.length;
    editingIndex = null;
    showAnswer = false;
    renderCard();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    if (!question || !answer) return;

    if (editingIndex !== null) {
      cards[editingIndex] = { question, answer };
    } else {
      cards.push({ question, answer });
      currentIndex = cards.length - 1;
    }

    saveCards();
    showAnswer = false;
    editingIndex = null;
    renderCard();
    resetForm();
  });

  deleteBtn.addEventListener('click', () => {
    if (cards.length === 0) return;

    cards.splice(currentIndex, 1);
    saveCards();

    if (currentIndex >= cards.length) {
      currentIndex = cards.length - 1;
    }

    showAnswer = false;
    editingIndex = null;
    renderCard();
  });

  questionInput.addEventListener('focus', () => {
    editingIndex = currentIndex;
  });

  answerInput.addEventListener('focus', () => {
    editingIndex = currentIndex;
  });

  themeToggleBtn.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        navLinks.forEach((navLink) => navLink.classList.remove('active'));
        link.classList.add('active');
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  startQuizBtn.addEventListener('click', startQuiz);

  quizNextBtn.addEventListener('click', () => {
    if (typeof quizAnswers[quizCurrentIndex] === 'undefined') {
      quizStatusEl.textContent = 'Please select an answer before continuing.';
      return;
    }

    if (quizCurrentIndex < quizQuestions.length - 1) {
      quizCurrentIndex += 1;
      renderQuiz();
    } else {
      finishQuiz();
    }
  });

  quizRestartBtn.addEventListener('click', startQuiz);

  logoutBtn.addEventListener('click', () => {
    clearAuth();
    loginError.textContent = '';
    showLogin();
  });

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!fullName || !email || !password) {
      loginError.textContent = 'Please fill in all fields.';
      return;
    }

    const user = { fullName, email, password };
    saveAuth(user);
    welcomeMessage.textContent = `Welcome, ${fullName}`;
    loginError.textContent = '';
    loginForm.reset();
    showApp();
  });
}

function initApp() {
  loadTheme();
  loadCards();
  renderCard();
  bindEvents();
  loadAuth();
}

document.addEventListener('DOMContentLoaded', initApp);

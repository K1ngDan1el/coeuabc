/* src/scripts/quiz1.js (REFACTORIZADO CON JSON) */

// --- CONFIGURACIÓN DEL TIMER ---
const TOTAL_TIME_SECONDS = 120; // 2 minutos
const HINTS_UNLOCK_TIME = TOTAL_TIME_SECONDS / 2;
// -----------------------------

// === INICIO: AÑADIR SONIDOS ===
const soundCorrect = new Audio('/Sounds/sonido-correcto.mp3');
const soundIncorrect = new Audio('/Sounds/sonido-incorrecto.mp3');
const soundTimeUp = new Audio('/Sounds/tiempo-fuera.mp3');
const soundWarning = new Audio('/Sounds/advertencia.mp3');
const musicBackground = new Audio('/Sounds/musica-fondo.mp3');
musicBackground.loop = false;
musicBackground.volume = 0.5;
let isMusicStarted = false;
// === FIN: AÑADIR SONIDOS ===


// --- Variables Globales del Quiz ---
let quizData = []; // Aquí se cargarán las preguntas del JSON
let score = 0;
let totalQuestions = 0;
let currentQuestionIndex = 0;
let hintsUnlocked = false;
let timerInterval = null;
let timeLeft = TOTAL_TIME_SECONDS;

// --- Elementos del DOM (declarados pero vacíos) ---
let resultDiv, resetBtn, nextBtn, quizContainer, quizForm;
let timerBar, timerBarDelay, timerText;
let allOptions, allQuestions, allHintButtons; // Se llenarán después de cargar el HTML

// --- FUNCIONES DEL TIMER ---
function startTimer() {
  timeLeft = TOTAL_TIME_SECONDS;
  hintsUnlocked = false;
  isMusicStarted = false; 
  currentQuestionIndex = 0;
  if (timerInterval) clearInterval(timerInterval);
  updateTimerDisplay(); 
  checkTimeEffects();
  showQuestion(currentQuestionIndex);

  // Setea el estado inicial de las barras sin transición
  if (timerBar) timerBar.style.transition = 'none';
  if (timerBarDelay) timerBarDelay.style.transition = 'none';
  updateTimerDisplay();

  // Forzamos un reflow
  void timerBar.offsetWidth;
  void timerBarDelay.offsetWidth;
  
  // Reactivamos las transiciones
  if (timerBar) timerBar.style.transition = 'background-color 0.5s ease';
  if (timerBarDelay) timerBarDelay.style.transition = 'width 0.5s linear';

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    checkTimeEffects();

    if (timeLeft === 85 && !isMusicStarted) {
        musicBackground.play().catch(e => console.error("Error al iniciar música:", e));
        isMusicStarted = true;
    }
    
    if (!hintsUnlocked && timeLeft <= HINTS_UNLOCK_TIME) {
      unlockHints();
    }

    if (timeLeft <= 0) {
      showFinalResult(true);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function updateTimerDisplay() {
  if (!timerBar || !timerText || !timerBarDelay) return; 
  const percentage = (timeLeft / TOTAL_TIME_SECONDS) * 100;
  
  timerBar.style.width = percentage + '%'; 
  timerBarDelay.style.width = percentage + '%'; 

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerText.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function checkTimeEffects() {
  if (!quizContainer) return;
  if (timeLeft <= 20) {
    quizContainer.classList.remove('timer-warning');
    quizContainer.classList.add('timer-danger');
    if (timerBar) timerBar.style.background = 'linear-gradient(90deg, #dc3545, #f85768)';
    if (timeLeft === 20) soundWarning.play();
  } else if (timeLeft <= 60) {
    quizContainer.classList.add('timer-warning');
    if (timerBar) timerBar.style.background = 'linear-gradient(90deg, #ffc107, #ffeb3b)';
    if (timeLeft === 60) soundWarning.play();
  } else {
    quizContainer.classList.remove('timer-warning', 'timer-danger');
    if (timerBar) timerBar.style.background = 'linear-gradient(90deg, #28a745, #5cdd7c)';
  }
}

// --- FUNCIONES DEL QUIZ ---

/**
 * Genera el HTML de todas las preguntas desde el JSON
 * y lo inserta en el DOM.
 */
function buildQuizHTML() {
  let html = '';

  quizData.forEach((question, index) => {
    // Genera el HTML para las opciones
    const optionsHTML = question.options.map(opt => `
      <label class="option" data-question="${question.id}" data-value="${opt.value}">
        <input type="radio" name="${question.id}" value="${opt.value}">
        <span class="option-content">${opt.text}</span>
      </label>
    `).join('');

    // Genera el HTML para la pregunta completa
    html += `
      <div class="question hidden">
        <div class="question-inner">
          <p><span class="question-number">${index + 1}</span>${question.question}</p>
          ${optionsHTML}
          <button class="hint-btn" data-hint="${question.id}" disabled>💡</button>
          <p class="hint-text" id="hint-${question.id}"></p>
        </div>
      </div>
    `;
  });

  quizForm.innerHTML = html;
}

/**
 * Muestra la pregunta actual y oculta las demás.
 */
function showQuestion(index) {
  allQuestions.forEach((question, i) => {
    if (i === index) {
      question.classList.remove('hidden');
    } else {
      question.classList.add('hidden');
    }
  });
}

/**
 * Desbloquea los botones de pista.
 */
function unlockHints() {
  hintsUnlocked = true;
  allHintButtons.forEach(btn => {
    const questionDiv = btn.closest('.question');
    const firstOption = questionDiv.querySelector('.option');
    if (!firstOption.classList.contains('disabled')) {
      btn.disabled = false;
      btn.classList.add('unlocked');
    }
  });
}

/**
 * Muestra la pista para una pregunta.
 * ¡MODIFICADO para leer de quizData!
 */
function showHint(event) {
  event.preventDefault(); 
  const btn = event.target;
  const qKey = btn.dataset.hint;
  
  // Busca la pista en nuestros datos cargados
  const questionData = quizData.find(q => q.id === qKey);
  const hintText = questionData ? questionData.hint : "Pista no encontrada.";
  
  const hintElement = document.getElementById(`hint-${qKey}`);
  
  if (hintElement) {
    hintElement.textContent = hintText;
    hintElement.classList.add('visible'); 
  }
  
  btn.disabled = true;
  btn.classList.remove('unlocked');
}

/**
 * Comprueba la respuesta seleccionada.
 * ¡MODIFICADO para leer de quizData!
 */
function checkAnswer(questionName, selectedValue, optionElement) {
  if (!timerInterval) return;

  // Busca la respuesta correcta en nuestros datos
  const questionData = quizData.find(q => q.id === questionName);
  const correctAnswer = questionData.correctAnswer;
  
  const questionOptions = document.querySelectorAll(`[data-question="${questionName}"]`);
  
  questionOptions.forEach(opt => {
    opt.classList.add('disabled');
    opt.style.pointerEvents = 'none';
    if (opt.dataset.value === correctAnswer) {
      opt.classList.add('correct');
    }
  });

  const hintBtn = optionElement.closest('.question').querySelector('.hint-btn');
  if (hintBtn) {
    hintBtn.disabled = true;
    hintBtn.classList.remove('unlocked');
  }
  
  if (selectedValue !== correctAnswer) {
    optionElement.classList.add('incorrect');
    soundIncorrect.play();
  } else {
    score++;
    soundCorrect.play();
  }
  
  // Lógica de avance automático
  setTimeout(() => {
    currentQuestionIndex++; 
    if (currentQuestionIndex < totalQuestions) {
      showQuestion(currentQuestionIndex); 
    } else {
      showFinalResult(false); 
    }
  }, 1000); 
}

function showFinalResult(isTimeUp) {
  stopTimer(); 
  
  musicBackground.pause();
  musicBackground.currentTime = 0;
  isMusicStarted = false;
  
  let emoji = '🎉';
  let message = '¡Genial!';
  const percentage = (score / totalQuestions) * 100;
  const passed = percentage >= 60;

  if (isTimeUp) {
    emoji = '⌛';
    message = '¡Se acabó el tiempo!';
    soundTimeUp.play();
  } else if (percentage === 100) {
    emoji = '🏆';
    message = '¡Perfecto!';
  } else if (percentage >= 80) {
    emoji = '😊';
    message = '¡Muy bien!';
  } else if (percentage >= 60) {
    emoji = '🤔';
    message = '¡Aprobado!';
  } else {
    emoji = '📚';
    message = '¡Sigue practicando!';
  }
  
  resultDiv.innerHTML = `
    <span class="score-emoji">${emoji}</span>
    ${message}<br>
    Puntaje: ${score}/${totalQuestions} (${percentage.toFixed(0)}%)
  `;
  resultDiv.style.display = 'block';
  
  allOptions.forEach(opt => {
    opt.classList.add('disabled');
    opt.style.pointerEvents = 'none';
  });

  resetBtn.style.display = 'block';
  // nextBtn.style.display = 'block'; // Descomenta si quieres un botón de "siguiente"
  // nextBtn.disabled = isTimeUp || !passed;

  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Reinicia el quiz al estado inicial.
 */
function resetQuiz() {
  musicBackground.pause();
  musicBackground.currentTime = 0;
  isMusicStarted = false; 

  score = 0;
  
  // if (nextBtn) nextBtn.disabled = false; // Descomenta si usas el botón nextBtn

  allOptions.forEach(opt => {
    opt.classList.remove('correct', 'incorrect', 'disabled');
    opt.style.pointerEvents = 'auto';
    const radio = opt.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });

  allHintButtons.forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('unlocked');
  });
  
  document.querySelectorAll('.hint-text').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  
  resultDiv.style.display = 'none';
  resetBtn.style.display = 'none';
  // nextBtn.style.display = 'none'; // Descomenta si usas el botón nextBtn
  
  quizContainer.classList.remove('timer-warning', 'timer-danger');
  
  startTimer(); 
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Función principal de inicialización
 */
async function initQuiz() {
  // 1. Asignar elementos principales del DOM
  resultDiv = document.getElementById('result');
  resetBtn = document.getElementById('reset-btn');
  nextBtn = document.getElementById('next-btn'); // Aunque no lo uses, lo asignamos
  quizContainer = document.getElementById('quiz-container');
  quizForm = document.getElementById('quiz-form');
  timerBar = document.getElementById('timer-bar');
  timerBarDelay = document.getElementById('timer-bar-delay');
  timerText = document.getElementById('timer-text');
  
  // 2. Cargar los datos del JSON
  try {
    const response = await fetch('/quiz-data.json');
    if (!response.ok) throw new Error('No se pudo cargar quiz-data.json');
    quizData = await response.json();
    totalQuestions = quizData.length;
  } catch (error) {
    console.error("Error al cargar el quiz:", error);
    quizForm.innerHTML = "<p>Error al cargar las preguntas. Intenta recargar la página.</p>";
    return;
  }

  // 3. Construir el HTML del quiz
  buildQuizHTML();

  // 4. Asignar elementos generados dinámicamente
  allOptions = document.querySelectorAll('.option');
  allQuestions = document.querySelectorAll('.question');
  allHintButtons = document.querySelectorAll('.hint-btn');

  // 5. Asignar todos los eventos
  allOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      if (this.classList.contains('disabled')) return;
      const radio = this.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        const questionName = this.dataset.question;
        const selectedValue = this.dataset.value;
        checkAnswer(questionName, selectedValue, this);
      }
    });
  });

  resetBtn.addEventListener('click', resetQuiz);
  // nextBtn.addEventListener('click', () => { ... });

  allHintButtons.forEach(btn => {
    btn.addEventListener('click', showHint);
  });

  // 6. Iniciar el timer
  startTimer();
}

// --- INICIO Y EVENTOS ---
// Espera a que el DOM esté listo y luego llama a la función principal
document.addEventListener('DOMContentLoaded', initQuiz);
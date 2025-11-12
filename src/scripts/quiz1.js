/* src/scripts/quiz1.js (Con Pistas, Sonidos y Música de Fondo Única) */

// --- CONFIGURACIÓN DEL TIMER ---
const TOTAL_TIME_SECONDS = 150; // 5 minutos
const HINTS_UNLOCK_TIME = TOTAL_TIME_SECONDS / 2;
// -----------------------------

// --- Textos de las Pistas ---
const hints = {
  q1: 'La respuesta menciona "intención comunicativa".',
  q2: 'Son los tres propósitos clásicos de la oratoria.',
  q3: 'No es "inicio, mitad, final", eso es muy simple.',
  q4: 'Una es personal (anécdota) y la otra es una pregunta al aire.',
  q5: 'Viene de "vicario", que significa "en lugar de otro". Es sentir lo que otro siente.',
  q6: 'Si quieres informar, no debes dar tu opinión personal.',
  q7: 'Todo empieza por... ¡llamar la...',
  q8: 'Necesitas saber a quién le hablas: edad, cultura, y qué piensan.',
  q9: 'Uno que se da en un funeral, una boda o una celebración.',
  q10: 'La respuesta está literalmente en las dos palabras.',
  q11: '¿Qué frase suena más como el inicio de una historia divertida?',
  q12: 'Persuadir no es lo mismo que manipular.',
  q13: 'Incluso la "improvisación" requiere conocer el tema y tener una estructura mental.',
  q14: '¿Qué pasaría si llegas y no te oyen o no pueden ver tu presentación?',
  q15: 'Hacer que la gente "vea" lo que dices en su mente.',
  q16: 'Cada idea debe tener su propio mini-desarrollo.',
  q17: 'Un público escéptico no cree en "porque sí". Necesitan datos duros.',
  q18: 'Debe terminar con fuerza, diciendo al público qué hacer ahora.',
  q19: 'Menos es más. Elige solo tus puntos clave.',
  q20: 'Una "Llamada a la acción" debe ser directa y clara.'
};

// === INICIO: AÑADIR SONIDOS ===
// Efectos de Sonido
const soundCorrect = new Audio('/Sounds/sonido-correcto.mp3');
const soundIncorrect = new Audio('/Sounds/sonido-incorrecto.mp3');
const soundTimeUp = new Audio('/Sounds/tiempo-fuera.mp3');
const soundWarning = new Audio('/Sounds/advertencia.mp3');

// === MÚSICA DE FONDO: Carga el archivo ===
const musicBackground = new Audio('/Sounds/musica-fondo.mp3'); // <-- CAMBIA 'musica-fondo.mp3' si tu archivo se llama diferente
musicBackground.loop = false; // <-- No está en loop
musicBackground.volume = 0.5; // Opcional: ajusta el volumen (0.0 a 1.0)

let isMusicStarted = false; // Controla si la música ya empezó
// === FIN: AÑADIR SONIDOS ===


// --- Elementos del Quiz ---
const answers = {
  q1: 'c', q2: 'b', q3: 'c', q4: 'b', q5: 'b',
  q6: 'b', q7: 'b', q8: 'b', q9: 'b', q10: 'a',
  q11: 'b', q12: 'b', q13: 'b', q14: 'b', q15: 'b',
  q16: 'b', q17: 'b', q18: 'b', q19: 'b', q20: 'b'
};

let totalAnswered = 0;
let score = 0;
const totalQuestions = Object.keys(answers).length;
const resultDiv = document.getElementById('result');
const resetBtn = document.getElementById('reset-btn');
const nextBtn = document.getElementById('next-btn');
const quizContainer = document.getElementById('quiz-container');
const allOptions = document.querySelectorAll('.option');

// --- Elementos del Timer ---
const timerBar = document.getElementById('timer-bar');
const timerText = document.getElementById('timer-text');
let timeLeft = TOTAL_TIME_SECONDS;
let timerInterval = null;
let hintsUnlocked = false;

// --- FUNCIONES DEL TIMER ---
function startTimer() {
  timeLeft = TOTAL_TIME_SECONDS;
  hintsUnlocked = false;
  isMusicStarted = false; // <--- CAMBIO: Resetea el control de la música
  if (timerInterval) clearInterval(timerInterval);
  updateTimerDisplay();
  checkTimeEffects();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    checkTimeEffects();

    // === MÚSICA DE FONDO: Inicia a los 120 segundos ===
    if (timeLeft === 85 && !isMusicStarted) {
        musicBackground.play().catch(e => console.error("Error al iniciar música:", e));
        isMusicStarted = true;
    }
    // === FIN: Inicio de música ===

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
  if (!timerBar || !timerText) return;
  const percentage = (timeLeft / TOTAL_TIME_SECONDS) * 100;
  timerBar.style.width = percentage + '%';

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
    
    if (timeLeft === 20) { // Suena solo una vez al llegar a 20
        soundWarning.play();
    }
    
  } else if (timeLeft <= 60) {
    quizContainer.classList.add('timer-warning');
    if (timerBar) timerBar.style.background = 'linear-gradient(90deg, #ffc107, #ffeb3b)';
    
    if (timeLeft === 60) { // Suena solo una vez al llegar a 60
        soundWarning.play();
    }

  } else {
    quizContainer.classList.remove('timer-warning', 'timer-danger');
    if (timerBar) timerBar.style.background = 'linear-gradient(90deg, #28a745, #5cdd7c)';
  }
}

// --- FUNCIÓN DE PISTAS (Modificada) ---
function unlockHints() {
  hintsUnlocked = true;
  const hintButtons = document.querySelectorAll('.hint-btn');
  hintButtons.forEach(btn => {
    const questionDiv = btn.closest('.question');
    const firstOption = questionDiv.querySelector('.option');
    if (!firstOption.classList.contains('disabled')) {
      btn.disabled = false;
      btn.classList.add('unlocked');
    }
  });
}

// --- FUNCIÓN DE MOSTRAR PISTA (¡MODIFICADA!) ---
function showHint(event) {
  event.preventDefault(); // Evita que el form se envíe
  const btn = event.target;
  const qKey = btn.dataset.hint;
  const hintText = hints[qKey];
  
  // Busca el elemento <p class="hint-text"> que corresponde a este botón
  const hintElement = document.getElementById(`hint-${qKey}`);
  
  // Ya no usamos alert(), ahora ponemos el texto
  if (hintElement) {
    hintElement.textContent = hintText;
    hintElement.classList.add('visible'); // Lo hace aparecer
  }
  
  btn.disabled = true;
  btn.classList.remove('unlocked');
}

// --- FUNCIONES DEL QUIZ (Modificadas) ---
function checkAnswer(questionName, selectedValue, optionElement) {
  
  if (!timerInterval) return;

  const correctAnswer = answers[questionName];
  const questionOptions = document.querySelectorAll(`[data-question="${questionName}"]`);
  
  questionOptions.forEach(opt => {
    opt.classList.add('disabled');
    opt.style.pointerEvents = 'none';
  });
  
  questionOptions.forEach(opt => {
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
  
  totalAnswered++;
  
  if (totalAnswered === totalQuestions) {
    showFinalResult(false);
  }
}

function showFinalResult(isTimeUp) {
  stopTimer(); 
  
  // === MÚSICA DE FONDO: Detiene toda la música ===
  musicBackground.pause();
  musicBackground.currentTime = 0;
  isMusicStarted = false;
  // === FIN: Detener música ===
  
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
  
  if (resultDiv) {
    resultDiv.innerHTML = `
      <span class="score-emoji">${emoji}</span>
      ${message}<br>
      Puntaje: ${score}/${totalQuestions} (${percentage.toFixed(0)}%)
    `;
    resultDiv.style.display = 'block';
  }
  
  allOptions.forEach(opt => {
    opt.classList.add('disabled');
    opt.style.pointerEvents = 'none';
  });

  if (resetBtn) resetBtn.style.display = 'block';
  if (nextBtn) nextBtn.style.display = 'block';
  if (nextBtn) nextBtn.disabled = isTimeUp || !passed;

  if (resultDiv) resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// --- FUNCIÓN DE RESET (¡MODIFICADA!) ---
function resetQuiz() {
  // === MÚSICA DE FONDO: Resetea la música ===
  musicBackground.pause();
  musicBackground.currentTime = 0;
  isMusicStarted = false; // Se prepara para el próximo inicio en 120s
  // === FIN: Reseteo de música ===

  totalAnswered = 0;
  score = 0;
  
  if (nextBtn) nextBtn.disabled = false;

  allOptions.forEach(opt => {
    opt.classList.remove('correct', 'incorrect', 'disabled');
    opt.style.pointerEvents = 'auto';
    const radio = opt.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });

  document.querySelectorAll('.hint-btn').forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('unlocked');
  });
  
  // Limpia el texto de las pistas
  document.querySelectorAll('.hint-text').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  
  if (resultDiv) resultDiv.style.display = 'none';
  if (resetBtn) resetBtn.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'none';
  
  if (quizContainer) quizContainer.classList.remove('timer-warning', 'timer-danger');
  
  startTimer(); 
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- INICIO Y EVENTOS ---
document.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll('.option').forEach(option => {
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

  const resetBtnEl = document.getElementById('reset-btn');
  const nextBtnEl = document.getElementById('next-btn');

  if (resetBtnEl) resetBtnEl.addEventListener('click', resetQuiz);
  if (nextBtnEl) nextBtnEl.addEventListener('click', () => {
    alert('Función "Siguiente" - Aquí puedes redirigir');
  });

  // Eventos de Botones de Pista
  document.querySelectorAll('.hint-btn').forEach(btn => {
    btn.addEventListener('click', showHint);
  });

  // CAMBIO: Ya no se inicia la música aquí, se inicia en el timer
  
  startTimer();
});
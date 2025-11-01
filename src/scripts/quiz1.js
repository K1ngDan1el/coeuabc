/* src/scripts/quiz1.js (Combinado con Timer) */

// --- CONFIGURACIÓN DEL TIMER ---
const TOTAL_TIME_SECONDS = 60; // ¡Tiempo total para el quiz!
// -----------------------------

// --- Elementos del Quiz ---
const answers = { q1: 'b', q2: 'b', q3: 'a' };
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

// --- FUNCIONES DEL TIMER ---
function startTimer() {
  timeLeft = TOTAL_TIME_SECONDS;
  if (timerInterval) clearInterval(timerInterval);
  updateTimerDisplay();
  checkTimeEffects();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    checkTimeEffects();

    if (timeLeft <= 0) {
      showFinalResult(true); // Se acabó el tiempo
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function updateTimerDisplay() {
  if (!timerBar) return; // Seguridad
  // Actualiza la barra
  const percentage = (timeLeft / TOTAL_TIME_SECONDS) * 100;
  timerBar.style.width = percentage + '%';

  // Actualiza el texto
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerText.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function checkTimeEffects() {
  if (!quizContainer) return; // Seguridad
  if (timeLeft <= 10) { // 🚨 Peligro
    quizContainer.classList.remove('timer-warning');
    quizContainer.classList.add('timer-danger');
    if (timerBar) timerBar.style.background = 'linear-gradient(90deg, #dc3545, #f85768)';
  } else if (timeLeft <= 20) { // ⚠️ Advertencia
    quizContainer.classList.add('timer-warning');
    if (timerBar) timerBar.style.background = 'linear-gradient(90deg, #ffc107, #ffeb3b)';
  } else { // Normal
    quizContainer.classList.remove('timer-warning', 'timer-danger');
    if (timerBar) timerBar.style.background = 'linear-gradient(90deg, #28a745, #5cdd7c)';
  }
}

// --- FUNCIONES DEL QUIZ (Modificadas) ---
function checkAnswer(questionName, selectedValue, optionElement) {
  if (!timerInterval) return; // No hacer nada si el tiempo ya se acabó

  const correctAnswer = answers[questionName];
  const questionOptions = document.querySelectorAll(`[data-question="${questionName}"]`);
  
  // Deshabilita todas las opciones de esta pregunta
  questionOptions.forEach(opt => {
    opt.classList.add('disabled');
    opt.style.pointerEvents = 'none';
  });
  
  // Muestra la correcta
  questionOptions.forEach(opt => {
    if (opt.dataset.value === correctAnswer) {
      opt.classList.add('correct');
    }
  });
  
  // Marca la incorrecta (si es el caso)
  if (selectedValue !== correctAnswer) {
    optionElement.classList.add('incorrect');
  } else {
    score++;
  }
  
  totalAnswered++;
  
  // Revisa si ya se terminó
  if (totalAnswered === totalQuestions) {
    showFinalResult(false); // Completó antes de tiempo
  }
}

function showFinalResult(isTimeUp) {
  stopTimer(); // ¡DETIENE EL RELOJ!
  
  let emoji = '🎉';
  let message = '¡Genial!';

  if (isTimeUp) {
    emoji = '⌛';
    message = '¡Se acabó el tiempo!';
  } else if (score === 3) {
    emoji = '🏆';
    message = '¡Perfecto!';
  } else if (score === 2) {
    emoji = '😊';
    message = '¡Muy bien!';
  } else if (score === 1) {
    emoji = '🤔';
    message = '¡Puedes mejorar!';
  } else {
    emoji = '📚';
    message = '¡Sigue practicando!';
  }
  
  if (resultDiv) {
    resultDiv.innerHTML = `
      <span class="score-emoji">${emoji}</span>
      ${message}<br>
      Puntaje: ${score}/${totalQuestions}
    `;
    resultDiv.style.display = 'block';
  }
  
  // Deshabilitar todas las opciones por si se acabó el tiempo
  allOptions.forEach(opt => {
    opt.classList.add('disabled');
    opt.style.pointerEvents = 'none';
  });

  // MUESTRA LOS BOTONES
  if (resetBtn) resetBtn.style.display = 'block';
  if (nextBtn) nextBtn.style.display = 'block';

  // --- ¡AQUÍ ESTÁ LA LÍNEA QUE PEDISTE! ---
  if (nextBtn) nextBtn.disabled = isTimeUp;

  if (resultDiv) resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetQuiz() {
  totalAnswered = 0;
  score = 0;
  
  // Vuelve a habilitar el botón 'Siguiente'
  if (nextBtn) nextBtn.disabled = false;

  allOptions.forEach(opt => {
    opt.classList.remove('correct', 'incorrect', 'disabled');
    opt.style.pointerEvents = 'auto';
    const radio = opt.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });
  
  if (resultDiv) resultDiv.style.display = 'none';
  if (resetBtn) resetBtn.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'none';
  
  if (quizContainer) quizContainer.classList.remove('timer-warning', 'timer-danger');
  
  startTimer(); // Reinicia el timer
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- INICIO Y EVENTOS ---
// Nos aseguramos que el DOM esté cargado antes de asignar eventos
document.addEventListener('DOMContentLoaded', (event) => {
  // Asignar eventos a las opciones
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

  // Asignar eventos a los botones
  const resetBtnEl = document.getElementById('reset-btn');
  const nextBtnEl = document.getElementById('next-btn');

  if (resetBtnEl) resetBtnEl.addEventListener('click', resetQuiz);
  if (nextBtnEl) nextBtnEl.addEventListener('click', () => {
    alert('Función "Siguiente" - Aquí puedes redirigir');
  });

  // ¡Empezar el timer al cargar!
  startTimer();
});
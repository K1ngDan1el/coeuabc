// quiz1.js

// Respuestas correctas
const answers = { q1: 'b', q2: 'b', q3: 'a' };

// Variables de control
let totalAnswered = 0;
let score = 0;
const totalQuestions = Object.keys(answers).length;
const progressBar = document.getElementById('progress');
const resultDiv = document.getElementById('result');
const resetBtn = document.getElementById('reset-btn');
const nextBtn = document.getElementById('next-btn');

// Función para actualizar la barra de progreso
function updateProgress() {
  const percentage = (totalAnswered / totalQuestions) * 100;
  progressBar.style.width = percentage + '%';
}

// Función para verificar respuesta
function checkAnswer(questionName, selectedValue, optionElement) {
  const correctAnswer = answers[questionName];
  const allOptions = document.querySelectorAll(`[data-question="${questionName}"]`);
  
  // Deshabilitar todas las opciones de esta pregunta
  allOptions.forEach(opt => {
    opt.classList.add('disabled');
    opt.style.pointerEvents = 'none';
  });
  
  // Marcar la respuesta correcta en verde
  allOptions.forEach(opt => {
    if (opt.dataset.value === correctAnswer) {
      opt.classList.add('correct');
    }
  });
  
  // Si la respuesta seleccionada es incorrecta, marcarla en rojo
  if (selectedValue !== correctAnswer) {
    optionElement.classList.add('incorrect');
  } else {
    score++;
  }
  
  totalAnswered++;
  updateProgress();
  
  // Mostrar resultado final si se han respondido todas las preguntas
  if (totalAnswered === totalQuestions) {
    showFinalResult();
  }
}

// Función para mostrar resultado final
function showFinalResult() {
  let emoji = '🎉';
  let message = '¡Perfecto!';
  
  if (score === 3) {
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
  
  resultDiv.innerHTML = `
    <span class="score-emoji">${emoji}</span>
    ${message}<br>
    Puntaje: ${score}/${totalQuestions}
  `;
  resultDiv.style.display = 'block';
  
  // Mostrar botones
  resetBtn.style.display = 'block';
  nextBtn.style.display = 'block';
  
  // Scroll suave hacia el resultado
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Función para reiniciar el quiz
function resetQuiz() {
  // Reiniciar variables
  totalAnswered = 0;
  score = 0;
  
  // Limpiar todas las opciones
  const allOptions = document.querySelectorAll('.option');
  allOptions.forEach(opt => {
    opt.classList.remove('correct', 'incorrect', 'disabled');
    opt.style.pointerEvents = 'auto';
    const radio = opt.querySelector('input[type="radio"]');
    radio.checked = false;
  });
  
  // Ocultar resultado y botones
  resultDiv.style.display = 'none';
  resetBtn.style.display = 'none';
  nextBtn.style.display = 'none';
  
  // Resetear barra de progreso
  progressBar.style.width = '0%';
  
  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Event listeners para las opciones
document.querySelectorAll('.option').forEach(option => {
  option.addEventListener('click', function(e) {
    // Si ya está deshabilitada, no hacer nada
    if (this.classList.contains('disabled')) {
      return;
    }
    
    const radio = this.querySelector('input[type="radio"]');
    const questionName = this.dataset.question;
    const selectedValue = this.dataset.value;
    
    // Marcar el radio button
    radio.checked = true;
    
    // Verificar respuesta inmediatamente
    checkAnswer(questionName, selectedValue, this);
  });
});

// Event listener para botón de reiniciar
resetBtn.addEventListener('click', resetQuiz);

// Event listener para botón siguiente (puedes personalizarlo)
nextBtn.addEventListener('click', () => {
  alert('Función "Siguiente" - Aquí puedes redirigir al siguiente quiz');
  // Ejemplo: window.location.href = 'quiz2.html';
});
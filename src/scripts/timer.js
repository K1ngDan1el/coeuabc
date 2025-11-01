/* src/scripts/timer.js */

// --- CONFIGURACIÓN ---
const DURATION_IN_SECONDS = 60;
const WARNING_TIME_SECONDS = 10;
const WARNING_PROGRESS_PERCENT = 0.3;
const COLOR_PROGRESS = '#28a745';
const COLOR_WARNING = '#dc3545';
const COLOR_BACKGROUND = 'rgba(255, 255, 255, 0.2)';
const COLOR_TEXT = '#FFFFFF';
const COLOR_TEXT_WARNING = '#dc3545';
// ---------------------

const canvas = document.getElementById('timer-canvas');

// Comprobamos si el canvas existe en esta página
if (canvas) {
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 80;
  const lineWidth = 10;
  const startAngle = -Math.PI / 2;

  let timeLeft = DURATION_IN_SECONDS;
  let intervalId = null;

  function drawTimer(progress) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Círculo de fondo
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = COLOR_BACKGROUND;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Arco de progreso
    const arcColor = progress > WARNING_PROGRESS_PERCENT ? COLOR_PROGRESS : COLOR_WARNING;
    const endAngle = (2 * Math.PI * progress) + startAngle;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Texto
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    ctx.fillStyle = timeLeft <= WARNING_TIME_SECONDS ? COLOR_TEXT_WARNING : COLOR_TEXT;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, centerX, centerY);
  }

  function updateTimer() {
    if (timeLeft > 0) {
      timeLeft--;
      const progress = timeLeft / DURATION_IN_SECONDS;
      drawTimer(progress);
    } else {
      stopTimer();
      drawTimer(0);
      ctx.fillStyle = COLOR_WARNING;
      ctx.font = 'bold 24px Arial';
      ctx.fillText('¡FIN!', centerX, centerY);
      // Aquí puedes agregar lógica para que el quiz termine
      // document.getElementById('quiz-form').submit();
    }
  }

  function startTimer() {
    if (intervalId) return;
    intervalId = setInterval(updateTimer, 1000);
  }

  function stopTimer() {
    clearInterval(intervalId);
    intervalId = null;
  }

  // ---- INICIO ----
  drawTimer(1);
  startTimer();
}
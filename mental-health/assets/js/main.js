/**
 * AI-Based Student Mental Health Monitoring System
 * Vanilla JavaScript UI Controller
 */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Auto-dismiss flash alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      alert.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      setTimeout(function () {
        alert.remove();
      }, 500);
    }, 5000);
  });

  // 2. Interactive Likert radio buttons highlight
  const likertLabels = document.querySelectorAll('.likert-option-label');
  likertLabels.forEach(function (label) {
    const radio = label.querySelector('input[type="radio"]');
    if (radio && radio.checked) {
      label.classList.add('active');
    }

    label.addEventListener('click', function () {
      const groupName = radio ? radio.name : null;
      if (groupName) {
        document.querySelectorAll(`input[name="${groupName}"]`).forEach(function (r) {
          const parent = r.closest('.likert-option-label');
          if (parent) parent.classList.remove('active');
        });
      }
      label.classList.add('active');
    });
  });

  // 3. Assessment Form Progress Indicator
  const assessmentForm = document.getElementById('assessmentForm');
  if (assessmentForm) {
    const totalQuestions = document.querySelectorAll('.likert-question-card').length;
    const progressFill = document.getElementById('assessmentProgressFill');
    const progressCount = document.getElementById('assessmentAnsweredCount');

    function updateAssessmentProgress() {
      const answered = new Set();
      document.querySelectorAll('.likert-question-card input[type="radio"]:checked').forEach(function (radio) {
        answered.add(radio.name);
      });
      const count = answered.size;
      const pct = Math.round((count / totalQuestions) * 100);
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressCount) progressCount.textContent = count;
    }

    assessmentForm.addEventListener('change', updateAssessmentProgress);
    updateAssessmentProgress();
  }
});

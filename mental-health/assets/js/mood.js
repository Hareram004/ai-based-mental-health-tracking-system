/**
 * AI-Based Student Mental Health Monitoring System
 * Mood Tracker Interaction Script
 */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Mood Picker Selection
  const moodButtons = document.querySelectorAll('.mood-btn');
  const moodInput = document.getElementById('selectedMoodInput');

  moodButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      moodButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const chosenMood = btn.getAttribute('data-mood');
      if (moodInput) moodInput.value = chosenMood;
    });
  });

  // 2. Dynamic Slider Badges
  const stressSlider = document.getElementById('stressRange');
  const stressDisplay = document.getElementById('stressDisplay');
  if (stressSlider && stressDisplay) {
    stressSlider.addEventListener('input', function () {
      stressDisplay.textContent = this.value;
    });
  }

  const energySlider = document.getElementById('energyRange');
  const energyDisplay = document.getElementById('energyDisplay');
  if (energySlider && energyDisplay) {
    energySlider.addEventListener('input', function () {
      energyDisplay.textContent = this.value;
    });
  }
});

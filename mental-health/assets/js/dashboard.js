/**
 * AI-Based Student Mental Health Monitoring System
 * Dashboard Client-Side Logic & AI Journal Integration
 */

document.addEventListener('DOMContentLoaded', function () {
  // Asynchronous Journal AI Analysis
  const analyzeBtn = document.getElementById('btnAnalyzeJournal');
  const journalTextarea = document.getElementById('journalInput');
  const resultContainer = document.getElementById('journalAiResults');

  if (analyzeBtn && journalTextarea && resultContainer) {
    analyzeBtn.addEventListener('click', async function () {
      const text = journalTextarea.value.trim();
      if (!text) {
        alert('Please write a brief reflection in your journal before analyzing.');
        return;
      }

      // UI Loading state
      analyzeBtn.disabled = true;
      const originalBtnHtml = analyzeBtn.innerHTML;
      analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing with AI...';
      resultContainer.style.display = 'none';

      try {
        const formData = new FormData();
        formData.append('journal_text', text);

        const csrfInput = document.querySelector('input[name="csrf_token"]');
        if (csrfInput) {
          formData.append('csrf_token', csrfInput.value);
        }

        const response = await fetch('api/analyze_journal.php', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.status === 'success') {
          // Populate results
          document.getElementById('aiSentimentBadge').textContent = data.sentiment;
          document.getElementById('aiSentimentBadge').className = 'badge ' +
            (data.sentiment === 'Positive' ? 'badge-success' : data.sentiment === 'Negative' ? 'badge-danger' : 'badge-warning');

          document.getElementById('aiEmotionalTheme').textContent = data.emotional_theme;
          document.getElementById('aiStressIndicator').textContent = data.stress_indicator;
          document.getElementById('aiSummaryText').textContent = data.ai_summary;

          // Crisis check alert
          const crisisAlert = document.getElementById('aiCrisisAlert');
          if (crisisAlert) {
            if (data.is_crisis) {
              crisisAlert.style.display = 'flex';
            } else {
              crisisAlert.style.display = 'none';
            }
          }

          resultContainer.style.display = 'block';
        } else {
          alert(data.message || 'Error analyzing journal.');
        }
      } catch (err) {
        console.error('AI Journal Analysis failed:', err);
        alert('Connection error occurred while processing journal analysis.');
      } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = originalBtnHtml;
      }
    });
  }
});

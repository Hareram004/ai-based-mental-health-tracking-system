/**
 * AI-Based Student Mental Health Monitoring System
 * Chart.js Integration Engine
 */

window.MindPulseCharts = {
  // Calm, minimal chart aesthetic configuration
  theme: {
    primary: '#2563EB',
    primaryLight: 'rgba(37, 99, 235, 0.08)',
    secondary: '#14B8A6',
    secondaryLight: 'rgba(20, 184, 166, 0.08)',
    warning: '#F59E0B',
    danger: '#EF4444',
    success: '#14B8A6',
    gridColor: '#F1F5F9',
    textColor: '#64748B',
    font: "'Inter', system-ui, -apple-system, sans-serif"
  },

  /**
   * 1. 7-Day Mood & Stress Correlation Chart
   */
  renderWeeklyMoodChart: function (canvasId, dates, moodScores, stressScores) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Mood Index (1-5)',
            data: moodScores,
            borderColor: this.theme.primary,
            backgroundColor: this.theme.primaryLight,
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: this.theme.primary,
            pointRadius: 4
          },
          {
            label: 'Stress Level (1-10)',
            data: stressScores,
            borderColor: this.theme.warning,
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.3,
            borderWidth: 2,
            pointBackgroundColor: this.theme.warning,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: this.theme.font, size: 12 }, color: this.theme.textColor }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: this.theme.font },
            bodyFont: { family: this.theme.font },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: { grid: { color: this.theme.gridColor }, ticks: { color: this.theme.textColor } },
          y: { min: 1, max: 10, grid: { color: this.theme.gridColor }, ticks: { stepSize: 2, color: this.theme.textColor } }
        }
      }
    });
  },

  /**
   * 2. Sleep Hours Trend Chart
   */
  renderSleepTrendChart: function (canvasId, dates, sleepHours) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Sleep Duration (Hours)',
            data: sleepHours,
            backgroundColor: sleepHours.map(h => (h >= 7 ? '#10b981' : h >= 5.5 ? '#f59e0b' : '#ef4444')),
            borderRadius: 6,
            maxBarThickness: 28
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: function (ctx) {
                const h = ctx.parsed.y;
                return h >= 7 ? 'Optimal Rest' : h >= 6 ? 'Acceptable' : 'Sleep Deficit';
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: this.theme.textColor } },
          y: { min: 0, max: 12, grid: { color: this.theme.gridColor }, ticks: { stepSize: 2, color: this.theme.textColor } }
        }
      }
    });
  },

  /**
   * 3. Category-Wise Stress Assessment Radar Chart
   */
  renderCategoryRadarChart: function (canvasId, categories, percentages) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'radar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Stress Indicator %',
            data: percentages,
            borderColor: this.theme.primary,
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: this.theme.primary,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ' ' + ctx.dataset.label + ': ' + ctx.raw + '%';
              }
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: 25, color: '#94a3b8', backdropColor: 'transparent' },
            grid: { color: '#e2e8f0' },
            pointLabels: {
              font: { family: this.theme.font, size: 11, weight: '600' },
              color: '#334155'
            }
          }
        }
      }
    });
  },

  /**
   * 4. Admin Stress Distribution Doughnut Chart
   */
  renderStressDistributionChart: function (canvasId, lowCount, modCount, highCount) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Low Stress (0-33%)', 'Moderate Stress (34-66%)', 'High Stress (67-100%)'],
        datasets: [
          {
            data: [lowCount, modCount, highCount],
            backgroundColor: [this.theme.success, this.theme.warning, this.theme.danger],
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { family: this.theme.font, size: 12 }, padding: 16 }
          }
        }
      }
    });
  }
};

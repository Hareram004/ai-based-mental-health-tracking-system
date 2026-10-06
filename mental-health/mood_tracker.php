<?php
/**
 * Daily Mood Tracker & Journal Interface
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

requireStudent();

$user = getCurrentUser();
$db = getDB();

$todayDate = date('Y-m-d');

// Check if student already submitted an entry for today
$stmt = $db->prepare("SELECT * FROM mood_entries WHERE user_id = ? AND entry_date = ? LIMIT 1");
$stmt->execute([$user['id'], $todayDate]);
$todayEntry = $stmt->fetch();

$currentMood   = $todayEntry ? $todayEntry['mood'] : 'Happy';
$currentStress = $todayEntry ? $todayEntry['stress_level'] : 4;
$currentEnergy = $todayEntry ? $todayEntry['energy_level'] : 7;
$currentSleep  = $todayEntry ? $todayEntry['sleep_hours'] : 7.5;
$currentJournal= $todayEntry ? $todayEntry['journal'] : '';

$pageTitle = "Daily Mood Tracker & Reflection";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width: 820px; margin: 2.5rem auto 4rem;">
  
  <div class="card" style="padding: 2.5rem;">
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem;">
      <div>
        <h2>Daily Mood Tracker & Wellness Journal</h2>
        <p style="color: #64748b; font-size: 0.92rem; margin-top: 0.25rem;">
          Log today's emotional state, sleep rhythm, and personal reflections.
        </p>
      </div>
      <div>
        <span class="badge badge-neutral" style="font-size: 0.88rem; padding: 0.4rem 0.85rem;">
          <i class="fa-regular fa-calendar"></i> <?php echo date('l, M d, Y'); ?>
        </span>
      </div>
    </div>

    <?php if ($todayEntry): ?>
      <div class="alert alert-info">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span>You already logged an entry for today. Submitting again will update your existing log.</span>
      </div>
    <?php endif; ?>

    <form method="POST" action="save_mood.php">
      <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
      <input type="hidden" id="selectedMoodInput" name="mood" value="<?php echo escape($currentMood); ?>">

      <!-- Mood Selection Matrix -->
      <div class="form-group">
        <label class="form-label">How are you feeling overall today? *</label>
        
        <div class="mood-picker">
          <?php
          $moods = [
            'Very Happy' => ['emoji' => '😄', 'label' => 'Very Happy'],
            'Happy'      => ['emoji' => '🙂', 'label' => 'Happy'],
            'Neutral'    => ['emoji' => '😐', 'label' => 'Neutral'],
            'Sad'        => ['emoji' => '😔', 'label' => 'Sad'],
            'Very Sad'   => ['emoji' => '😢', 'label' => 'Very Sad']
          ];
          foreach ($moods as $key => $meta):
            $isSelected = ($currentMood === $key);
          ?>
            <button type="button" class="mood-btn <?php echo $isSelected ? 'selected' : ''; ?>" data-mood="<?php echo $key; ?>">
              <span class="mood-emoji"><?php echo $meta['emoji']; ?></span>
              <span><?php echo $meta['label']; ?></span>
            </button>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Sliders: Stress & Energy Levels -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
        
        <div class="form-group range-slider-wrapper">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <label class="form-label" style="margin-bottom: 0;">Stress Level (1 - 10)</label>
            <span id="stressDisplay" class="badge badge-warning" style="font-size: 0.9rem;"><?php echo $currentStress; ?></span>
          </div>
          <input type="range" id="stressRange" name="stress_level" class="form-range" min="1" max="10" value="<?php echo $currentStress; ?>">
          <div class="range-slider-labels">
            <span>1 (Very Calm)</span>
            <span>5 (Moderate)</span>
            <span>10 (Overwhelmed)</span>
          </div>
        </div>

        <div class="form-group range-slider-wrapper">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <label class="form-label" style="margin-bottom: 0;">Energy Level (1 - 10)</label>
            <span id="energyDisplay" class="badge badge-success" style="font-size: 0.9rem;"><?php echo $currentEnergy; ?></span>
          </div>
          <input type="range" id="energyRange" name="energy_level" class="form-range" min="1" max="10" value="<?php echo $currentEnergy; ?>">
          <div class="range-slider-labels">
            <span>1 (Exhausted)</span>
            <span>5 (Balanced)</span>
            <span>10 (High Energy)</span>
          </div>
        </div>

      </div>

      <!-- Sleep Duration Input -->
      <div class="form-group" style="max-width: 320px; margin-top: 1rem;">
        <label class="form-label" for="sleep_hours">Hours of Sleep Last Night *</label>
        <div style="position: relative;">
          <input type="number" step="0.1" min="0" max="24" id="sleep_hours" name="sleep_hours" class="form-control" placeholder="e.g. 7.5" value="<?php echo escape($currentSleep); ?>" required>
        </div>
      </div>

      <!-- Journal Reflection Area with AI/NLP Preview -->
      <div class="form-group" style="margin-top: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
          <label class="form-label" for="journalInput" style="margin-bottom: 0;">
            <i class="fa-solid fa-book-open text-primary"></i> Daily Journal / Thought Reflection (Optional)
          </label>
          <button type="button" id="btnAnalyzeJournal" class="btn btn-outline btn-sm">
            <i class="fa-solid fa-wand-magic-sparkles text-primary"></i> Analyze with AI / NLP
          </button>
        </div>
        <textarea id="journalInput" name="journal" rows="4" class="form-control" placeholder="Write about your day, classes, study workload, social experiences, or anything on your mind..."><?php echo escape($currentJournal); ?></textarea>
      </div>

      <!-- Live AI NLP Result Card (Filled asynchronously via api/analyze_journal.php) -->
      <div id="journalAiResults" class="ai-journal-result">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="ai-badge"><i class="fa-solid fa-brain"></i> AI Sentiment & Emotional Insights</span>
          <span id="aiSentimentBadge" class="badge badge-neutral">Analyzing</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.75rem; font-size: 0.88rem;">
          <div><strong>Primary Theme:</strong> <span id="aiEmotionalTheme" style="color: #4f46e5;">-</span></div>
          <div><strong>Stress Indicator:</strong> <span id="aiStressIndicator" style="color: #e11d48;">-</span></div>
        </div>

        <p id="aiSummaryText" style="font-size: 0.88rem; color: #475569; background: #f8fafc; padding: 0.75rem; border-radius: 8px; margin: 0; line-height: 1.5;"></p>

        <!-- Safety Crisis Banner if flagged -->
        <div id="aiCrisisAlert" class="alert alert-danger" style="display: none; margin-top: 1rem;">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div>
            <strong>Support Notice:</strong> We noticed you might be going through extreme distress. Please consider reaching out to your campus counseling department or calling <strong>14416</strong> (Tele-MANAS, 24x7).
          </div>
        </div>
      </div>

      <div style="margin-top: 2rem; display: flex; gap: 1rem;">
        <button type="submit" class="btn btn-primary" style="padding: 0.85rem 2rem;">
          <i class="fa-solid fa-floppy-disk"></i> Save Today's Mood Entry
        </button>
        <a href="dashboard.php" class="btn btn-outline">Cancel</a>
      </div>

    </form>

  </div>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

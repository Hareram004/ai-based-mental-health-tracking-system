<?php
/**
 * Student Daily Mood & AI Journal History
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

requireStudent();

$user = getCurrentUser();
$db = getDB();

// Fetch all mood entries with their corresponding AI journal analysis
$stmt = $db->prepare("
    SELECT m.*, j.sentiment as ai_sentiment, j.emotional_theme, j.stress_indicator, j.ai_summary
    FROM mood_entries m
    LEFT JOIN journal_analysis j ON m.id = j.mood_entry_id
    WHERE m.user_id = ?
    ORDER BY m.entry_date DESC
");
$stmt->execute([$user['id']]);
$logs = $stmt->fetchAll();

$pageTitle = "Mood & Reflection Journal";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width: 900px; margin: 2rem auto 4rem;">
  
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
    <div>
      <h2>Mood & AI Reflection Journal</h2>
      <p style="color: #64748b; font-size: 0.95rem; margin-top: 0.25rem;">
        Historical logs of your daily emotional states, sleep duration, and AI-assisted reflections.
      </p>
    </div>
    <a href="mood_tracker.php" class="btn btn-primary btn-sm">
      <i class="fa-solid fa-plus"></i> New Mood Entry
    </a>
  </div>

  <?php if (empty($logs)): ?>
    <div class="card" style="text-align: center; padding: 3rem 1.5rem;">
      <i class="fa-regular fa-face-smile" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
      <h3>No Mood Entries Yet</h3>
      <p style="color: #64748b; margin-top: 0.5rem; margin-bottom: 1.5rem;">
        Begin logging your daily mood, sleep hours, and journal reflections.
      </p>
      <a href="mood_tracker.php" class="btn btn-primary">Log First Entry</a>
    </div>
  <?php else: ?>

    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      <?php foreach ($logs as $item): ?>
        <div class="card" style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 1.75rem; line-height: 1;">
                <?php 
                  $icons = ['Very Happy' => '😄', 'Happy' => '🙂', 'Neutral' => '😐', 'Sad' => '😔', 'Very Sad' => '😢'];
                  echo $icons[$item['mood']] ?? '🙂';
                ?>
              </span>
              <div>
                <h3 style="font-size: 1.1rem; margin: 0;"><?php echo escape($item['mood']); ?></h3>
                <span style="font-size: 0.8rem; color: #64748b;">
                  <?php echo date('l, M d, Y', strtotime($item['entry_date'])); ?>
                </span>
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              <span class="badge badge-neutral"><i class="fa-solid fa-bed"></i> <?php echo $item['sleep_hours']; ?> hrs</span>
              <span class="badge badge-warning"><i class="fa-solid fa-gauge"></i> Stress <?php echo $item['stress_level']; ?>/10</span>
              <span class="badge badge-success"><i class="fa-solid fa-bolt"></i> Energy <?php echo $item['energy_level']; ?>/10</span>
            </div>
          </div>

          <?php if (!empty($item['journal'])): ?>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-top: 0.5rem;">
              <p style="font-size: 0.9rem; color: #334155; margin: 0; line-height: 1.5; font-style: italic;">
                "<?php echo escape($item['journal']); ?>"
              </p>

              <?php if (!empty($item['ai_summary'])): ?>
                <div style="border-top: 1px dashed #cbd5e1; margin-top: 0.75rem; padding-top: 0.75rem; font-size: 0.82rem; color: #475569;">
                  <strong><i class="fa-solid fa-wand-magic-sparkles text-primary"></i> AI Theme:</strong> <?php echo escape($item['emotional_theme']); ?> &bull; 
                  <span><?php echo escape($item['ai_summary']); ?></span>
                </div>
              <?php endif; ?>
            </div>
          <?php endif; ?>
        </div>
      <?php endforeach; ?>
    </div>

  <?php endif; ?>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

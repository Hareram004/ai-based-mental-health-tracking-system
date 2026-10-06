<?php
/**
 * Student Mental Health Assessment
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

// Ensure user is an authenticated student
requireStudent();

$db = getDB();

// Fetch active questions grouped by category
$stmt = $db->query("SELECT * FROM questions WHERE status = 'active' ORDER BY id ASC");
$allQuestions = $stmt->fetchAll();

$categories = [];
foreach ($allQuestions as $q) {
    $categories[$q['category']][] = $q;
}

$pageTitle = "Mental Health Self-Assessment";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width: 900px; margin: 2rem auto 4rem;">
  
  <!-- Header Card with Progress Indicator -->
  <div class="card" style="margin-bottom: 2rem; position: sticky; top: 85px; z-index: 40; backdrop-filter: blur(8px); background: rgba(255,255,255,0.96);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
      <div>
        <h2>Comprehensive Wellness Assessment</h2>
        <p style="color: #64748b; font-size: 0.9rem; margin-top: 0.2rem;">
          Rate how frequently you experienced each statement over the past 2 weeks.
        </p>
      </div>
      <div>
        <span class="badge badge-neutral" style="font-size: 0.9rem; padding: 0.4rem 0.9rem;">
          <span id="assessmentAnsweredCount">0</span> / <?php echo count($allQuestions); ?> Answered
        </span>
      </div>
    </div>

    <!-- Live Progress Bar -->
    <div class="progress-bar-bg" style="height: 8px;">
      <div id="assessmentProgressFill" class="progress-bar-fill progress-low" style="width: 0%;"></div>
    </div>
  </div>

  <form id="assessmentForm" method="POST" action="submit_assessment.php">
    <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">

    <?php 
    $catIcons = [
      'Academic Stress' => 'fa-graduation-cap',
      'Social Life' => 'fa-users',
      'Family Environment' => 'fa-house-chimney-user',
      'Social Media' => 'fa-hashtag',
      'Physical Health' => 'fa-heart-pulse',
      'Campus Environment' => 'fa-building-columns',
      'Financial Stress' => 'fa-wallet'
    ];
    ?>

    <?php foreach ($categories as $categoryName => $questions): ?>
      <div style="margin-bottom: 2.5rem;">
        
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: #eef2ff; color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
            <i class="fa-solid <?php echo $catIcons[$categoryName] ?? 'fa-circle-question'; ?>"></i>
          </div>
          <div>
            <h3 style="font-size: 1.25rem;"><?php echo escape($categoryName); ?></h3>
            <span style="font-size: 0.82rem; color: #64748b;"><?php echo count($questions); ?> questions</span>
          </div>
        </div>

        <?php foreach ($questions as $q): ?>
          <div class="likert-question-card">
            <div class="likert-question-text">
              <span style="color: var(--primary); font-weight: 800; margin-right: 0.35rem;">Q<?php echo $q['id']; ?>.</span>
              <?php echo escape($q['question']); ?>
            </div>

            <div class="likert-options">
              <?php 
              $options = [
                1 => ['label' => 'Never', 'hint' => '0% of time'],
                2 => ['label' => 'Rarely', 'hint' => 'Occasionally'],
                3 => ['label' => 'Sometimes', 'hint' => 'Moderate'],
                4 => ['label' => 'Often', 'hint' => 'Frequent'],
                5 => ['label' => 'Always', 'hint' => 'Persistent']
              ];
              ?>
              <?php foreach ($options as $val => $opt): ?>
                <label class="likert-option-label">
                  <input type="radio" name="answers[<?php echo $q['id']; ?>]" value="<?php echo $val; ?>" required>
                  <span><?php echo $opt['label']; ?></span>
                  <span style="font-size: 0.72rem; color: #94a3b8;"><?php echo $opt['hint']; ?></span>
                </label>
              <?php endforeach; ?>
            </div>
          </div>
        <?php endforeach; ?>

      </div>
    <?php endforeach; ?>

    <!-- Submission Card -->
    <div class="card" style="text-align: center; padding: 2rem; margin-top: 2rem;">
      <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 1.25rem;">
        Please ensure all 30 questions have been marked before finalizing your responses.
      </p>
      <button type="submit" class="btn btn-primary" style="padding: 0.9rem 2.5rem; font-size: 1.05rem;">
        <i class="fa-solid fa-calculator"></i> Submit Assessment & Calculate Score
      </button>
    </div>

  </form>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

<?php
/**
 * Student Wellness Dashboard
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

requireStudent();

$user = getCurrentUser();
$db = getDB();

// 1. Fetch student's latest assessment
$stmt = $db->prepare("SELECT * FROM assessments WHERE user_id = ? ORDER BY id DESC LIMIT 1");
$stmt->execute([$user['id']]);
$latestAssessment = $stmt->fetch();

// 2. Fetch today's mood entry
$todayDate = date('Y-m-d');
$moodStmt = $db->prepare("SELECT * FROM mood_entries WHERE user_id = ? AND entry_date = ? LIMIT 1");
$moodStmt->execute([$user['id'], $todayDate]);
$todayMood = $moodStmt->fetch();

// 3. Fetch recent mood entries for charts (last 7 days)
$histStmt = $db->prepare("SELECT * FROM mood_entries WHERE user_id = ? ORDER BY entry_date DESC LIMIT 7");
$histStmt->execute([$user['id']]);
$recentMoods = array_reverse($histStmt->fetchAll());

// 4. Calculate category scores from latest assessment if exists
$categoryScores = [];
if ($latestAssessment) {
    $catStmt = $db->prepare("
        SELECT q.category, q.reverse_score, aa.answer
        FROM assessment_answers aa
        JOIN questions q ON aa.question_id = q.id
        WHERE aa.assessment_id = ?
    ");
    $catStmt->execute([$latestAssessment['id']]);
    $answers = $catStmt->fetchAll();

    foreach ($answers as $row) {
        $c = $row['category'];
        if (!isset($categoryScores[$c])) {
            $categoryScores[$c] = ['total' => 0, 'count' => 0];
        }
        $val = adjustAnswerScore($row['answer'], (bool)$row['reverse_score']);
        $categoryScores[$c]['total'] += $val;
        $categoryScores[$c]['count']++;
    }

    foreach ($categoryScores as $catName => &$data) {
        $min = $data['count'] * 1;
        $max = $data['count'] * 5;
        $data['percentage'] = ($max > $min) ? round((($data['total'] - $min) / ($max - $min)) * 100, 1) : 0;
    }
}

// 5. Fetch latest AI Journal Analysis
$aiStmt = $db->prepare("SELECT * FROM journal_analysis WHERE user_id = ? ORDER BY id DESC LIMIT 1");
$aiStmt->execute([$user['id']]);
$latestAiJournal = $aiStmt->fetch();

$pageTitle = "Student Wellness Dashboard";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="padding-top: 1.5rem; padding-bottom: 4rem;">
  
  <!-- Dashboard Top Welcome Header -->
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
    <div>
      <span class="badge badge-neutral" style="margin-bottom: 0.35rem;">
        <i class="fa-solid fa-graduation-cap"></i> <?php echo escape($user['college']); ?>
      </span>
      <h2>Welcome back, <?php echo escape($user['name']); ?> 👋</h2>
      <p style="color: #64748b; font-size: 0.92rem;">
        Course: <strong><?php echo escape($user['course']); ?></strong> &bull; Today is <?php echo date('l, F j, Y'); ?>
      </p>
    </div>

    <div style="display: flex; gap: 0.75rem;">
      <a href="mood_tracker.php" class="btn btn-outline btn-sm">
        <i class="fa-regular fa-face-smile"></i> Log Mood
      </a>
      <a href="assessment.php" class="btn btn-primary btn-sm">
        <i class="fa-solid fa-clipboard-check"></i> Take Assessment
      </a>
    </div>
  </div>

  <!-- Key Wellness Metric Cards -->
  <div class="stats-overview">
    
    <!-- Wellness Score Card -->
    <div class="stat-card primary">
      <div class="stat-info">
        <div class="stat-label">Wellness Score</div>
        <div class="stat-value">
          <?php if ($latestAssessment): ?>
            <?php echo round(100 - (float)$latestAssessment['percentage']); ?><span style="font-size: 1.1rem; color: #94a3b8;">/100</span>
          <?php else: ?>
            <span style="font-size: 1.25rem; color: #94a3b8;">Not Taken</span>
          <?php endif; ?>
        </div>
        <div class="stat-sub">
          <?php echo $latestAssessment ? 'Normalized Emotional Index' : 'Start your first survey'; ?>
        </div>
      </div>
      <div class="stat-icon primary">
        <i class="fa-solid fa-chart-simple"></i>
      </div>
    </div>

    <!-- Stress Level Classification Card -->
    <div class="stat-card <?php echo $latestAssessment ? ($latestAssessment['stress_level'] === 'Low Stress' ? 'success' : ($latestAssessment['stress_level'] === 'Moderate Stress' ? 'warning' : 'accent')) : 'primary'; ?>">
      <div class="stat-info">
        <div class="stat-label">Stress Classification</div>
        <div class="stat-value" style="font-size: 1.45rem;">
          <?php if ($latestAssessment): ?>
            <span class="badge <?php echo getStressColorClass($latestAssessment['stress_level']); ?>" style="font-size: 1rem; padding: 0.35rem 0.85rem;">
              <?php echo escape($latestAssessment['stress_level']); ?>
            </span>
          <?php else: ?>
            <span style="font-size: 1.1rem; color: #94a3b8;">Pending</span>
          <?php endif; ?>
        </div>
        <div class="stat-sub">
          <?php echo $latestAssessment ? 'Score: ' . $latestAssessment['percentage'] . '%' : 'No assessment data'; ?>
        </div>
      </div>
      <div class="stat-icon warning">
        <i class="fa-solid fa-shield-heart"></i>
      </div>
    </div>

    <!-- Today's Mood Card -->
    <div class="stat-card success">
      <div class="stat-info">
        <div class="stat-label">Today's Mood</div>
        <div class="stat-value" style="font-size: 1.45rem;">
          <?php if ($todayMood): ?>
            <?php 
              $moodIcons = ['Very Happy' => '😄', 'Happy' => '🙂', 'Neutral' => '😐', 'Sad' => '😔', 'Very Sad' => '😢'];
              echo ($moodIcons[$todayMood['mood']] ?? '🙂') . ' ' . escape($todayMood['mood']);
            ?>
          <?php else: ?>
            <span style="font-size: 1.1rem; color: #94a3b8;">Not Logged</span>
          <?php endif; ?>
        </div>
        <div class="stat-sub">
          <?php echo $todayMood ? 'Stress Level: ' . $todayMood['stress_level'] . '/10' : '<a href="mood_tracker.php">Log mood now</a>'; ?>
        </div>
      </div>
      <div class="stat-icon success">
        <i class="fa-regular fa-face-smile"></i>
      </div>
    </div>

    <!-- Sleep Duration Card -->
    <div class="stat-card accent">
      <div class="stat-info">
        <div class="stat-label">Sleep Last Night</div>
        <div class="stat-value">
          <?php if ($todayMood): ?>
            <?php echo escape($todayMood['sleep_hours']); ?> <span style="font-size: 1rem; color: #94a3b8;">Hours</span>
          <?php else: ?>
            <span style="font-size: 1.1rem; color: #94a3b8;">--</span>
          <?php endif; ?>
        </div>
        <div class="stat-sub">
          <?php if ($todayMood): ?>
            <?php echo ($todayMood['sleep_hours'] >= 7.0) ? 'Optimal sleep duration' : 'Below recommended 7+ hrs'; ?>
          <?php else: ?>
            Daily circadian tracker
          <?php endif; ?>
        </div>
      </div>
      <div class="stat-icon accent">
        <i class="fa-solid fa-moon"></i>
      </div>
    </div>

  </div>

  <!-- Interactive Charts & Analytics Grid -->
  <div class="dashboard-grid">
    
    <!-- 7-Day Mood & Stress Correlation Chart (8 Cols) -->
    <div class="card" style="grid-column: span 8 / span 12;">
      <div class="card-header">
        <div>
          <h3 style="font-size: 1.15rem;"><i class="fa-solid fa-chart-line text-primary"></i> 7-Day Mood & Stress Correlation</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin-top: 0.2rem;">Track relationship between logged mood and perceived stress.</p>
        </div>
        <a href="mood_tracker.php" class="btn btn-outline btn-sm"><i class="fa-solid fa-plus"></i> New Entry</a>
      </div>
      
      <div style="height: 280px; position: relative;">
        <canvas id="weeklyMoodChart"></canvas>
      </div>
    </div>

    <!-- Category Stress Radar / Bar Chart (4 Cols) -->
    <div class="card" style="grid-column: span 4 / span 12;">
      <div class="card-header">
        <div>
          <h3 style="font-size: 1.15rem;"><i class="fa-solid fa-chart-pie text-secondary"></i> Stress Radar</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin-top: 0.2rem;">Multi-category balance map</p>
        </div>
      </div>
      
      <div style="height: 280px; position: relative;">
        <?php if ($latestAssessment && !empty($categoryScores)): ?>
          <canvas id="categoryRadarChart"></canvas>
        <?php else: ?>
          <div style="text-align: center; padding-top: 4rem; color: #94a3b8;">
            <i class="fa-solid fa-clipboard-question" style="font-size: 2.5rem; margin-bottom: 0.75rem;"></i>
            <p style="font-size: 0.9rem;">No assessment taken yet.</p>
            <a href="assessment.php" class="btn btn-primary btn-sm" style="margin-top: 0.5rem;">Take Assessment</a>
          </div>
        <?php endif; ?>
      </div>
    </div>

    <!-- Category-Wise Stress Breakdown Progress Bars (6 Cols) -->
    <div class="card" style="grid-column: span 6 / span 12;">
      <div class="card-header">
        <div>
          <h3 style="font-size: 1.15rem;"><i class="fa-solid fa-bars-progress text-primary"></i> Category-Wise Stress Breakdown</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin-top: 0.2rem;">Detailed percentage per wellness domain (0% low, 100% elevated)</p>
        </div>
        <a href="recommendations.php" class="btn btn-outline btn-sm">View Tips</a>
      </div>

      <?php if (!empty($categoryScores)): ?>
        <div class="category-progress-list">
          <?php foreach ($categoryScores as $catName => $cData): 
            $pct = $cData['percentage'];
            $fillClass = ($pct <= 33.33) ? 'progress-low' : (($pct <= 66.66) ? 'progress-moderate' : 'progress-high');
          ?>
            <div>
              <div class="category-item-header">
                <span class="category-name"><?php echo escape($catName); ?></span>
                <span class="category-score"><?php echo $pct; ?>%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill <?php echo $fillClass; ?>" style="width: <?php echo $pct; ?>%;"></div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      <?php else: ?>
        <div style="text-align: center; padding: 2.5rem 0; color: #94a3b8;">
          <p>Complete the assessment to populate category stress breakdown.</p>
          <a href="assessment.php" class="btn btn-primary btn-sm" style="margin-top: 0.5rem;">Start Assessment</a>
        </div>
      <?php endif; ?>
    </div>

    <!-- Sleep Trend & AI Reflection Box (6 Cols) -->
    <div class="card" style="grid-column: span 6 / span 12;">
      <div class="card-header">
        <div>
          <h3 style="font-size: 1.15rem;"><i class="fa-solid fa-bed text-accent"></i> Sleep Duration Trend (Hours)</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin-top: 0.2rem;">Green indicates meeting 7+ hour restorative target</p>
        </div>
      </div>
      
      <div style="height: 180px; position: relative; margin-bottom: 1.5rem;">
        <canvas id="sleepTrendChart"></canvas>
      </div>

      <!-- AI Journal Sentiment Snippet -->
      <?php if ($latestAiJournal): ?>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <span class="ai-badge"><i class="fa-solid fa-brain"></i> Latest AI Journal Sentiment</span>
            <span class="badge <?php echo ($latestAiJournal['sentiment'] === 'Positive' ? 'badge-success' : ($latestAiJournal['sentiment'] === 'Negative' ? 'badge-danger' : 'badge-warning')); ?>">
              <?php echo escape($latestAiJournal['sentiment']); ?>
            </span>
          </div>
          <p style="font-size: 0.85rem; color: #475569; margin: 0; line-height: 1.5;">
            <strong>Theme:</strong> <?php echo escape($latestAiJournal['emotional_theme']); ?><br>
            <?php echo escape($latestAiJournal['ai_summary']); ?>
          </p>
        </div>
      <?php endif; ?>
    </div>

  </div>

</div>

<!-- Pass dynamic data from PHP to Chart.js in vanilla JS -->
<script>
document.addEventListener('DOMContentLoaded', function () {
  <?php
    $chartDates = [];
    $chartMoods = [];
    $chartStress = [];
    $chartSleep = [];
    $moodScale = ['Very Sad' => 1, 'Sad' => 2, 'Neutral' => 3, 'Happy' => 4, 'Very Happy' => 5];

    foreach ($recentMoods as $m) {
        $chartDates[] = date('M d', strtotime($m['entry_date']));
        $chartMoods[] = $moodScale[$m['mood']] ?? 3;
        $chartStress[] = (int)$m['stress_level'];
        $chartSleep[] = (float)$m['sleep_hours'];
    }

    $radarLabels = [];
    $radarValues = [];
    foreach ($categoryScores as $cn => $cd) {
        $radarLabels[] = $cn;
        $radarValues[] = $cd['percentage'];
    }
  ?>

  const dates = <?php echo json_encode($chartDates); ?>;
  const moodScores = <?php echo json_encode($chartMoods); ?>;
  const stressScores = <?php echo json_encode($chartStress); ?>;
  const sleepHours = <?php echo json_encode($chartSleep); ?>;

  // Render 7-day mood & stress chart
  MindPulseCharts.renderWeeklyMoodChart('weeklyMoodChart', dates, moodScores, stressScores);

  // Render sleep duration chart
  MindPulseCharts.renderSleepTrendChart('sleepTrendChart', dates, sleepHours);

  // Render radar chart if category data exists
  const catLabels = <?php echo json_encode($radarLabels); ?>;
  const catValues = <?php echo json_encode($radarValues); ?>;
  if (catLabels.length > 0) {
    MindPulseCharts.renderCategoryRadarChart('categoryRadarChart', catLabels, catValues);
  }
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

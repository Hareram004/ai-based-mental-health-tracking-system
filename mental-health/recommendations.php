<?php
/**
 * Personalized Wellness Recommendations
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

requireStudent();

$user = getCurrentUser();
$db = getDB();

// Fetch latest assessment
$stmt = $db->prepare("SELECT * FROM assessments WHERE user_id = ? ORDER BY id DESC LIMIT 1");
$stmt->execute([$user['id']]);
$assessment = $stmt->fetch();

$catScores = [];
$recommendationsList = [];

if ($assessment) {
    // Calculate category percentages
    $qStmt = $db->prepare("
        SELECT q.category, q.reverse_score, aa.answer
        FROM assessment_answers aa
        JOIN questions q ON aa.question_id = q.id
        WHERE aa.assessment_id = ?
    ");
    $qStmt->execute([$assessment['id']]);
    $answers = $qStmt->fetchAll();

    foreach ($answers as $row) {
        $c = $row['category'];
        if (!isset($catScores[$c])) {
            $catScores[$c] = ['total' => 0, 'count' => 0];
        }
        $val = adjustAnswerScore($row['answer'], (bool)$row['reverse_score']);
        $catScores[$c]['total'] += $val;
        $catScores[$c]['count']++;
    }

    // Match recommendations from database for each category
    $recQuery = $db->prepare("
        SELECT recommendation 
        FROM recommendations 
        WHERE category = ? AND ? >= min_score AND ? <= max_score AND status = 'active'
        LIMIT 2
    ");

    foreach ($catScores as $catName => $data) {
        $min = $data['count'] * 1;
        $max = $data['count'] * 5;
        $pct = ($max > $min) ? round((($data['total'] - $min) / ($max - $min)) * 100, 1) : 0;

        $recQuery->execute([$catName, $pct, $pct]);
        $recs = $recQuery->fetchAll();

        $recommendationsList[$catName] = [
            'percentage' => $pct,
            'stress_level' => classifyStressLevel($pct),
            'tips' => $recs
        ];
    }
}

$pageTitle = "Personalized Wellness Guidance";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width: 900px; margin: 2rem auto 4rem;">
  
  <div style="margin-bottom: 2rem;">
    <h2>Personalized Academic & Wellness Guidance</h2>
    <p style="color: #64748b; font-size: 0.95rem; margin-top: 0.25rem;">
      Empirical coping strategies and university balance recommendations grounded in your recent assessment.
    </p>
  </div>

  <?php if (!$assessment): ?>
    <div class="card" style="text-align: center; padding: 3rem 1.5rem;">
      <i class="fa-solid fa-lightbulb" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
      <h3>No Assessment Data Found</h3>
      <p style="color: #64748b; max-width: 480px; margin: 0.5rem auto 1.5rem;">
        Take your 30-question self-assessment to generate personalized wellness recommendations across academics, sleep, and social balance.
      </p>
      <a href="assessment.php" class="btn btn-primary"><i class="fa-solid fa-clipboard-check"></i> Take Assessment</a>
    </div>
  <?php else: ?>

    <div class="card" style="background: linear-gradient(135deg, #eef2ff 0%, #f0fdfa 100%); border: 1px solid #c7d2fe; margin-bottom: 2rem; padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span style="font-size: 0.8rem; font-weight: 700; color: #4338ca; text-transform: uppercase;">Current Overall Profile</span>
          <h3 style="color: #1e1b4b; margin-top: 0.2rem;"><?php echo escape($assessment['stress_level']); ?> (<?php echo $assessment['percentage']; ?>% Stress Indicator)</h3>
          <p style="font-size: 0.88rem; color: #4338ca; margin: 0;">Completed on <?php echo date('M d, Y', strtotime($assessment['created_at'])); ?></p>
        </div>
        <a href="assessment.php" class="btn btn-outline btn-sm" style="background: white;">Retake Assessment</a>
      </div>
    </div>

    <!-- Recommendations Grouped by Domain -->
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <?php foreach ($recommendationsList as $catName => $info): ?>
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <h3 style="font-size: 1.15rem;"><?php echo escape($catName); ?></h3>
              <span class="badge <?php echo getStressColorClass($info['stress_level']); ?>">
                <?php echo escape($info['stress_level']); ?> (<?php echo $info['percentage']; ?>%)
              </span>
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            <div class="progress-bar-bg" style="height: 6px;">
              <div class="progress-bar-fill <?php echo ($info['percentage'] <= 33) ? 'progress-low' : (($info['percentage'] <= 66) ? 'progress-moderate' : 'progress-high'); ?>" style="width: <?php echo $info['percentage']; ?>%;"></div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <?php if (!empty($info['tips'])): ?>
              <?php foreach ($info['tips'] as $tip): ?>
                <div style="background: #f8fafc; border-left: 3px solid var(--primary); padding: 0.85rem 1rem; border-radius: 0 8px 8px 0; font-size: 0.92rem; color: #334155; line-height: 1.5;">
                  <i class="fa-solid fa-check text-primary" style="margin-right: 0.4rem;"></i>
                  <?php echo escape($tip['recommendation']); ?>
                </div>
              <?php endforeach; ?>
            <?php else: ?>
              <p style="font-size: 0.88rem; color: #64748b; font-style: italic;">
                Maintain your current pacing and reach out to academic advisors if schedules become congested.
              </p>
            <?php endif; ?>
          </div>
        </div>
      <?php endforeach; ?>
    </div>

  <?php endif; ?>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

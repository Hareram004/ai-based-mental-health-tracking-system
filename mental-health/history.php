<?php
/**
 * Student Assessment History & Printable Report
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

requireStudent();

$user = getCurrentUser();
$db = getDB();

// Fetch student's assessment history
$stmt = $db->prepare("SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$user['id']]);
$assessments = $stmt->fetchAll();

// Check if student is inspecting a specific assessment details
$selectedId = isset($_GET['view']) ? (int)$_GET['view'] : null;
$viewAssessment = null;
$viewAnswers = [];

if ($selectedId) {
    $vStmt = $db->prepare("SELECT * FROM assessments WHERE id = ? AND user_id = ? LIMIT 1");
    $vStmt->execute([$selectedId, $user['id']]);
    $viewAssessment = $vStmt->fetch();

    if ($viewAssessment) {
        $aStmt = $db->prepare("
            SELECT q.id, q.category, q.question, q.reverse_score, aa.answer
            FROM assessment_answers aa
            JOIN questions q ON aa.question_id = q.id
            WHERE aa.assessment_id = ?
            ORDER BY q.id ASC
        ");
        $aStmt->execute([$selectedId]);
        $viewAnswers = $aStmt->fetchAll();
    }
}

$pageTitle = "Assessment History & Reports";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width: 960px; margin: 2rem auto 4rem;">
  
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;" class="no-print">
    <div>
      <h2>Assessment History & Progress Tracking</h2>
      <p style="color: #64748b; font-size: 0.95rem; margin-top: 0.25rem;">
        Review previous mental wellness surveys and evaluate long-term trends.
      </p>
    </div>
    <div style="display: flex; gap: 0.5rem;">
      <button onclick="window.print()" class="btn btn-outline btn-sm">
        <i class="fa-solid fa-print"></i> Print Wellness Report
      </button>
      <a href="assessment.php" class="btn btn-primary btn-sm">
        <i class="fa-solid fa-plus"></i> New Assessment
      </a>
    </div>
  </div>

  <!-- Detailed Inspection Card if viewed -->
  <?php if ($viewAssessment): ?>
    <div class="card" style="margin-bottom: 2rem; border-color: #cbd5e1;">
      <div class="card-header">
        <div>
          <h3>Detailed Assessment Breakdown (#<?php echo $viewAssessment['id']; ?>)</h3>
          <span style="font-size: 0.85rem; color: #64748b;">
            Date Recorded: <?php echo date('F d, Y h:i A', strtotime($viewAssessment['created_at'])); ?>
          </span>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <span class="badge <?php echo getStressColorClass($viewAssessment['stress_level']); ?>" style="font-size: 0.9rem;">
            <?php echo escape($viewAssessment['stress_level']); ?> (<?php echo $viewAssessment['percentage']; ?>%)
          </span>
          <a href="history.php" class="btn btn-outline btn-sm no-print">Close View</a>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Category</th>
              <th>Survey Question</th>
              <th>Selected Rating (1-5)</th>
              <th>Adjusted Score</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($viewAnswers as $ans): 
              $adj = adjustAnswerScore($ans['answer'], (bool)$ans['reverse_score']);
            ?>
              <tr>
                <td>Q<?php echo $ans['id']; ?></td>
                <td><span class="badge badge-neutral"><?php echo escape($ans['category']); ?></span></td>
                <td><?php echo escape($ans['question']); ?></td>
                <td><strong><?php echo $ans['answer']; ?></strong> / 5</td>
                <td><?php echo $adj; ?> <?php if ($ans['reverse_score']): ?><span style="font-size: 0.72rem; color: #6366f1;">(Reversed)</span><?php endif; ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  <?php endif; ?>

  <!-- Summary Table of All Past Assessments -->
  <div class="card">
    <div class="card-header">
      <h3>Previous Submissions Log</h3>
      <span style="font-size: 0.85rem; color: #64748b;"><?php echo count($assessments); ?> total records</span>
    </div>

    <?php if (empty($assessments)): ?>
      <div style="text-align: center; padding: 2.5rem 0; color: #94a3b8;">
        <p>You have not completed any self-assessments yet.</p>
        <a href="assessment.php" class="btn btn-primary btn-sm" style="margin-top: 0.5rem;">Take Assessment</a>
      </div>
    <?php else: ?>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Raw Score</th>
              <th>Stress %</th>
              <th>Classification</th>
              <th class="no-print">Action</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($assessments as $row): ?>
              <tr>
                <td>
                  <strong><?php echo date('M d, Y', strtotime($row['created_at'])); ?></strong>
                  <div style="font-size: 0.78rem; color: #94a3b8;"><?php echo date('h:i A', strtotime($row['created_at'])); ?></div>
                </td>
                <td><?php echo $row['total_score']; ?> / 150</td>
                <td><strong><?php echo $row['percentage']; ?>%</strong></td>
                <td>
                  <span class="badge <?php echo getStressColorClass($row['stress_level']); ?>">
                    <?php echo escape($row['stress_level']); ?>
                  </span>
                </td>
                <td class="no-print">
                  <a href="history.php?view=<?php echo $row['id']; ?>" class="btn btn-outline btn-sm">
                    <i class="fa-solid fa-eye"></i> Details
                  </a>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

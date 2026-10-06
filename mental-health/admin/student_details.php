<?php
/**
 * Individual Student Full Profile & Case History
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAdmin();

$studentId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($studentId <= 0) {
    header("Location: students.php");
    exit;
}

$db = getDB();

// 1. Fetch student profile
$stmt = $db->prepare("SELECT * FROM users WHERE id = ? AND role = 'student' LIMIT 1");
$stmt->execute([$studentId]);
$student = $stmt->fetch();

if (!$student) {
    $_SESSION['flash_error'] = "Student not found.";
    header("Location: students.php");
    exit;
}

// 2. Fetch student's assessments
$aStmt = $db->prepare("SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC");
$aStmt->execute([$studentId]);
$assessments = $aStmt->fetchAll();

// 3. Fetch mood and journal entries
$mStmt = $db->prepare("
    SELECT m.*, j.sentiment as ai_sentiment, j.emotional_theme, j.stress_indicator, j.ai_summary
    FROM mood_entries m
    LEFT JOIN journal_analysis j ON m.id = j.mood_entry_id
    WHERE m.user_id = ?
    ORDER BY m.entry_date DESC
    LIMIT 14
");
$mStmt->execute([$studentId]);
$moodLogs = $mStmt->fetchAll();

$pageTitle = "Student Record: " . $student['name'];
require_once __DIR__ . '/../includes/header.php';
?>

<div class="container" style="padding-top: 1.5rem; padding-bottom: 4rem;">
  
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;" class="no-print">
    <div>
      <a href="students.php" style="font-size: 0.88rem; color: #64748b; margin-bottom: 0.35rem; display: inline-block;">
        <i class="fa-solid fa-arrow-left"></i> Back to Students Directory
      </a>
      <h2>Case Profile: <?php echo escape($student['name']); ?></h2>
      <p style="color: #64748b; font-size: 0.92rem;">
        ID #<?php echo $student['id']; ?> &bull; Enrolled: <?php echo date('M d, Y', strtotime($student['created_at'])); ?>
      </p>
    </div>

    <div>
      <button onclick="window.print()" class="btn btn-outline btn-sm">
        <i class="fa-solid fa-print"></i> Print Student Wellness Case Report
      </button>
    </div>
  </div>

  <!-- Student Demographics Card -->
  <div class="card" style="margin-bottom: 2rem;">
    <div class="card-header">
      <h3>Student Demographics & Academic Details</h3>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
      <div>
        <span style="font-size: 0.78rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Email</span>
        <div style="font-weight: 600; color: #1e293b;"><?php echo escape($student['email']); ?></div>
      </div>
      <div>
        <span style="font-size: 0.78rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Phone</span>
        <div style="font-weight: 600; color: #1e293b;"><?php echo escape($student['phone'] ?: 'N/A'); ?></div>
      </div>
      <div>
        <span style="font-size: 0.78rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Age / Gender</span>
        <div style="font-weight: 600; color: #1e293b;"><?php echo $student['age']; ?> yrs &bull; <?php echo escape($student['gender']); ?></div>
      </div>
      <div>
        <span style="font-size: 0.78rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">College</span>
        <div style="font-weight: 600; color: #1e293b;"><?php echo escape($student['college']); ?></div>
      </div>
      <div>
        <span style="font-size: 0.78rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Degree Course</span>
        <div style="font-weight: 600; color: #1e293b;"><?php echo escape($student['course']); ?></div>
      </div>
      <div>
        <span style="font-size: 0.78rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Semester / Year</span>
        <div style="font-weight: 600; color: #1e293b;"><?php echo escape($student['year']); ?></div>
      </div>
    </div>
  </div>

  <!-- Assessment History Table -->
  <div class="card" style="margin-bottom: 2rem;">
    <div class="card-header">
      <h3>Self-Assessment History (<?php echo count($assessments); ?>)</h3>
    </div>
    <?php if (empty($assessments)): ?>
      <p style="color: #94a3b8; font-style: italic;">No assessments on record for this student.</p>
    <?php else: ?>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Score (out of 150)</th>
              <th>Stress %</th>
              <th>Classification</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($assessments as $a): ?>
              <tr>
                <td><?php echo date('M d, Y h:i A', strtotime($a['created_at'])); ?></td>
                <td><?php echo $a['total_score']; ?></td>
                <td><strong><?php echo $a['percentage']; ?>%</strong></td>
                <td>
                  <span class="badge <?php echo getStressColorClass($a['stress_level']); ?>">
                    <?php echo escape($a['stress_level']); ?>
                  </span>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>

  <!-- Mood & AI Journal Analysis Logs -->
  <div class="card">
    <div class="card-header">
      <h3>Recent Mood & AI Journal Records (Last 14 Days)</h3>
    </div>
    <?php if (empty($moodLogs)): ?>
      <p style="color: #94a3b8; font-style: italic;">No daily mood logs recorded yet.</p>
    <?php else: ?>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <?php foreach ($moodLogs as $m): ?>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <strong><?php echo date('M d, Y', strtotime($m['entry_date'])); ?></strong> &bull; 
                <span>Mood: <strong><?php echo escape($m['mood']); ?></strong></span>
              </div>
              <div style="display: flex; gap: 0.5rem; font-size: 0.82rem;">
                <span class="badge badge-neutral">Sleep: <?php echo $m['sleep_hours']; ?> hrs</span>
                <span class="badge badge-warning">Stress: <?php echo $m['stress_level']; ?>/10</span>
                <span class="badge badge-success">Energy: <?php echo $m['energy_level']; ?>/10</span>
              </div>
            </div>

            <?php if (!empty($m['journal'])): ?>
              <p style="font-size: 0.88rem; color: #334155; margin: 0.4rem 0; font-style: italic;">
                "<?php echo escape($m['journal']); ?>"
              </p>
              <?php if (!empty($m['ai_summary'])): ?>
                <div style="font-size: 0.8rem; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 0.4rem; margin-top: 0.4rem;">
                  <strong>AI Note:</strong> [<?php echo escape($m['emotional_theme']); ?> / <?php echo escape($m['ai_sentiment'] ?? 'Neutral'); ?>] &mdash; <?php echo escape($m['ai_summary']); ?>
                </div>
              <?php endif; ?>
            <?php endif; ?>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>

</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>

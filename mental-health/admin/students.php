<?php
/**
 * Administrator Student Management
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAdmin();

$admin = getCurrentUser();
$db = getDB();

// Handle Student Deletion
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_delete_student'])) {
    if (verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        $studentId = (int)($_POST['student_id'] ?? 0);
        if ($studentId > 0) {
            $delStmt = $db->prepare("DELETE FROM users WHERE id = ? AND role = 'student'");
            $delStmt->execute([$studentId]);

            recordAdminLog($admin['id'], "Admin deleted student record ID: " . $studentId);
            $_SESSION['flash_success'] = "Student record and associated logs removed successfully.";
            header("Location: students.php");
            exit;
        }
    }
}

// Fetch students with assessment count
$query = "
    SELECT u.*, COUNT(a.id) as assessment_count,
           MAX(a.created_at) as last_assessment_date,
           (SELECT stress_level FROM assessments WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as latest_stress_level
    FROM users u
    LEFT JOIN assessments a ON u.id = a.user_id
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY u.created_at DESC
";
$students = $db->query($query)->fetchAll();

$pageTitle = "Student Management - Admin";
require_once __DIR__ . '/../includes/header.php';
?>

<div class="container" style="padding-top: 1.5rem; padding-bottom: 4rem;">
  
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
    <div>
      <h2>Registered Students Directory</h2>
      <p style="color: #64748b; font-size: 0.92rem;">
        Monitor enrolled students, examination stress classifications, and individual logs.
      </p>
    </div>
    <span class="badge badge-neutral" style="font-size: 0.9rem; padding: 0.4rem 0.85rem;">
      Total: <?php echo count($students); ?> Enrolled Students
    </span>
  </div>

  <div class="card">
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Student Name & Email</th>
            <th>Department / Course</th>
            <th>Year / Semester</th>
            <th>Assessments</th>
            <th>Latest Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($students)): ?>
            <tr>
              <td colspan="6" style="text-align: center; color: #94a3b8; padding: 2rem;">No students registered yet.</td>
            </tr>
          <?php else: ?>
            <?php foreach ($students as $s): ?>
              <tr>
                <td>
                  <strong><?php echo escape($s['name']); ?></strong>
                  <div style="font-size: 0.78rem; color: #94a3b8;">
                    <?php echo escape($s['email']); ?> &bull; <?php echo escape($s['phone'] ?: 'No phone'); ?>
                  </div>
                </td>
                <td>
                  <?php echo escape($s['course']); ?>
                  <div style="font-size: 0.75rem; color: #64748b;"><?php echo escape($s['college']); ?></div>
                </td>
                <td><?php echo escape($s['year']); ?></td>
                <td>
                  <span class="badge badge-neutral"><?php echo $s['assessment_count']; ?> taken</span>
                </td>
                <td>
                  <?php if ($s['latest_stress_level']): ?>
                    <span class="badge <?php echo getStressColorClass($s['latest_stress_level']); ?>">
                      <?php echo escape($s['latest_stress_level']); ?>
                    </span>
                  <?php else: ?>
                    <span style="font-size: 0.8rem; color: #94a3b8;">None</span>
                  <?php endif; ?>
                </td>
                <td>
                  <div style="display: flex; gap: 0.4rem;">
                    <a href="student_details.php?id=<?php echo $s['id']; ?>" class="btn btn-outline btn-sm">
                      <i class="fa-solid fa-folder-open"></i> Details
                    </a>
                    <form method="POST" action="students.php" onsubmit="return confirm('Delete student <?php echo addslashes($s['name']); ?> and all associated history?');" style="display: inline;">
                      <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
                      <input type="hidden" name="student_id" value="<?php echo $s['id']; ?>">
                      <input type="hidden" name="action_delete_student" value="1">
                      <button type="submit" class="btn btn-danger btn-sm" title="Delete Student Record">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>

</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>

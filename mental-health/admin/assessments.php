<?php
/**
 * Administrator All Assessments Browser
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAdmin();

$db = getDB();

$filterStress = isset($_GET['stress']) ? trim($_GET['stress']) : '';

$sql = "
    SELECT a.*, u.name as student_name, u.email as student_email, u.course, u.college
    FROM assessments a
    JOIN users u ON a.user_id = u.id
";
$params = [];

if (!empty($filterStress)) {
    $sql .= " WHERE a.stress_level = ?";
    $params[] = $filterStress;
}

$sql .= " ORDER BY a.created_at DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$assessments = $stmt->fetchAll();

$pageTitle = "All Assessments - Admin Portal";
require_once __DIR__ . '/../includes/header.php';
?>

<div class="container" style="padding-top: 1.5rem; padding-bottom: 4rem;">
  
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
    <div>
      <h2>All Institutional Self-Assessments</h2>
      <p style="color: #64748b; font-size: 0.92rem;">
        Complete historical log of questionnaires evaluated across academic semesters.
      </p>
    </div>

    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <a href="assessments.php" class="btn btn-outline btn-sm <?php echo empty($filterStress) ? 'active' : ''; ?>">All</a>
      <a href="assessments.php?stress=Low+Stress" class="btn btn-outline btn-sm">Low Stress</a>
      <a href="assessments.php?stress=Moderate+Stress" class="btn btn-outline btn-sm">Moderate Stress</a>
      <a href="assessments.php?stress=High+Stress" class="btn btn-outline btn-sm">High Stress</a>
      <button onclick="window.print()" class="btn btn-primary btn-sm no-print"><i class="fa-solid fa-print"></i> Print Log</button>
    </div>
  </div>

  <div class="card">
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Student Name & Email</th>
            <th>Course & College</th>
            <th>Submission Date</th>
            <th>Score</th>
            <th>Stress %</th>
            <th>Classification</th>
            <th class="no-print">Action</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($assessments)): ?>
            <tr>
              <td colspan="8" style="text-align: center; color: #94a3b8; padding: 2.5rem;">
                No assessments found matching the chosen criteria.
              </td>
            </tr>
          <?php else: ?>
            <?php foreach ($assessments as $row): ?>
              <tr>
                <td>#<?php echo $row['id']; ?></td>
                <td>
                  <strong><?php echo escape($row['student_name']); ?></strong>
                  <div style="font-size: 0.78rem; color: #94a3b8;"><?php echo escape($row['student_email']); ?></div>
                </td>
                <td>
                  <?php echo escape($row['course']); ?>
                  <div style="font-size: 0.75rem; color: #64748b;"><?php echo escape($row['college']); ?></div>
                </td>
                <td><?php echo date('M d, Y h:i A', strtotime($row['created_at'])); ?></td>
                <td><?php echo $row['total_score']; ?> / 150</td>
                <td><strong><?php echo $row['percentage']; ?>%</strong></td>
                <td>
                  <span class="badge <?php echo getStressColorClass($row['stress_level']); ?>">
                    <?php echo escape($row['stress_level']); ?>
                  </span>
                </td>
                <td class="no-print">
                  <a href="student_details.php?id=<?php echo $row['user_id']; ?>" class="btn btn-outline btn-sm">
                    <i class="fa-solid fa-user"></i> Student Case
                  </a>
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

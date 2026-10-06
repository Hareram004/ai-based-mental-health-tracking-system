<?php
/**
 * Administrator Overview & Analytics Dashboard
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAdmin();

$admin = getCurrentUser();
$db = getDB();

// 1. Total registered students count
$sCountStmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'student'");
$totalStudents = (int)$sCountStmt->fetchColumn();

// 2. Total assessments count
$aCountStmt = $db->query("SELECT COUNT(*) FROM assessments");
$totalAssessments = (int)$aCountStmt->fetchColumn();

// 3. Stress distribution counts
$lowCountStmt = $db->query("SELECT COUNT(*) FROM assessments WHERE stress_level = 'Low Stress'");
$lowCount = (int)$lowCountStmt->fetchColumn();

$modCountStmt = $db->query("SELECT COUNT(*) FROM assessments WHERE stress_level = 'Moderate Stress'");
$modCount = (int)$modCountStmt->fetchColumn();

$highCountStmt = $db->query("SELECT COUNT(*) FROM assessments WHERE stress_level = 'High Stress'");
$highCount = (int)$highCountStmt->fetchColumn();

// 4. Average wellness percentage
$avgStmt = $db->query("SELECT AVG(percentage) FROM assessments");
$avgStressPct = round((float)$avgStmt->fetchColumn(), 1);
$avgWellnessScore = round(100 - $avgStressPct, 1);

// 5. Recent 8 assessments with student metadata
$recentStmt = $db->query("
    SELECT a.*, u.name as student_name, u.email as student_email, u.course, u.college
    FROM assessments a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 8
");
$recentAssessments = $recentStmt->fetchAll();

// 6. Recent admin activity audit logs
$logStmt = $db->query("SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 5");
$recentLogs = $logStmt->fetchAll();

$pageTitle = "Admin Institutional Analytics";
require_once __DIR__ . '/../includes/header.php';
?>

<div class="container" style="padding-top: 1.5rem; padding-bottom: 4rem;">
  
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
    <div>
      <span class="badge badge-neutral" style="margin-bottom: 0.35rem;">
        <i class="fa-solid fa-building-columns"></i> Institutional Health Cell
      </span>
      <h2>Campus Wellness Administration</h2>
      <p style="color: #64748b; font-size: 0.92rem;">
        Aggregated student population mental wellness metrics, stress classifications, and counseling trends.
      </p>
    </div>

    <div style="display: flex; gap: 0.75rem;">
      <a href="students.php" class="btn btn-outline btn-sm">
        <i class="fa-solid fa-users"></i> View Students (<?php echo $totalStudents; ?>)
      </a>
      <a href="assessments.php" class="btn btn-primary btn-sm">
        <i class="fa-solid fa-list-check"></i> All Assessments
      </a>
    </div>
  </div>

  <!-- Key Aggregate Stat Counters -->
  <div class="stats-overview">
    
    <div class="stat-card primary">
      <div class="stat-info">
        <div class="stat-label">Total Students</div>
        <div class="stat-value"><?php echo $totalStudents; ?></div>
        <div class="stat-sub">Registered accounts</div>
      </div>
      <div class="stat-icon primary">
        <i class="fa-solid fa-user-graduate"></i>
      </div>
    </div>

    <div class="stat-card accent">
      <div class="stat-info">
        <div class="stat-label">Assessments Logged</div>
        <div class="stat-value"><?php echo $totalAssessments; ?></div>
        <div class="stat-sub">Completed questionnaires</div>
      </div>
      <div class="stat-icon accent">
        <i class="fa-solid fa-clipboard-check"></i>
      </div>
    </div>

    <div class="stat-card success">
      <div class="stat-info">
        <div class="stat-label">Low Stress Cohort</div>
        <div class="stat-value" style="color: #059669;"><?php echo $lowCount; ?></div>
        <div class="stat-sub"><?php echo ($totalAssessments > 0) ? round(($lowCount / $totalAssessments) * 100) : 0; ?>% of total samples</div>
      </div>
      <div class="stat-icon success">
        <i class="fa-solid fa-smile"></i>
      </div>
    </div>

    <div class="stat-card warning">
      <div class="stat-info">
        <div class="stat-label">Moderate Stress</div>
        <div class="stat-value" style="color: #d97706;"><?php echo $modCount; ?></div>
        <div class="stat-sub"><?php echo ($totalAssessments > 0) ? round(($modCount / $totalAssessments) * 100) : 0; ?>% of total samples</div>
      </div>
      <div class="stat-icon warning">
        <i class="fa-solid fa-meh"></i>
      </div>
    </div>

    <div class="stat-card" style="border-left: 4px solid #ef4444;">
      <div class="stat-info">
        <div class="stat-label">High Stress Indicator</div>
        <div class="stat-value" style="color: #dc2626;"><?php echo $highCount; ?></div>
        <div class="stat-sub">Recommended for counselor outreach</div>
      </div>
      <div class="stat-icon" style="background: #fee2e2; color: #dc2626;">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
    </div>

  </div>

  <!-- Analytical Visual Charts Grid -->
  <div class="dashboard-grid">
    
    <!-- Stress Cohort Distribution Doughnut Chart (5 Cols) -->
    <div class="card" style="grid-column: span 5 / span 12;">
      <div class="card-header">
        <div>
          <h3 style="font-size: 1.15rem;"><i class="fa-solid fa-chart-pie text-primary"></i> Stress Level Distribution</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin-top: 0.2rem;">Campus-wide classification breakdown</p>
        </div>
      </div>
      <div style="height: 280px; position: relative;">
        <canvas id="adminStressDoughnut"></canvas>
      </div>
    </div>

    <!-- Average Wellness Metric & Quick Actions (7 Cols) -->
    <div class="card" style="grid-column: span 7 / span 12;">
      <div class="card-header">
        <div>
          <h3 style="font-size: 1.15rem;"><i class="fa-solid fa-gauge-high text-secondary"></i> Institutional Wellness Health Index</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin-top: 0.2rem;">Mean campus mental equilibrium baseline</p>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 2rem; padding: 1rem 0; flex-wrap: wrap;">
        <div style="text-align: center; min-width: 160px;">
          <div style="font-size: 3.25rem; font-weight: 800; color: #0f172a; line-height: 1;">
            <?php echo $avgWellnessScore; ?><span style="font-size: 1.5rem; color: #94a3b8;">/100</span>
          </div>
          <div style="font-size: 0.85rem; color: #64748b; margin-top: 0.4rem;">Institutional Average Score</div>
        </div>

        <div style="flex: 1; min-width: 240px;">
          <div style="margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">
              <span>Low Stress Rate</span>
              <span style="color: #10b981;"><?php echo ($totalAssessments > 0) ? round(($lowCount / $totalAssessments) * 100) : 0; ?>%</span>
            </div>
            <div class="progress-bar-bg" style="height: 8px;">
              <div class="progress-bar-fill progress-low" style="width: <?php echo ($totalAssessments > 0) ? round(($lowCount / $totalAssessments) * 100) : 0; ?>%;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">
              <span>High Stress Intervention Need</span>
              <span style="color: #ef4444;"><?php echo ($totalAssessments > 0) ? round(($highCount / $totalAssessments) * 100) : 0; ?>%</span>
            </div>
            <div class="progress-bar-bg" style="height: 8px;">
              <div class="progress-bar-fill progress-high" style="width: <?php echo ($totalAssessments > 0) ? round(($highCount / $totalAssessments) * 100) : 0; ?>%;"></div>
            </div>
          </div>
        </div>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 1rem; margin-top: 1rem; font-size: 0.85rem; color: #475569; display: flex; gap: 0.75rem; align-items: center;">
        <i class="fa-solid fa-circle-info text-primary" style="font-size: 1.25rem;"></i>
        <span>
          <strong>Ethical Campus Protocol:</strong> Individual assessments should remain supportive. The counseling cell may utilize aggregate trends to arrange wellness workshops during mid-term examination windows.
        </span>
      </div>
    </div>

  </div>

  <!-- Recent Student Assessments Table -->
  <div class="card" style="margin-top: 1.5rem;">
    <div class="card-header">
      <div>
        <h3 style="font-size: 1.15rem;">Recent Student Assessments</h3>
        <p style="font-size: 0.82rem; color: #64748b; margin-top: 0.2rem;">Latest records submitted across departments</p>
      </div>
      <a href="assessments.php" class="btn btn-outline btn-sm">View All Submissions</a>
    </div>

    <?php if (empty($recentAssessments)): ?>
      <div style="text-align: center; padding: 2.5rem 0; color: #94a3b8;">
        <p>No assessment records found in the database yet.</p>
      </div>
    <?php else: ?>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Course / Department</th>
              <th>Date</th>
              <th>Score</th>
              <th>Stress Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($recentAssessments as $row): ?>
              <tr>
                <td>
                  <strong><?php echo escape($row['student_name']); ?></strong>
                  <div style="font-size: 0.78rem; color: #94a3b8;"><?php echo escape($row['student_email']); ?></div>
                </td>
                <td><?php echo escape($row['course']); ?></td>
                <td><?php echo date('M d, Y h:i A', strtotime($row['created_at'])); ?></td>
                <td><strong><?php echo $row['percentage']; ?>%</strong> (<?php echo $row['total_score']; ?>/150)</td>
                <td>
                  <span class="badge <?php echo getStressColorClass($row['stress_level']); ?>">
                    <?php echo escape($row['stress_level']); ?>
                  </span>
                </td>
                <td>
                  <a href="student_details.php?id=<?php echo $row['user_id']; ?>" class="btn btn-outline btn-sm">
                    <i class="fa-solid fa-eye"></i> View Student
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

<script>
document.addEventListener('DOMContentLoaded', function () {
  MindPulseCharts.renderStressDistributionChart(
    'adminStressDoughnut',
    <?php echo $lowCount; ?>,
    <?php echo $modCount; ?>,
    <?php echo $highCount; ?>
  );
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>

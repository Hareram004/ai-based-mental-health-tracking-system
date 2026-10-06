<?php
/**
 * Administrator Recommendation Guidelines Management
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAdmin();

$admin = getCurrentUser();
$db = getDB();

// Handle New Recommendation Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_add_recommendation'])) {
    if (verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        $category = trim($_POST['category'] ?? '');
        $minScore = (int)($_POST['min_score'] ?? 0);
        $maxScore = (int)($_POST['max_score'] ?? 100);
        $recText  = trim($_POST['recommendation'] ?? '');

        if (!empty($category) && !empty($recText)) {
            $stmt = $db->prepare("
                INSERT INTO recommendations (category, min_score, max_score, recommendation, status)
                VALUES (?, ?, ?, ?, 'active')
            ");
            $stmt->execute([$category, $minScore, $maxScore, $recText]);

            recordAdminLog($admin['id'], "Admin added new guideline for " . $category);
            $_SESSION['flash_success'] = "New wellness guideline added successfully!";
            header("Location: recommendations.php");
            exit;
        }
    }
}

// Handle Delete / Status Toggle
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_delete_recommendation'])) {
    if (verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        $recId = (int)($_POST['rec_id'] ?? 0);
        if ($recId > 0) {
            $delStmt = $db->prepare("DELETE FROM recommendations WHERE id = ?");
            $delStmt->execute([$recId]);

            recordAdminLog($admin['id'], "Admin deleted recommendation ID: " . $recId);
            $_SESSION['flash_success'] = "Guideline entry deleted.";
            header("Location: recommendations.php");
            exit;
        }
    }
}

// Fetch all recommendations
$recs = $db->query("SELECT * FROM recommendations ORDER BY category ASC, min_score ASC")->fetchAll();

$categories = [
    'Academic Stress',
    'Social Life',
    'Family Environment',
    'Social Media',
    'Physical Health',
    'Campus Environment',
    'Financial Stress'
];

$pageTitle = "Manage Guidelines & Recommendations";
require_once __DIR__ . '/../includes/header.php';
?>

<div class="container" style="padding-top: 1.5rem; padding-bottom: 4rem;">
  
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
    <div>
      <h2>Manage Personalized Recommendations</h2>
      <p style="color: #64748b; font-size: 0.92rem;">
        Configure evidence-based wellness guidelines presented to students depending on domain stress brackets.
      </p>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2rem; align-items: start;">
    
    <!-- Guidelines Table -->
    <div class="card">
      <div class="card-header">
        <h3>Existing Recommendations Rules (<?php echo count($recs); ?>)</h3>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Score Range</th>
              <th>Recommendation Directive</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($recs as $r): ?>
              <tr>
                <td><span class="badge badge-neutral"><?php echo escape($r['category']); ?></span></td>
                <td><?php echo $r['min_score']; ?>% - <?php echo $r['max_score']; ?>%</td>
                <td style="font-size: 0.85rem; max-width: 300px;"><?php echo escape($r['recommendation']); ?></td>
                <td>
                  <form method="POST" action="recommendations.php" onsubmit="return confirm('Delete this guideline?');">
                    <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
                    <input type="hidden" name="rec_id" value="<?php echo $r['id']; ?>">
                    <input type="hidden" name="action_delete_recommendation" value="1">
                    <button type="submit" class="btn btn-danger btn-sm"><i class="fa-solid fa-trash-can"></i></button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add New Rule Form -->
    <div class="card">
      <div class="card-header">
        <h3>Add New Guideline</h3>
      </div>

      <form method="POST" action="recommendations.php">
        <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
        <input type="hidden" name="action_add_recommendation" value="1">

        <div class="form-group">
          <label class="form-label">Category Domain *</label>
          <select name="category" class="form-select" required>
            <?php foreach ($categories as $cat): ?>
              <option value="<?php echo escape($cat); ?>"><?php echo escape($cat); ?></option>
            <?php endforeach; ?>
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Min Stress %</label>
            <input type="number" name="min_score" class="form-control" min="0" max="100" value="60" required>
          </div>
          <div class="form-group">
            <label class="form-label">Max Stress %</label>
            <input type="number" name="max_score" class="form-control" min="0" max="100" value="100" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Supportive Advice / Directive *</label>
          <textarea name="recommendation" rows="4" class="form-control" placeholder="Provide supportive, actionable guidance for students encountering stress in this domain..." required></textarea>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">
          <i class="fa-solid fa-plus"></i> Save New Guideline
        </button>
      </form>
    </div>

  </div>

</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>

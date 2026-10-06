<?php
/**
 * Student Profile & Privacy Management
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

requireStudent();

$user = getCurrentUser();
$db = getDB();

$errors = [];
$successMsg = '';

// Fetch fresh user record
$stmt = $db->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
$stmt->execute([$user['id']]);
$userData = $stmt->fetch();

// 1. Handle Profile Update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_update_profile'])) {
    if (!verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        $errors[] = "Security token mismatch. Please try again.";
    } else {
        $name    = trim($_POST['name'] ?? '');
        $phone   = trim($_POST['phone'] ?? '');
        $age     = (int)($_POST['age'] ?? 20);
        $college = trim($_POST['college'] ?? '');
        $course  = trim($_POST['course'] ?? '');
        $year    = trim($_POST['year'] ?? '');

        if (empty($name)) $errors[] = "Full Name cannot be left blank.";
        if ($age < 15 || $age > 90) $errors[] = "Valid age range is 15-90.";

        if (empty($errors)) {
            $upStmt = $db->prepare("
                UPDATE users
                SET name = ?, phone = ?, age = ?, college = ?, course = ?, year = ?
                WHERE id = ?
            ");
            $upStmt->execute([$name, $phone, $age, $college, $course, $year, $user['id']]);

            $_SESSION['name'] = $name;
            $_SESSION['college'] = $college;
            $_SESSION['course'] = $course;
            $successMsg = "Profile information updated successfully!";
            
            // Reload user data
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch();
        }
    }
}

// 2. Handle Password Change
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_change_password'])) {
    if (!verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        $errors[] = "Security token mismatch.";
    } else {
        $oldPass = $_POST['current_password'] ?? '';
        $newPass = $_POST['new_password'] ?? '';
        $cfmPass = $_POST['confirm_new_password'] ?? '';

        if (!password_verify($oldPass, $userData['password'])) {
            $errors[] = "Current password entered is incorrect.";
        } elseif (strlen($newPass) < 8) {
            $errors[] = "New password must be at least 8 characters long.";
        } elseif ($newPass !== $cfmPass) {
            $errors[] = "New password confirmation does not match.";
        } else {
            $hashed = password_hash($newPass, PASSWORD_BCRYPT);
            $pStmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
            $pStmt->execute([$hashed, $user['id']]);
            $successMsg = "Password updated securely!";
        }
    }
}

// 3. Handle Privacy Data Deletion (Right to be Forgotten)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_delete_my_data'])) {
    if (!verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        $errors[] = "Security token mismatch.";
    } else {
        // Delete all mood entries, assessments, and user record
        $delStmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $delStmt->execute([$user['id']]);

        // Clear session and redirect to landing
        session_destroy();
        session_start();
        $_SESSION['flash_success'] = "All your student records and assessment data have been permanently deleted from the system.";
        header("Location: " . BASE_URL . "index.php");
        exit;
    }
}

$pageTitle = "Student Profile & Privacy Settings";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width: 800px; margin: 2rem auto 4rem;">
  
  <div style="margin-bottom: 2rem;">
    <h2>Student Profile & Privacy Settings</h2>
    <p style="color: #64748b; font-size: 0.95rem;">Manage personal educational details, credentials, and privacy rights.</p>
  </div>

  <?php if (!empty($errors)): ?>
    <div class="alert alert-danger">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <div>
        <?php foreach ($errors as $e): ?>
          <div><?php echo escape($e); ?></div>
        <?php endforeach; ?>
      </div>
    </div>
  <?php endif; ?>

  <?php if (!empty($successMsg)): ?>
    <div class="alert alert-success">
      <i class="fa-solid fa-circle-check"></i>
      <span><?php echo escape($successMsg); ?></span>
    </div>
  <?php endif; ?>

  <!-- Profile Details Card -->
  <div class="card" style="margin-bottom: 2rem;">
    <div class="card-header">
      <h3>Academic & Profile Details</h3>
      <span class="badge badge-neutral">Role: <?php echo escape($userData['role']); ?></span>
    </div>

    <form method="POST" action="profile.php">
      <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
      <input type="hidden" name="action_update_profile" value="1">

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" name="name" class="form-control" value="<?php echo escape($userData['name']); ?>" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email (Read-only)</label>
          <input type="email" class="form-control" value="<?php echo escape($userData['email']); ?>" disabled style="background: #f1f5f9;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="text" name="phone" class="form-control" value="<?php echo escape($userData['phone']); ?>">
        </div>
        <div class="form-group">
          <label class="form-label">Age</label>
          <input type="number" name="age" class="form-control" value="<?php echo escape($userData['age']); ?>">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">College / University</label>
        <input type="text" name="college" class="form-control" value="<?php echo escape($userData['college']); ?>" required>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Course / Degree</label>
          <input type="text" name="course" class="form-control" value="<?php echo escape($userData['course']); ?>" required>
        </div>
        <div class="form-group">
          <label class="form-label">Year / Semester</label>
          <input type="text" name="year" class="form-control" value="<?php echo escape($userData['year']); ?>" required>
        </div>
      </div>

      <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem;">
        <i class="fa-solid fa-floppy-disk"></i> Save Changes
      </button>
    </form>
  </div>

  <!-- Security & Password Change Card -->
  <div class="card" style="margin-bottom: 2rem;">
    <div class="card-header">
      <h3>Change Password</h3>
    </div>

    <form method="POST" action="profile.php">
      <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
      <input type="hidden" name="action_change_password" value="1">

      <div class="form-group">
        <label class="form-label">Current Password</label>
        <input type="password" name="current_password" class="form-control" placeholder="••••••••" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">New Password (Min 8 chars)</label>
          <input type="password" name="new_password" class="form-control" placeholder="••••••••" required>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm New Password</label>
          <input type="password" name="confirm_new_password" class="form-control" placeholder="••••••••" required>
        </div>
      </div>

      <button type="submit" class="btn btn-outline" style="margin-top: 0.5rem;">
        <i class="fa-solid fa-key"></i> Update Password
      </button>
    </form>
  </div>

  <!-- Privacy & Data Erasure Card -->
  <div class="card" style="border-color: #fecaca; background: #fffafb;">
    <div class="card-header" style="border-color: #fee2e2;">
      <h3 style="color: #991b1b;"><i class="fa-solid fa-shield-halved"></i> Data Privacy & Right to Erasure</h3>
    </div>
    <p style="font-size: 0.88rem; color: #7f1d1d; line-height: 1.6; margin-bottom: 1.25rem;">
      In accordance with student mental privacy principles, you have the absolute right to delete your assessment scores, mood logs, and personal account. This action cannot be undone.
    </p>

    <form method="POST" action="profile.php" onsubmit="return confirm('Are you sure you want to permanently delete your student account and all assessment logs? This cannot be undone.');">
      <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
      <input type="hidden" name="action_delete_my_data" value="1">

      <button type="submit" class="btn btn-danger btn-sm">
        <i class="fa-solid fa-trash-can"></i> Permanently Delete My Account & Wellness Data
      </button>
    </form>
  </div>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

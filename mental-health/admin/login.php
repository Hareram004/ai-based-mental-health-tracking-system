<?php
/**
 * Administrator Login Portal
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

if (isAdmin()) {
    header("Location: " . BASE_URL . "admin/dashboard.php");
    exit;
}

$error = '';
$emailInput = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        $error = "Session validation failed. Please refresh.";
    } else {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $emailInput = $email;

        try {
            $db = getDB();
            $stmt = $db->prepare("SELECT id, name, email, password, role FROM users WHERE email = ? AND role = 'admin' LIMIT 1");
            $stmt->execute([$email]);
            $admin = $stmt->fetch();

            if ($admin && password_verify($password, $admin['password'])) {
                session_regenerate_id(true);
                $_SESSION['user_id'] = $admin['id'];
                $_SESSION['name']    = $admin['name'];
                $_SESSION['email']   = $admin['email'];
                $_SESSION['role']    = 'admin';

                recordAdminLog($admin['id'], "Admin logged into institutional administration dashboard.");
                $_SESSION['flash_success'] = "Welcome to the Administration Console, " . $admin['name'] . ".";
                header("Location: " . BASE_URL . "admin/dashboard.php");
                exit;
            } else {
                $error = "Invalid administrator credentials or insufficient privileges.";
            }
        } catch (PDOException $e) {
            $error = "System error: " . $e->getMessage();
        }
    }
}

$pageTitle = "Admin Login - Institutional Portal";
require_once __DIR__ . '/../includes/header.php';
?>

<div class="container" style="max-width: 460px; margin: 4rem auto 5rem;">
  <div class="card" style="padding: 2.5rem; border-top: 4px solid var(--primary);">
    
    <div style="text-align: center; margin-bottom: 2rem;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: #eef2ff; color: var(--primary); display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 0.75rem;">
        <i class="fa-solid fa-shield-halved"></i>
      </div>
      <h2>Faculty & Admin Portal</h2>
      <p style="color: #64748b; font-size: 0.88rem; margin-top: 0.25rem;">Authorized Mental Health Counselors & Administration Only</p>
    </div>

    <?php if (!empty($error)): ?>
      <div class="alert alert-danger">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span><?php echo escape($error); ?></span>
      </div>
    <?php endif; ?>

    <form method="POST" action="login.php">
      <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">

      <div class="form-group">
        <label class="form-label" for="email">Administrator Email</label>
        <input type="email" id="email" name="email" class="form-control" placeholder="admin@mentalhealth.local" value="<?php echo escape($emailInput); ?>" required autofocus>
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Security Password</label>
        <input type="password" id="password" name="password" class="form-control" placeholder="••••••••" required>
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; margin-top: 0.5rem;">
        <i class="fa-solid fa-lock"></i> Authorize & Enter Dashboard
      </button>

      <div style="text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: #64748b;">
        <a href="../login.php"><i class="fa-solid fa-arrow-left"></i> Return to Student Login</a>
      </div>
    </form>

    <!-- Viva Demo Details -->
    <div style="margin-top: 2rem; padding: 0.85rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; font-size: 0.82rem; color: #64748b;">
      <strong>Demo Admin:</strong> <code>admin@mentalhealth.local</code><br>
      <strong>Demo Password:</strong> <code>Admin@12345</code>
    </div>

  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>

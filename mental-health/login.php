<?php
/**
 * Student Login Page
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

// Redirect if already logged in
if (isStudent()) {
    header("Location: " . BASE_URL . "dashboard.php");
    exit;
} elseif (isAdmin()) {
    header("Location: " . BASE_URL . "admin/dashboard.php");
    exit;
}

$error = '';
$emailInput = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        $error = "Security validation token expired. Please try again.";
    } else {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $emailInput = $email;

        if (empty($email) || empty($password)) {
            $error = "Please provide both your registered email and password.";
        } else {
            try {
                $db = getDB();
                $stmt = $db->prepare("SELECT id, name, email, password, role, college, course FROM users WHERE email = ? LIMIT 1");
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if ($user && password_verify($password, $user['password'])) {
                    // Regenerate session ID to prevent session fixation attacks
                    session_regenerate_id(true);

                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['name']    = $user['name'];
                    $_SESSION['email']   = $user['email'];
                    $_SESSION['role']    = $user['role'];
                    $_SESSION['college'] = $user['college'];
                    $_SESSION['course']  = $user['course'];

                    if ($user['role'] === 'admin') {
                        recordAdminLog($user['id'], "Admin logged in via unified login interface.");
                        header("Location: " . BASE_URL . "admin/dashboard.php");
                        exit;
                    } else {
                        $_SESSION['flash_success'] = "Welcome back, " . $user['name'] . "! Track your mood and well-being today.";
                        header("Location: " . BASE_URL . "dashboard.php");
                        exit;
                    }
                } else {
                    $error = "Invalid email or password combination. Please verify your details.";
                }
            } catch (PDOException $e) {
                $error = "Database connectivity issue: " . $e->getMessage();
            }
        }
    }
}

$pageTitle = "Student Login";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width: 480px; margin: 3.5rem auto 5rem;">
  <div class="card" style="padding: 2.5rem;">
    
    <div style="text-align: center; margin-bottom: 2rem;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: #eef2ff; color: #4f46e5; display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 0.75rem;">
        <i class="fa-solid fa-right-to-bracket"></i>
      </div>
      <h2>Student Login</h2>
      <p style="color: #64748b; font-size: 0.92rem; margin-top: 0.25rem;">Access your personalized wellness monitoring dashboard</p>
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
        <label class="form-label" for="email">Student Email Address</label>
        <div style="position: relative;">
          <input type="email" id="email" name="email" class="form-control" placeholder="student@mentalhealth.local" value="<?php echo escape($emailInput); ?>" required autofocus>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Password</label>
        <input type="password" id="password" name="password" class="form-control" placeholder="••••••••" required>
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; margin-top: 0.5rem;">
        <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In to Account
      </button>

      <div style="text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: #64748b;">
        New student? <a href="register.php" style="font-weight: 600;">Create an account</a>
      </div>
    </form>

    <!-- College Viva Demo Credentials Panel -->
    <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">
      <div style="font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 0.4rem;">
        <i class="fa-solid fa-graduation-cap"></i> Demo Credentials (Viva Testing)
      </div>
      <div style="font-size: 0.82rem; color: #64748b; line-height: 1.5;">
        <div><strong>Student:</strong> <code>student@mentalhealth.local</code> / <code>Student@12345</code></div>
        <div><strong>Admin:</strong> <code>admin@mentalhealth.local</code> / <code>Admin@12345</code></div>
      </div>
    </div>

  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

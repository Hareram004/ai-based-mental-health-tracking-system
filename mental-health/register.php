<?php
/**
 * Student Registration Page
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
}

$errors = [];
$formData = [
    'name'    => '',
    'email'   => '',
    'phone'   => '',
    'gender'  => 'Prefer not to say',
    'age'     => '20',
    'college' => '',
    'course'  => '',
    'year'    => '4th Year / 7th Semester'
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // CSRF verification
    if (!verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        $errors[] = "Security token expired or invalid. Please refresh the page and try again.";
    }

    $name     = trim($_POST['name'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $phone    = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm  = $_POST['confirm_password'] ?? '';
    $gender   = trim($_POST['gender'] ?? 'Prefer not to say');
    $age      = (int)($_POST['age'] ?? 0);
    $college  = trim($_POST['college'] ?? '');
    $course   = trim($_POST['course'] ?? '');
    $year     = trim($_POST['year'] ?? '');

    $formData = compact('name', 'email', 'phone', 'gender', 'age', 'college', 'course', 'year');

    // Validation checks
    if (empty($name)) { $errors[] = "Full Name is required."; }
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) { $errors[] = "A valid Email address is required."; }
    if (strlen($password) < 8) { $errors[] = "Password must be at least 8 characters in length."; }
    if ($password !== $confirm) { $errors[] = "Password and Confirm Password do not match."; }
    if ($age < 15 || $age > 90) { $errors[] = "Please provide a realistic student age (15 - 90)."; }
    if (empty($college)) { $errors[] = "College/University name is required."; }
    if (empty($course)) { $errors[] = "Course/Degree is required."; }

    // Check duplicate email
    if (empty($errors)) {
        try {
            $db = getDB();
            $checkStmt = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
            $checkStmt->execute([$email]);
            if ($checkStmt->fetch()) {
                $errors[] = "An account with this email address already exists. Please log in instead.";
            } else {
                // Hash password securely with bcrypt
                $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
                
                $insertStmt = $db->prepare("
                    INSERT INTO users (name, email, phone, password, gender, age, college, course, year, role, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'student', NOW())
                ");
                $insertStmt->execute([$name, $email, $phone, $hashedPassword, $gender, $age, $college, $course, $year]);

                $_SESSION['flash_success'] = "Registration completed successfully! You can now log in with your credentials.";
                header("Location: " . BASE_URL . "login.php");
                exit;
            }
        } catch (PDOException $e) {
            $errors[] = "Database error during registration: " . $e->getMessage();
        }
    }
}

$pageTitle = "Student Registration";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width: 680px; margin: 3rem auto 4rem;">
  <div class="card" style="padding: 2.5rem;">
    
    <div style="text-align: center; margin-bottom: 2rem;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: #eef2ff; color: #4f46e5; display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 0.75rem;">
        <i class="fa-solid fa-user-plus"></i>
      </div>
      <h2>Student Registration</h2>
      <p style="color: #64748b; font-size: 0.92rem; margin-top: 0.25rem;">Create your private account to start monitoring mental wellness</p>
    </div>

    <?php if (!empty($errors)): ?>
      <div class="alert alert-danger" style="display: block;">
        <strong><i class="fa-solid fa-circle-exclamation"></i> Registration Errors:</strong>
        <ul style="margin: 0.5rem 0 0 1.25rem; font-size: 0.88rem;">
          <?php foreach ($errors as $err): ?>
            <li><?php echo escape($err); ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
    <?php endif; ?>

    <form method="POST" action="register.php" novalidate>
      <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">

      <div class="form-group">
        <label class="form-label" for="name">Full Name *</label>
        <input type="text" id="name" name="name" class="form-control" placeholder="e.g. Aarav Sharma" value="<?php echo escape($formData['name']); ?>" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="email">College/Student Email *</label>
          <input type="email" id="email" name="email" class="form-control" placeholder="aarav@college.edu" value="<?php echo escape($formData['email']); ?>" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" class="form-control" placeholder="+91 9876543210" value="<?php echo escape($formData['phone']); ?>">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="password">Password (Min 8 chars) *</label>
          <input type="password" id="password" name="password" class="form-control" placeholder="At least 8 characters" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="confirm_password">Confirm Password *</label>
          <input type="password" id="confirm_password" name="confirm_password" class="form-control" placeholder="Re-enter password" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="gender">Gender</label>
          <select id="gender" name="gender" class="form-select">
            <option value="Male" <?php echo ($formData['gender'] === 'Male') ? 'selected' : ''; ?>>Male</option>
            <option value="Female" <?php echo ($formData['gender'] === 'Female') ? 'selected' : ''; ?>>Female</option>
            <option value="Non-Binary" <?php echo ($formData['gender'] === 'Non-Binary') ? 'selected' : ''; ?>>Non-Binary</option>
            <option value="Prefer not to say" <?php echo ($formData['gender'] === 'Prefer not to say') ? 'selected' : ''; ?>>Prefer not to say</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="age">Age *</label>
          <input type="number" id="age" name="age" class="form-control" min="15" max="90" value="<?php echo escape($formData['age']); ?>" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="college">College / University Name *</label>
        <input type="text" id="college" name="college" class="form-control" placeholder="e.g. Apex Institute of Technology" value="<?php echo escape($formData['college']); ?>" required>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="course">Degree / Course *</label>
          <input type="text" id="course" name="course" class="form-control" placeholder="e.g. B.Tech Computer Science" value="<?php echo escape($formData['course']); ?>" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="year">Year / Semester *</label>
          <input type="text" id="year" name="year" class="form-control" placeholder="e.g. 4th Year / 7th Sem" value="<?php echo escape($formData['year']); ?>" required>
        </div>
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; margin-top: 0.75rem;">
        <i class="fa-solid fa-user-check"></i> Complete Registration
      </button>

      <div style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #64748b;">
        Already registered? <a href="login.php" style="font-weight: 600;">Log in here</a>
      </div>
    </form>

  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

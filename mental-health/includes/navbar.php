<?php
/**
 * Navigation Bar Component - MindPulse
 * Clean, Calm, Minimal Header & Navigation
 */

$currentPage = basename($_SERVER['PHP_SELF']);
$currentDir  = basename(dirname($_SERVER['PHP_SELF']));
$isAdminArea = ($currentDir === 'admin');
$currentUser = getCurrentUser();
?>
<nav class="navbar">
  <div class="container nav-container">
    
    <!-- Left: Brand + Small Subtitle -->
    <a href="<?php echo BASE_URL; ?>" class="nav-brand">
      <i class="fa-solid fa-heart" style="color: #2563EB; font-size: 1.1rem;"></i>
      <div>
        <span style="font-weight: 700; color: #1E293B; letter-spacing: -0.02em;"><?php echo APP_NAME; ?></span>
        <span style="display: block; font-size: 0.72rem; font-weight: 400; color: #64748B; margin-top: -3px;">Student Mental Wellness</span>
      </div>
    </a>

    <!-- Center/Links: Simple Horizontal Navigation -->
    <ul class="nav-links">
      <?php if (isStudent()): ?>
        <li><a href="<?php echo BASE_URL; ?>dashboard.php" class="nav-link <?php echo ($currentPage == 'dashboard.php') ? 'active' : ''; ?>">Dashboard</a></li>
        <li><a href="<?php echo BASE_URL; ?>assessment.php" class="nav-link <?php echo ($currentPage == 'assessment.php') ? 'active' : ''; ?>">Assessment</a></li>
        <li><a href="<?php echo BASE_URL; ?>mood_tracker.php" class="nav-link <?php echo ($currentPage == 'mood_tracker.php') ? 'active' : ''; ?>">Daily Mood</a></li>
        <li><a href="<?php echo BASE_URL; ?>recommendations.php" class="nav-link <?php echo ($currentPage == 'recommendations.php') ? 'active' : ''; ?>">Wellness Guidance</a></li>
        <li><a href="<?php echo BASE_URL; ?>history.php" class="nav-link <?php echo ($currentPage == 'history.php') ? 'active' : ''; ?>">History</a></li>

      <?php elseif (isAdmin()): ?>
        <li><a href="<?php echo BASE_URL; ?>admin/dashboard.php" class="nav-link <?php echo ($currentPage == 'dashboard.php' && $isAdminArea) ? 'active' : ''; ?>">Admin Overview</a></li>
        <li><a href="<?php echo BASE_URL; ?>admin/students.php" class="nav-link <?php echo ($currentPage == 'students.php') ? 'active' : ''; ?>">Students</a></li>
        <li><a href="<?php echo BASE_URL; ?>admin/assessments.php" class="nav-link <?php echo ($currentPage == 'assessments.php') ? 'active' : ''; ?>">Assessments</a></li>
        <li><a href="<?php echo BASE_URL; ?>admin/recommendations.php" class="nav-link <?php echo ($currentPage == 'recommendations.php') ? 'active' : ''; ?>">Guidelines</a></li>

      <?php else: ?>
        <li><a href="<?php echo BASE_URL; ?>index.php" class="nav-link <?php echo ($currentPage == 'index.php') ? 'active' : ''; ?>">Home</a></li>
        <li><a href="<?php echo BASE_URL; ?>login.php" class="nav-link">Login</a></li>
        <li><a href="<?php echo BASE_URL; ?>register.php" class="nav-link">Register</a></li>
        <li><a href="<?php echo BASE_URL; ?>admin/login.php" class="nav-link" style="color: #64748B;">Admin</a></li>
      <?php endif; ?>
    </ul>

    <!-- Right: Student name + Profile + Logout -->
    <?php if (isAuthenticated()): ?>
      <div style="display: flex; align-items: center; gap: 0.85rem; font-size: 0.875rem;">
        <a href="<?php echo isStudent() ? BASE_URL . 'profile.php' : '#'; ?>" style="display: flex; align-items: center; gap: 0.4rem; color: #1E293B; font-weight: 500;">
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600;">
            <?php echo substr($currentUser['name'] ?? 'U', 0, 1); ?>
          </div>
          <span style="font-size: 0.875rem;"><?php echo escape($currentUser['name'] ?? 'Account'); ?></span>
        </a>
        <a href="<?php echo isAdmin() ? BASE_URL . 'admin/logout.php' : BASE_URL . 'logout.php'; ?>" class="btn btn-outline btn-sm" style="font-size: 0.8125rem;">
          Logout
        </a>
      </div>
    <?php else: ?>
      <div>
        <a href="<?php echo BASE_URL; ?>login.php" class="btn btn-primary btn-sm">Login</a>
      </div>
    <?php endif; ?>

  </div>
</nav>

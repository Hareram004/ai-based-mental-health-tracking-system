<?php
/**
 * Common HTML Header Component
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/functions.php';

$pageTitle = isset($pageTitle) ? $pageTitle . ' - ' . APP_NAME : APP_NAME . ' | Student Mental Wellness System';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo escape($pageTitle); ?></title>
  
  <!-- Font Awesome 6.5.1 CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <!-- Google Fonts: Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Chart.js 4.4 CDN for Visual Analytics -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <!-- Core Application Stylesheets -->
  <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/style.css">
  <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/dashboard.css">
  <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/responsive.css">
</head>
<body>

  <!-- Subtle Disclaimer Banner -->
  <div class="disclaimer-banner">
    Important: This system is for wellness monitoring and educational purposes only. It does not provide medical diagnosis.
  </div>

  <!-- Navigation Bar -->
  <?php require_once __DIR__ . '/navbar.php'; ?>

  <!-- Flash Message Notifications Container -->
  <div class="container" style="margin-top: 1rem;">
    <?php if (isset($_SESSION['flash_success'])): ?>
      <div class="alert alert-success">
        <i class="fa-solid fa-circle-check"></i>
        <span><?php echo escape($_SESSION['flash_success']); ?></span>
      </div>
      <?php unset($_SESSION['flash_success']); ?>
    <?php endif; ?>

    <?php if (isset($_SESSION['flash_error'])): ?>
      <div class="alert alert-danger">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span><?php echo escape($_SESSION['flash_error']); ?></span>
      </div>
      <?php unset($_SESSION['flash_error']); ?>
    <?php endif; ?>

    <?php if (isset($_SESSION['flash_warning'])): ?>
      <div class="alert alert-warning">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span><?php echo escape($_SESSION['flash_warning']); ?></span>
      </div>
      <?php unset($_SESSION['flash_warning']); ?>
    <?php endif; ?>
  </div>

  <main>

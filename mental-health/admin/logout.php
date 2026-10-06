<?php
/**
 * Administrator Logout Script
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

if (isAdmin()) {
    recordAdminLog($_SESSION['user_id'], "Admin logged out.");
}

$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
}
session_destroy();

session_start();
$_SESSION['flash_success'] = "Administrator session closed successfully.";
header("Location: " . BASE_URL . "admin/login.php");
exit;
?>

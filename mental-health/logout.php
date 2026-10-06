<?php
/**
 * User Logout Script
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/config/config.php';

// Unset all session variables
$_SESSION = [];

// Destroy session cookie if set
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// Destroy session
session_destroy();

// Redirect with brief flash notification
session_start();
$_SESSION['flash_success'] = "You have been logged out securely. Take care of yourself!";
header("Location: " . BASE_URL . "login.php");
exit;
?>

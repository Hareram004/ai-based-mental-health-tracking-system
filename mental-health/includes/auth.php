<?php
/**
 * Authentication and Access Control Helper
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/../config/config.php';

/**
 * Check if any user is currently authenticated
 */
function isAuthenticated() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Check if the authenticated user has student role
 */
function isStudent() {
    return isAuthenticated() && isset($_SESSION['role']) && $_SESSION['role'] === 'student';
}

/**
 * Check if the authenticated user has admin role
 */
function isAdmin() {
    return isAuthenticated() && isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

/**
 * Guard route for students: redirects to login if unauthenticated or not a student
 */
function requireStudent() {
    if (!isAuthenticated()) {
        $_SESSION['flash_error'] = "Please log in to access your student wellness dashboard.";
        header("Location: " . BASE_URL . "login.php");
        exit;
    }
    if ($_SESSION['role'] !== 'student') {
        header("Location: " . BASE_URL . "admin/dashboard.php");
        exit;
    }
}

/**
 * Guard route for admin: redirects to admin login if unauthenticated or not an admin
 */
function requireAdmin() {
    if (!isAuthenticated() || $_SESSION['role'] !== 'admin') {
        $_SESSION['flash_error'] = "Administrative access required. Please log in with admin credentials.";
        header("Location: " . BASE_URL . "admin/login.php");
        exit;
    }
}

/**
 * Log current user details array
 */
function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }
    return [
        'id'      => $_SESSION['user_id'],
        'name'    => $_SESSION['name'] ?? 'User',
        'email'   => $_SESSION['email'] ?? '',
        'role'    => $_SESSION['role'] ?? 'student',
        'college' => $_SESSION['college'] ?? '',
        'course'  => $_SESSION['course'] ?? ''
    ];
}
?>

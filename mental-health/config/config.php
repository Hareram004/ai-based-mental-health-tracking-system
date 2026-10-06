<?php
/**
 * Application Core Configuration
 * AI-Based Student Mental Health Monitoring System
 */

// Start session securely if not already started
if (session_status() === PHP_SESSION_NONE) {
    // Session cookie parameters for security
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    session_start();
}

// Application Information
define('APP_NAME', 'MindPulse');
define('APP_FULL_TITLE', 'AI-Based Student Mental Health Monitoring System');
define('APP_VERSION', '1.0.0 (B.Tech Final Year CSE)');
define('BASE_URL', 'http://localhost/mental-health/');

// Medical Disclaimer required by system specifications
define('MEDICAL_DISCLAIMER', 'This system is designed for mental wellness monitoring and educational purposes only. It does not provide medical diagnosis or replace professional mental-health care.');

// Gemini AI API Configuration (Can be placed here or set via environment variable)
// Students can supply an API key from Google AI Studio; if empty, fallback NLP engine will engage.
define('GEMINI_API_KEY', getenv('GEMINI_API_KEY') ?: '');

// Crisis Helplines & Emergency Support (Campus & National)
$EMERGENCY_RESOURCES = [
    [
        'name' => 'Campus Student Wellness & Counseling Cell',
        'contact' => '+91 1800-CAMPUS-CARE / Ext: 404',
        'timing' => '9:00 AM - 6:00 PM (Monday - Saturday)',
        'type' => 'College Counseling'
    ],
    [
        'name' => 'Tele-MANAS (Govt. of India Mental Health Helpline)',
        'contact' => '14416 / 1800-891-4416',
        'timing' => '24x7 Toll-Free Multi-Lingual Support',
        'type' => 'National Government'
    ],
    [
        'name' => 'Kiran Mental Health Rehabilitation Helpline',
        'contact' => '1800-599-0019',
        'timing' => '24x7 Toll-Free Support',
        'type' => 'Ministry of Social Justice'
    ],
    [
        'name' => 'Vandrevala Foundation for Mental Health',
        'contact' => '+91 9999 666 555',
        'timing' => '24x7 Crisis Support via Call & WhatsApp',
        'type' => 'Crisis Counseling NGO'
    ]
];

// Error reporting for development (Students can toggle display_errors to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>

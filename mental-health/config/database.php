<?php
/**
 * Database Connection Configuration
 * AI-Based Student Mental Health Monitoring System
 * Uses PDO (PHP Data Objects) for security and prepared statements.
 */

// XAMPP Default MySQL Credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'mental_health_system');
define('DB_PORT', '3306');

class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Friendly error message for college viva & installation troubleshooting
            die('<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 40px auto; padding: 25px; border-radius: 8px; border: 1px solid #fed7aa; background-color: #fff7ed; color: #9a3412;">
                <h3 style="margin-top:0;">Database Connection Error</h3>
                <p>Could not connect to MySQL server with error: <strong>' . htmlspecialchars($e->getMessage()) . '</strong></p>
                <hr style="border: 0; border-top: 1px solid #fed7aa; margin: 15px 0;">
                <p><strong>Quick XAMPP Fix:</strong></p>
                <ol style="margin-left: 20px; line-height: 1.6;">
                    <li>Open <strong>XAMPP Control Panel</strong> and ensure <strong>Apache</strong> and <strong>MySQL</strong> are started (green).</li>
                    <li>Open <strong>http://localhost/phpmyadmin/</strong> in your browser.</li>
                    <li>Create a database named <code>mental_health_system</code>.</li>
                    <li>Import the SQL file located at: <code>database/mental_health_system.sql</code></li>
                </ol>
            </div>');
        }
    }

    public static function getInstance() {
        if (!self::$instance) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
}

// Global helper function to retrieve active PDO instance
function getDB() {
    return Database::getInstance()->getConnection();
}
?>

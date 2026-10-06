<?php
/**
 * Save Mood Entry Handler
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

requireStudent();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: " . BASE_URL . "mood_tracker.php");
    exit;
}

if (!verifyCSRFToken($_POST['csrf_token'] ?? '')) {
    $_SESSION['flash_error'] = "Security session expired. Please resubmit your mood.";
    header("Location: " . BASE_URL . "mood_tracker.php");
    exit;
}

$user = getCurrentUser();
$todayDate = date('Y-m-d');

$mood        = trim($_POST['mood'] ?? 'Neutral');
$stressLevel = (int)($_POST['stress_level'] ?? 5);
$energyLevel = (int)($_POST['energy_level'] ?? 5);
$sleepHours  = (float)($_POST['sleep_hours'] ?? 7.0);
$journal     = trim($_POST['journal'] ?? '');

$allowedMoods = ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad'];
if (!in_array($mood, $allowedMoods)) {
    $mood = 'Neutral';
}

$stressLevel = max(1, min(10, $stressLevel));
$energyLevel = max(1, min(10, $energyLevel));
$sleepHours  = max(0.0, min(24.0, $sleepHours));

// Perform sentiment analysis if journal text is provided
$analysis = null;
$sentiment = 'Neutral';

if (!empty($journal)) {
    $analysis = analyzeJournalLocally($journal);
    $sentiment = $analysis['sentiment'];
}

try {
    $db = getDB();

    // Check if an entry already exists for today to update or insert
    $checkStmt = $db->prepare("SELECT id FROM mood_entries WHERE user_id = ? AND entry_date = ? LIMIT 1");
    $checkStmt->execute([$user['id'], $todayDate]);
    $existing = $checkStmt->fetch();

    if ($existing) {
        $entryId = $existing['id'];
        $updateStmt = $db->prepare("
            UPDATE mood_entries
            SET mood = ?, stress_level = ?, energy_level = ?, sleep_hours = ?, journal = ?, sentiment = ?, created_at = NOW()
            WHERE id = ?
        ");
        $updateStmt->execute([$mood, $stressLevel, $energyLevel, $sleepHours, $journal, $sentiment, $entryId]);
    } else {
        $insertStmt = $db->prepare("
            INSERT INTO mood_entries (user_id, mood, stress_level, energy_level, sleep_hours, journal, sentiment, entry_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $insertStmt->execute([$user['id'], $mood, $stressLevel, $energyLevel, $sleepHours, $journal, $sentiment, $todayDate]);
        $entryId = $db->lastInsertId();
    }

    // Save journal analysis if journal provided
    if ($analysis && !empty($journal)) {
        $aiStmt = $db->prepare("
            INSERT INTO journal_analysis (user_id, mood_entry_id, sentiment, emotional_theme, stress_indicator, ai_summary, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        $aiStmt->execute([
            $user['id'],
            $entryId,
            $analysis['sentiment'],
            $analysis['emotional_theme'],
            $analysis['stress_indicator'],
            $analysis['ai_summary']
        ]);
    }

    $_SESSION['flash_success'] = "Today's mood and wellness metrics have been logged successfully!";
    header("Location: " . BASE_URL . "dashboard.php");
    exit;

} catch (PDOException $e) {
    $_SESSION['flash_error'] = "Could not save mood entry: " . $e->getMessage();
    header("Location: " . BASE_URL . "mood_tracker.php");
    exit;
}
?>

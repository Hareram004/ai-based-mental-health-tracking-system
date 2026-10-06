<?php
/**
 * Mood Analytics Data API
 * AI-Based Student Mental Health Monitoring System
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';

if (!isAuthenticated()) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$user = getCurrentUser();
$db = getDB();

$days = isset($_GET['days']) ? (int)$_GET['days'] : 7;
$days = min(60, max(7, $days));

$stmt = $db->prepare("
    SELECT entry_date, mood, stress_level, energy_level, sleep_hours
    FROM mood_entries
    WHERE user_id = ?
    ORDER BY entry_date DESC
    LIMIT ?
");
$stmt->bindValue(1, $user['id'], PDO::PARAM_INT);
$stmt->bindValue(2, $days, PDO::PARAM_INT);
$stmt->execute();

$records = array_reverse($stmt->fetchAll());

$moodMapping = [
    'Very Sad'   => 1,
    'Sad'        => 2,
    'Neutral'    => 3,
    'Happy'      => 4,
    'Very Happy' => 5
];

$dates        = [];
$moodScores   = [];
$stressScores = [];
$sleepHours   = [];

foreach ($records as $r) {
    $dates[]        = date('M d', strtotime($r['entry_date']));
    $moodScores[]   = $moodMapping[$r['mood']] ?? 3;
    $stressScores[] = (int)$r['stress_level'];
    $sleepHours[]   = (float)$r['sleep_hours'];
}

echo json_encode([
    'status'       => 'success',
    'dates'        => $dates,
    'moodScores'   => $moodScores,
    'stressScores' => $stressScores,
    'sleepHours'   => $sleepHours
]);
exit;
?>

<?php
/**
 * Assessment Analytics Data API
 * AI-Based Student Mental Health Monitoring System
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

if (!isAuthenticated()) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$user = getCurrentUser();
$db = getDB();

// Fetch latest assessment ID
$stmt = $db->prepare("SELECT id, total_score, percentage, stress_level, created_at FROM assessments WHERE user_id = ? ORDER BY id DESC LIMIT 1");
$stmt->execute([$user['id']]);
$assessment = $stmt->fetch();

if (!$assessment) {
    echo json_encode(['status' => 'empty', 'message' => 'No assessments completed yet.']);
    exit;
}

// Calculate category-wise scores for this assessment
$catStmt = $db->prepare("
    SELECT q.category, q.reverse_score, aa.answer
    FROM assessment_answers aa
    JOIN questions q ON aa.question_id = q.id
    WHERE aa.assessment_id = ?
");
$catStmt->execute([$assessment['id']]);
$answers = $catStmt->fetchAll();

$categories = [];
foreach ($answers as $row) {
    $cat = $row['category'];
    if (!isset($categories[$cat])) {
        $categories[$cat] = ['total' => 0, 'count' => 0];
    }
    $val = adjustAnswerScore($row['answer'], (bool)$row['reverse_score']);
    $categories[$cat]['total'] += $val;
    $categories[$cat]['count']++;
}

$catLabels = [];
$catPercentages = [];

foreach ($categories as $catName => $data) {
    $min = $data['count'] * 1;
    $max = $data['count'] * 5;
    $pct = $max > $min ? round((($data['total'] - $min) / ($max - $min)) * 100, 1) : 0;
    
    $catLabels[] = $catName;
    $catPercentages[] = $pct;
}

echo json_encode([
    'status'         => 'success',
    'assessment_id'  => $assessment['id'],
    'overall_score'  => $assessment['total_score'],
    'overall_pct'    => (float)$assessment['percentage'],
    'stress_level'   => $assessment['stress_level'],
    'created_at'     => $assessment['created_at'],
    'categories'     => $catLabels,
    'percentages'    => $catPercentages
]);
exit;
?>

<?php
/**
 * Assessment Submission & Scoring Engine
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

requireStudent();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: " . BASE_URL . "assessment.php");
    exit;
}

if (!verifyCSRFToken($_POST['csrf_token'] ?? '')) {
    $_SESSION['flash_error'] = "Security session expired. Please retake the assessment.";
    header("Location: " . BASE_URL . "assessment.php");
    exit;
}

$user = getCurrentUser();
$submittedAnswers = $_POST['answers'] ?? [];

if (empty($submittedAnswers) || !is_array($submittedAnswers)) {
    $_SESSION['flash_error'] = "No responses received. Please fill out the questionnaire.";
    header("Location: " . BASE_URL . "assessment.php");
    exit;
}

try {
    $db = getDB();

    // Fetch all active questions to retrieve reverse_score rules
    $stmt = $db->query("SELECT id, category, reverse_score FROM questions WHERE status = 'active'");
    $questions = $stmt->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_ASSOC);

    $totalScore = 0;
    $validCount = 0;
    $processedAnswers = [];

    foreach ($questions as $qId => $qData) {
        if (!isset($submittedAnswers[$qId])) {
            $_SESSION['flash_error'] = "Please provide an answer for all questions before submitting.";
            header("Location: " . BASE_URL . "assessment.php");
            exit;
        }

        $rawVal = (int)$submittedAnswers[$qId];
        if ($rawVal < 1 || $rawVal > 5) {
            $rawVal = 3; // Fallback to neutral if out of bounds
        }

        // Apply reverse scoring for positive valence questions (e.g., 1 -> 5, 5 -> 1)
        $computedVal = adjustAnswerScore($rawVal, (bool)$qData['reverse_score']);
        $totalScore += $computedVal;
        $validCount++;

        $processedAnswers[] = [
            'question_id' => $qId,
            'raw_answer'  => $rawVal,
            'scored_val'  => $computedVal,
            'category'    => $qData['category']
        ];
    }

    // Minimum score: 30 * 1 = 30; Maximum score: 30 * 5 = 150
    $minScore = $validCount * 1;
    $maxScore = $validCount * 5;

    // Normalized stress percentage formula
    $percentage = (($totalScore - $minScore) / ($maxScore - $minScore)) * 100;
    $percentage = round($percentage, 2);

    // Classification (Low, Moderate, High Stress)
    $stressLevel = classifyStressLevel($percentage);

    // Save assessment inside a database transaction
    $db->beginTransaction();

    $insertAssessment = $db->prepare("
        INSERT INTO assessments (user_id, total_score, percentage, stress_level, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $insertAssessment->execute([$user['id'], $totalScore, $percentage, $stressLevel]);
    $assessmentId = $db->lastInsertId();

    // Insert individual question answers
    $insertAnswer = $db->prepare("
        INSERT INTO assessment_answers (assessment_id, question_id, answer)
        VALUES (?, ?, ?)
    ");
    foreach ($processedAnswers as $pa) {
        $insertAnswer->execute([$assessmentId, $pa['question_id'], $pa['raw_answer']]);
    }

    $db->commit();

    $_SESSION['flash_success'] = "Assessment completed! Your normalized stress level is classified as " . $stressLevel . " (" . $percentage . "%).";
    header("Location: " . BASE_URL . "dashboard.php?new_assessment=1");
    exit;

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    $_SESSION['flash_error'] = "Could not record assessment: " . $e->getMessage();
    header("Location: " . BASE_URL . "assessment.php");
    exit;
}
?>

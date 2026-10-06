<?php
/**
 * AI / NLP Journal Analysis API Endpoint
 * AI-Based Student Mental Health Monitoring System
 * Handles student journal reflection analysis via Gemini API or rule-based NLP fallback
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

if (!isAuthenticated()) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

$journalText = trim($_POST['journal_text'] ?? '');
if (empty($journalText)) {
    echo json_encode(['status' => 'error', 'message' => 'Journal text cannot be empty.']);
    exit;
}

// 1. First safety check: Crisis & self-harm detection
if (detectCrisisLanguage($journalText)) {
    echo json_encode([
        'status' => 'success',
        'sentiment' => 'Crisis Alert',
        'emotional_theme' => 'Urgent Distress',
        'stress_indicator' => 'Crisis',
        'keywords' => ['urgent', 'distress'],
        'ai_summary' => 'We detected indicators of severe distress. Please consider reaching out immediately to your campus counselor or dialing national 24/7 helplines like Tele-MANAS (14416).',
        'is_crisis' => true
    ]);
    exit;
}

$apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '';

// 2. Attempt Google Gemini AI API if API key is provided
if (!empty($apiKey) && function_exists('curl_init')) {
    $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . urlencode($apiKey);

    $prompt = "You are an empathetic, non-diagnostic student wellness analysis assistant. Analyze the following student journal entry for emotional well-being monitoring.
Do NOT provide psychiatric or medical diagnoses.
Output ONLY a raw JSON object with these exact keys:
- \"sentiment\": (one of \"Positive\", \"Neutral\", \"Negative\")
- \"emotional_theme\": (short string e.g. \"Academic Deadlines\", \"Social Connection\", \"Exam Preparation\", \"Burnout Relief\")
- \"stress_indicator\": (one of \"Low\", \"Moderate\", \"High\")
- \"ai_summary\": (a supportive 1-2 sentence reflection for the student)

Student Journal Entry:
\"" . addslashes($journalText) . "\"";

    $payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => $prompt]
                ]
            ]
        ],
        "generationConfig" => [
            "responseMimeType" => "application/json",
            "temperature" => 0.2
        ]
    ];

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $resJson = json_decode($response, true);
        if (isset($resJson['candidates'][0]['content']['parts'][0]['text'])) {
            $parsed = json_decode($resJson['candidates'][0]['content']['parts'][0]['text'], true);
            if ($parsed && isset($parsed['sentiment'])) {
                echo json_encode([
                    'status' => 'success',
                    'sentiment' => $parsed['sentiment'] ?? 'Neutral',
                    'emotional_theme' => $parsed['emotional_theme'] ?? 'General Student Reflections',
                    'stress_indicator' => $parsed['stress_indicator'] ?? 'Moderate',
                    'ai_summary' => $parsed['ai_summary'] ?? 'Reflection processed smoothly.',
                    'is_crisis' => false,
                    'engine' => 'gemini-1.5-flash'
                ]);
                exit;
            }
        }
    }
}

// 3. Fallback: Robust local Rule-Based Lexicon NLP Engine
$localAnalysis = analyzeJournalLocally($journalText);
$localAnalysis['status'] = 'success';
$localAnalysis['engine'] = 'local-rule-nlp';

echo json_encode($localAnalysis);
exit;
?>

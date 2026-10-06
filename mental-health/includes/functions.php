<?php
/**
 * Core Helper Functions & Analytical Algorithms
 * AI-Based Student Mental Health Monitoring System
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';

/**
 * Generate CSRF Token for Form Security
 */
function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF Token
 */
function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], (string)$token);
}

/**
 * Sanitize HTML Output
 */
function escape($data) {
    return htmlspecialchars((string)$data, ENT_QUOTES, 'UTF-8');
}

/**
 * Classify Stress Level based on normalized percentage
 * 0 - 33%: Low Stress
 * 34 - 66%: Moderate Stress
 * 67 - 100%: High Stress
 */
function classifyStressLevel($percentage) {
    if ($percentage <= 33.33) {
        return 'Low Stress';
    } elseif ($percentage <= 66.66) {
        return 'Moderate Stress';
    } else {
        return 'High Stress';
    }
}

/**
 * Color class helper for stress levels
 */
function getStressColorClass($level) {
    switch ($level) {
        case 'Low Stress':
            return 'badge-success'; // Emerald / green
        case 'Moderate Stress':
            return 'badge-warning'; // Amber / orange
        case 'High Stress':
            return 'badge-danger';  // Rose / red
        default:
            return 'badge-neutral';
    }
}

/**
 * Reverse score transformation for positive valence questions
 * Scale: 1 -> 5, 2 -> 4, 3 -> 3, 4 -> 2, 5 -> 1
 */
function adjustAnswerScore($rawAnswer, $isReverse) {
    $rawAnswer = (int)$rawAnswer;
    if ($isReverse) {
        return 6 - $rawAnswer;
    }
    return $rawAnswer;
}

/**
 * Safety & Crisis Keyword Detection Layer
 * Scans text for high-risk self-harm or suicidal ideation triggers
 */
function detectCrisisLanguage($text) {
    $textLower = strtolower($text);
    $crisisKeywords = [
        'kill myself', 'suicide', 'end my life', 'want to die', 'better off dead',
        'cutting myself', 'self-harm', 'slit my', 'hang myself', 'no reason to live',
        'cannot go on living', 'overdose on pills', 'take my own life'
    ];

    foreach ($crisisKeywords as $kw) {
        if (strpos($textLower, $kw) !== false) {
            return true;
        }
    }
    return false;
}

/**
 * Fallback Natural Language Processing & Sentiment Analyzer (Rule-Based NLP Lexicon)
 * Runs locally when external AI API is unreachable or key is not configured.
 */
function analyzeJournalLocally($text) {
    $textLower = strtolower($text);

    // 1. Check for crisis safety triggers
    if (detectCrisisLanguage($textLower)) {
        return [
            'sentiment' => 'Crisis Triggered',
            'emotional_theme' => 'Urgent Crisis / Extreme Distress',
            'stress_indicator' => 'Crisis',
            'keywords' => ['urgent', 'distress', 'critical'],
            'ai_summary' => 'Critical distress indicators detected. Please connect immediately with qualified campus counselors or 24/7 helplines.',
            'is_crisis' => true
        ];
    }

    // 2. Lexicon dictionaries
    $positiveLexicon = [
        'happy', 'relieved', 'great', 'good', 'calm', 'peaceful', 'productive', 'energized',
        'motivated', 'optimistic', 'accomplished', 'relaxed', 'grateful', 'refreshed', 'confident',
        'joy', 'excited', 'focused', 'satisfaction', 'solved', 'hopeful', 'supported'
    ];

    $negativeLexicon = [
        'stressed', 'anxious', 'worried', 'overwhelmed', 'tired', 'exhausted', 'sad',
        'depressed', 'hopeless', 'lonely', 'isolated', 'panicking', 'scared', 'failed',
        'difficult', 'struggling', 'nervous', 'pressure', 'insomnia', 'headache', 'drained',
        'burnout', 'fear', 'mess', 'hate', 'crying', 'frustrated', 'hopeless'
    ];

    $themes = [
        'Academic Pressure' => ['exam', 'test', 'assignment', 'grade', 'cgpa', 'study', 'lecture', 'professor', 'placement', 'interview', 'coding', 'project'],
        'Social Isolation' => ['friend', 'roommate', 'alone', 'nobody', 'isolated', 'introvert', 'excluded', 'peer', 'talk'],
        'Sleep & Physical Exhaustion' => ['sleep', 'insomnia', 'awake', 'tired', 'fatigue', 'energy', 'headache', 'diet', 'sick'],
        'Family & Personal Life' => ['family', 'parent', 'father', 'mother', 'home', 'relative', 'expectation', 'argument'],
        'Digital Screen Fatigue' => ['phone', 'screen', 'social media', 'instagram', 'scroll', 'reels', 'algorithm', 'notifications']
    ];

    $posCount = 0;
    $negCount = 0;
    $foundKeywords = [];

    foreach ($positiveLexicon as $w) {
        if (preg_match('/\b' . preg_quote($w, '/') . '\b/i', $textLower)) {
            $posCount++;
            $foundKeywords[] = $w;
        }
    }

    foreach ($negativeLexicon as $w) {
        if (preg_match('/\b' . preg_quote($w, '/') . '\b/i', $textLower)) {
            $negCount++;
            $foundKeywords[] = $w;
        }
    }

    // Identify primary emotional theme
    $detectedTheme = 'General Daily Well-being';
    $maxThemeMatches = 0;
    foreach ($themes as $themeName => $words) {
        $matches = 0;
        foreach ($words as $w) {
            if (preg_match('/\b' . preg_quote($w, '/') . '\b/i', $textLower)) {
                $matches++;
            }
        }
        if ($matches > $maxThemeMatches) {
            $maxThemeMatches = $matches;
            $detectedTheme = $themeName;
        }
    }

    // Determine Sentiment and Stress Indicator
    if ($negCount > $posCount + 1) {
        $sentiment = 'Negative';
        $stressIndicator = ($negCount >= 4) ? 'High' : 'Moderate';
        $summary = "Student reflections highlight feelings of stress or tension centered around " . strtolower($detectedTheme) . ". Structured breaks and mentorship support are advised.";
    } elseif ($posCount > $negCount) {
        $sentiment = 'Positive';
        $stressIndicator = 'Low';
        $summary = "Student express positive energy, proactive engagement, and emotional balance in their reflection.";
    } else {
        $sentiment = 'Neutral';
        $stressIndicator = ($negCount > 0) ? 'Moderate' : 'Low';
        $summary = "Student shares a balanced daily summary with manageable day-to-day fluctuations.";
    }

    return [
        'sentiment' => $sentiment,
        'emotional_theme' => $detectedTheme,
        'stress_indicator' => $stressIndicator,
        'keywords' => array_slice(array_unique($foundKeywords), 0, 6),
        'ai_summary' => $summary,
        'is_crisis' => false
    ];
}

/**
 * Log administrative activity
 */
function recordAdminLog($adminId, $action) {
    try {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO admin_logs (admin_id, action, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$adminId, $action]);
    } catch (Exception $e) {
        // Silently log
    }
}
?>

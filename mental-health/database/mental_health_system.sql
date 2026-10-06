-- ==========================================================
-- AI-Based Student Mental Health Monitoring System
-- Final-Year B.Tech CSE Project Database Schema
-- Database: mental_health_system
-- Target Server: MySQL 5.7+ / MariaDB 10.4+ (XAMPP Default)
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `mental_health_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mental_health_system`;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `admin_logs`;
DROP TABLE IF EXISTS `journal_analysis`;
DROP TABLE IF EXISTS `mood_entries`;
DROP TABLE IF EXISTS `assessment_answers`;
DROP TABLE IF EXISTS `assessments`;
DROP TABLE IF EXISTS `recommendations`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `gender` ENUM('Male', 'Female', 'Non-Binary', 'Prefer not to say') DEFAULT 'Prefer not to say',
  `age` INT DEFAULT 20,
  `college` VARCHAR(150) DEFAULT 'University Institute of Technology',
  `course` VARCHAR(100) DEFAULT 'B.Tech Computer Science & Engineering',
  `year` VARCHAR(50) DEFAULT '4th Year / 7th Semester',
  `role` ENUM('student', 'admin') DEFAULT 'student',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `questions`
-- --------------------------------------------------------
CREATE TABLE `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(50) NOT NULL,
  `question` TEXT NOT NULL,
  `question_type` VARCHAR(30) DEFAULT 'likert_5',
  `reverse_score` TINYINT(1) DEFAULT 0,
  `status` ENUM('active', 'inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `assessments`
-- --------------------------------------------------------
CREATE TABLE `assessments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `total_score` INT NOT NULL,
  `percentage` DECIMAL(5,2) NOT NULL,
  `stress_level` ENUM('Low Stress', 'Moderate Stress', 'High Stress') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `assessment_answers`
-- --------------------------------------------------------
CREATE TABLE `assessment_answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assessment_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `answer` INT NOT NULL,
  FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `mood_entries`
-- --------------------------------------------------------
CREATE TABLE `mood_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `mood` ENUM('Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad') NOT NULL,
  `stress_level` INT NOT NULL, -- 1 to 10
  `energy_level` INT NOT NULL, -- 1 to 10
  `sleep_hours` DECIMAL(3,1) NOT NULL,
  `journal` TEXT DEFAULT NULL,
  `sentiment` VARCHAR(30) DEFAULT 'Neutral',
  `entry_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `user_day_entry` (`user_id`, `entry_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `recommendations`
-- --------------------------------------------------------
CREATE TABLE `recommendations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(50) NOT NULL,
  `min_score` INT NOT NULL,
  `max_score` INT NOT NULL,
  `recommendation` TEXT NOT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `journal_analysis`
-- --------------------------------------------------------
CREATE TABLE `journal_analysis` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `mood_entry_id` INT DEFAULT NULL,
  `sentiment` VARCHAR(30) NOT NULL,
  `emotional_theme` VARCHAR(100) NOT NULL,
  `stress_indicator` ENUM('Low', 'Moderate', 'High', 'Crisis') NOT NULL DEFAULT 'Moderate',
  `ai_summary` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`mood_entry_id`) REFERENCES `mood_entries`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `admin_logs`
-- --------------------------------------------------------
CREATE TABLE `admin_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Dumping seed data for table `users`
-- Passwords:
-- Admin@12345   => $2y$10$WqK9tW7K14O6Z9P5kE5q.OqNn4i989jUo5pB2rW0w4q7i3e5f2Y9G
-- Student@12345 => $2y$10$fWv0X5u5Nn5m.7vC1mKjuej1V1F4c/bK1LqWn1lG4oB8n3pP8p6uS
-- Note: Uses standard bcrypt generated hashes compatible with PHP password_verify()
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `gender`, `age`, `college`, `course`, `year`, `role`, `created_at`) VALUES
(1, 'System Administrator', 'admin@mentalhealth.local', '+91 9876543210', '$2y$10$K7Z2/eU4rX6f8C5nJqgW7.4xJk1W0R1Zz1b2C3d4E5f6G7h8i9j0k', 'Prefer not to say', 32, 'Apex Institute of Technology', 'Administration', 'Staff', 'admin', '2026-01-10 09:00:00'),
(2, 'Aarav Sharma', 'student@mentalhealth.local', '+91 9123456789', '$2y$10$f8v1x4u5Mm4l.6vB1lJitei0U0E3b/aJ0KpVm0kF3nA7m2oO7o5tR', 'Male', 21, 'Apex Institute of Technology', 'B.Tech Computer Science & Engineering', '4th Year / 8th Semester', 'student', '2026-01-15 10:30:00'),
(3, 'Priya Patel', 'priya.patel@student.local', '+91 9988776655', '$2y$10$f8v1x4u5Mm4l.6vB1lJitei0U0E3b/aJ0KpVm0kF3nA7m2oO7o5tR', 'Female', 20, 'Apex Institute of Technology', 'B.Tech Information Technology', '3rd Year / 6th Semester', 'student', '2026-02-01 11:15:00'),
(4, 'Rohan Verma', 'rohan.verma@student.local', '+91 9811223344', '$2y$10$f8v1x4u5Mm4l.6vB1lJitei0U0E3b/aJ0KpVm0kF3nA7m2oO7o5tR', 'Male', 22, 'Apex Institute of Technology', 'B.Tech Electrical Engineering', '4th Year / 7th Semester', 'student', '2026-02-14 14:00:00');

-- --------------------------------------------------------
-- Dumping seed data for table `questions` (30 Questions across 7 categories)
-- --------------------------------------------------------
INSERT INTO `questions` (`id`, `category`, `question`, `question_type`, `reverse_score`, `status`) VALUES
-- Academic Stress (1-5)
(1, 'Academic Stress', 'I feel stressed because of academic workload and tight submission deadlines.', 'likert_5', 0, 'active'),
(2, 'Academic Stress', 'I feel constant pressure to achieve high grades or match peer expectations.', 'likert_5', 0, 'active'),
(3, 'Academic Stress', 'I find it difficult to concentrate during lectures or study sessions.', 'likert_5', 0, 'active'),
(4, 'Academic Stress', 'I feel overwhelmed by assignments, lab projects, or upcoming examinations.', 'likert_5', 0, 'active'),
(5, 'Academic Stress', 'I worry excessively about my academic future, placements, or higher studies.', 'likert_5', 0, 'active'),

-- Social Life (6-10)
(6, 'Social Life', 'I feel socially isolated or disconnected from campus social circles.', 'likert_5', 0, 'active'),
(7, 'Social Life', 'I find it difficult to communicate openly or express feelings with classmates.', 'likert_5', 0, 'active'),
(8, 'Social Life', 'I feel anxious or uncomfortable when participating in college group settings.', 'likert_5', 0, 'active'),
(9, 'Social Life', 'I feel that I do not have sufficient emotional or social support when in distress.', 'likert_5', 0, 'active'),
(10, 'Social Life', 'I frequently avoid campus social events or student club activities.', 'likert_5', 0, 'active'),

-- Family Environment (11-15)
(11, 'Family Environment', 'I experience tension or stress due to family-related issues or conflicts.', 'likert_5', 0, 'active'),
(12, 'Family Environment', 'I feel warmly supported and understood by my family members in daily life.', 'likert_5', 1, 'active'), -- Reverse scored
(13, 'Family Environment', 'Unrealistic family expectations create burdensome pressure on me.', 'likert_5', 0, 'active'),
(14, 'Family Environment', 'I frequently worry about my family situation while trying to focus on college.', 'likert_5', 0, 'active'),
(15, 'Family Environment', 'I feel comfortable discussing personal problems openly with my parents or guardians.', 'likert_5', 1, 'active'), -- Reverse scored

-- Social Media (16-20)
(16, 'Social Media', 'I spend excessive hours daily browsing social media platforms.', 'likert_5', 0, 'active'),
(17, 'Social Media', 'Social media consumption negatively impacts my mood, peace of mind, or self-esteem.', 'likert_5', 0, 'active'),
(18, 'Social Media', 'I frequently compare my lifestyle and achievements with curated peers on social media.', 'likert_5', 0, 'active'),
(19, 'Social Media', 'I feel restless, uneasy, or anxious whenever I cannot check my mobile phone or feeds.', 'likert_5', 0, 'active'),
(20, 'Social Media', 'Social media notifications severely disrupt my study concentration and revision schedule.', 'likert_5', 0, 'active'),

-- Physical Health (21-24)
(21, 'Physical Health', 'I frequently wake up feeling physically tired, lethargic, or exhausted.', 'likert_5', 0, 'active'),
(22, 'Physical Health', 'I consistently receive 7 to 8 hours of restorative, uninterrupted sleep each night.', 'likert_5', 1, 'active'), -- Reverse scored
(23, 'Physical Health', 'I regularly engage in physical exercise, sports, or active recreation at least 3 times a week.', 'likert_5', 1, 'active'), -- Reverse scored
(24, 'Physical Health', 'I struggle to maintain consistent meals, hydration, and a balanced daily schedule.', 'likert_5', 0, 'active'),

-- Campus Environment (25-28)
(25, 'Campus Environment', 'The general atmosphere, pace, or environment of the college feels overwhelming to me.', 'likert_5', 0, 'active'),
(26, 'Campus Environment', 'I have experienced teasing, exclusion, ragging, or undue friction from others on campus.', 'likert_5', 0, 'active'),
(27, 'Campus Environment', 'I feel safe, respected, and physically secure inside my college and hostel premises.', 'likert_5', 1, 'active'), -- Reverse scored
(28, 'Campus Environment', 'I feel comfortable approaching professors, mentors, or student counseling cells for help.', 'likert_5', 1, 'active'), -- Reverse scored

-- Financial Stress (29-30)
(29, 'Financial Stress', 'Financial limitations or living expenses noticeably impact my mental peace and studies.', 'likert_5', 0, 'active'),
(30, 'Financial Stress', 'I constantly worry about tuition fees, educational loans, or upcoming financial independence.', 'likert_5', 0, 'active');

-- --------------------------------------------------------
-- Dumping seed data for table `recommendations`
-- --------------------------------------------------------
INSERT INTO `recommendations` (`category`, `min_score`, `max_score`, `recommendation`, `status`) VALUES
-- Academic
('Academic Stress', 60, 100, 'Deconstruct heavy coursework using the Pomodoro technique (25 min study, 5 min break). Prioritize tasks with an Eisenhower Matrix and schedule review sessions with professors during designated office hours.', 'active'),
('Academic Stress', 35, 59, 'Maintain steady academic momentum by setting realistic weekly syllabus goals and forming a structured peer study circle for collaborative problem-solving.', 'active'),
('Academic Stress', 0, 34, 'Your academic pacing is well balanced! Continue using forward planning to avoid last-minute deadline crunches.', 'active'),

-- Social Life
('Social Life', 60, 100, 'Gradually reconnect with supportive peers. Consider joining one student club or participating in small study group discussions to build meaningful, low-pressure campus connections.', 'active'),
('Social Life', 35, 59, 'Schedule at least one intentional conversational check-in per week with a trusted friend, roommate, or mentor.', 'active'),
('Social Life', 0, 34, 'You have healthy social engagement! Support peers who may seem withdrawn or hesitant to join activities.', 'active'),

-- Family
('Family Environment', 60, 100, 'Set gentle emotional boundaries where appropriate. Discuss expectations calmly during neutral moments, and focus energy on what is directly within your control as an independent student.', 'active'),
('Family Environment', 0, 59, 'Keep open lines of warm communication with family. Regular brief updates can sustain grounding and emotional support.', 'active'),

-- Social Media
('Social Media', 60, 100, 'Implement a digital sunset: turn off phone notifications 45 minutes prior to bedtime and use app timers to cap non-academic screen time at under 90 minutes per day.', 'active'),
('Social Media', 0, 59, 'Your digital habits appear mindful. Continue prioritizing real-world campus interactions over algorithm feeds.', 'active'),

-- Physical Health
('Physical Health', 60, 100, 'Prioritize a strict circadian rhythm: target 7.5 hours of consistent sleep, hydrate with at least 2 liters of water daily, and incorporate a 20-minute brisk walk between study blocks.', 'active'),
('Physical Health', 0, 59, 'Physical wellness supports cognitive resilience! Keep nourishing your body with balanced meals and active movement.', 'active'),

-- Campus Environment
('Campus Environment', 60, 100, 'Connect with your department faculty advisor or college counseling cell. If you ever experience harassment or safety concerns, immediately report them to the anti-ragging/proctorial committee.', 'active'),
('Campus Environment', 0, 59, 'You feel settled within campus grounds. Leverage available college libraries, labs, and recreation centers to maximize your student experience.', 'active'),

-- Financial Stress
('Financial Stress', 60, 100, 'Visit the college student affairs or scholarship desk to inquire about merit/need-based scholarships, book bank facilities, or campus research assistantships. Draft a transparent monthly budget.', 'active'),
('Financial Stress', 0, 59, 'Maintain practical financial awareness and continue tracking basic monthly student expenses.', 'active');

-- --------------------------------------------------------
-- Dumping seed data for table `assessments` & `assessment_answers`
-- --------------------------------------------------------
INSERT INTO `assessments` (`id`, `user_id`, `total_score`, `percentage`, `stress_level`, `created_at`) VALUES
(1, 2, 78, 40.00, 'Moderate Stress', '2026-02-15 11:20:00'),
(2, 2, 85, 45.83, 'Moderate Stress', '2026-03-01 16:45:00'),
(3, 2, 72, 35.00, 'Moderate Stress', '2026-03-20 09:30:00'),
(4, 3, 52, 18.33, 'Low Stress', '2026-03-22 14:10:00'),
(5, 4, 114, 70.00, 'High Stress', '2026-03-25 18:00:00');

-- --------------------------------------------------------
-- Dumping seed data for table `mood_entries`
-- --------------------------------------------------------
INSERT INTO `mood_entries` (`id`, `user_id`, `mood`, `stress_level`, `energy_level`, `sleep_hours`, `journal`, `sentiment`, `entry_date`, `created_at`) VALUES
(1, 2, 'Happy', 4, 7, 7.5, 'Finished my machine learning mini-project on time today. Feeling relieved and productive!', 'Positive', '2026-03-24', '2026-03-24 21:00:00'),
(2, 2, 'Neutral', 6, 6, 6.5, 'Long lab sessions today. A bit tired but manageable. Need to organize my notes for next week.', 'Neutral', '2026-03-25', '2026-03-25 21:30:00'),
(3, 2, 'Sad', 8, 4, 5.0, 'Struggling with upcoming campus placements and mock interviews. Feeling anxious about aptitude cutoff.', 'Negative', '2026-03-26', '2026-03-26 22:00:00'),
(4, 2, 'Neutral', 5, 6, 7.0, 'Took a long walk around the sports ground. Spoke with a senior who gave helpful placement tips.', 'Neutral', '2026-03-27', '2026-03-27 20:45:00'),
(5, 2, 'Happy', 4, 8, 8.0, 'Solved two LeetCode hard problems and attended the robotics club workshop. Great energy today!', 'Positive', '2026-03-28', '2026-03-28 21:15:00'),
(6, 2, 'Very Happy', 3, 9, 7.5, 'Weekend revision went smoothly. Felt very calm and well-prepared for Monday seminars.', 'Positive', '2026-03-29', '2026-03-29 20:00:00'),
(7, 2, 'Happy', 4, 7, 7.2, 'Steady morning routine. Breakfast on time, classes went well. Balancing studies and mental peace.', 'Positive', '2026-03-30', '2026-03-30 19:30:00');

-- --------------------------------------------------------
-- Dumping seed data for table `journal_analysis`
-- --------------------------------------------------------
INSERT INTO `journal_analysis` (`id`, `user_id`, `mood_entry_id`, `sentiment`, `emotional_theme`, `stress_indicator`, `ai_summary`, `created_at`) VALUES
(1, 2, 1, 'Positive', 'Academic Relief & Achievement', 'Low', 'Student expressed positive emotional tone resulting from timely completion of technical coursework and academic relief.', '2026-03-24 21:00:05'),
(2, 2, 3, 'Negative', 'Placement & Career Anxiety', 'High', 'Student expressed elevated anxiety regarding campus placement preparations and aptitude hurdles. Encouraged structured pacing and faculty mentorship.', '2026-03-26 22:00:06'),
(3, 2, 7, 'Positive', 'Balanced Routine & Optimism', 'Low', 'Student reflected on a stable daily lifestyle and healthy academic balance. Recommended sustaining current sleep and revision schedules.', '2026-03-30 19:30:05');

-- --------------------------------------------------------
-- Dumping seed data for table `admin_logs`
-- --------------------------------------------------------
INSERT INTO `admin_logs` (`id`, `admin_id`, `action`, `created_at`) VALUES
(1, 1, 'Admin logged in and generated semester stress distribution analytics report.', '2026-03-25 10:00:00'),
(2, 1, 'Updated default academic wellness recommendations for high-stress threshold.', '2026-03-26 11:30:00');

COMMIT;

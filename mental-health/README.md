# AI-Based Student Mental Health Monitoring System
**Final-Year B.Tech Computer Science & Engineering (CSE) Capstone Project**

---

## 1. Project Introduction

The **AI-Based Student Mental Health Monitoring System** is an engineering-grade web platform developed to assist undergraduate and postgraduate university students in monitoring their emotional well-being, identifying early stress indicators, and cultivating balanced academic routines.

### ⚠️ Essential Ethical & Medical Disclaimer
> **“This system is designed for mental wellness monitoring and educational purposes only. It does not provide medical diagnosis or replace professional mental-health care.”**
>
> The system strictly avoids clinical psychiatric terminology (e.g., Depression, Clinical Anxiety, PTSD) and instead models empirical stress indicators categorized as **Low Stress**, **Moderate Stress**, or **High Stress**.

---

## 2. Key Features

### For Students
- **Secure Registration & Authentication:** Secure session management, password encryption via PHP `password_hash()` (bcrypt), CSRF protection.
- **Comprehensive 30-Question Assessment:** Scientifically categorized Likert-scale questionnaire covering:
  1. *Academic Stress* (Workload, exams, performance pressure)
  2. *Social Life* (Isolation, peer connection, campus participation)
  3. *Family Environment* (Expectations, support, communication)
  4. *Social Media* (Screen time, peer comparison, FOMO)
  5. *Physical Health* (Fatigue, sleep duration, exercise, routine)
  6. *Campus Environment* (Safety, ragging prevention, faculty support)
  7. *Financial Stress* (Expenses, student loans)
- **Automatic Reverse Scoring:** Automatically handles positive valence questions (e.g., *"I feel supported by my family"*).
- **Stress Classification Algorithm:** Converts raw 30–150 scale scores into normalized percentages (0–33% Low, 34–66% Moderate, 67–100% High).
- **Daily Mood Tracker:** Emoji picker, 1–10 stress slider, 1–10 energy slider, and sleep duration logging with single-entry-per-day enforcement.
- **AI-Powered Journal & Sentiment Analysis:** Asynchronous sentiment detection, emotional theme extraction, and stress severity estimation with fallback keyword lexicon.
- **Crisis & Self-Harm Safety Layer:** Proactive detection of critical keywords with immediate non-diagnostic emergency support banners.
- **Interactive Visual Charts (Chart.js):**
  - 7-Day Mood vs. Stress Correlation Line Chart
  - Sleep Duration Bar Trend
  - Multi-Category Stress Radar Chart
- **Personalized Recommendations Engine:** Domain-specific, actionable wellness advice tailored to individual test scores.
- **Assessment History & Printable Reports:** Full survey logs with browser print styling (`@media print`).
- **Data Privacy & Right to Erasure:** Complete profile update and 1-click permanent account erasure.

### For Faculty / Institutional Administrators
- **Executive Analytics Dashboard:** Total student count, total completed assessments, average wellness health index.
- **Stress Distribution Breakdown:** Chart.js Doughnut chart showing Low, Moderate, and High stress cohorts across campus.
- **Student Case Directory:** Full student directory with academic course, year, and assessment history.
- **Detailed Student Case View:** Comprehensive breakdown of past assessments, daily mood logs, and AI journal entries.
- **Guideline Management:** Admin interface to add, customize, or update score-triggered wellness directives.
- **Audit Logging:** System tracking of administrative access and operations.

---

## 3. Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend:** PHP 8.0+
- **Database:** MySQL 5.7+ / MariaDB 10.4+
- **Local Server Stack:** XAMPP (Apache + MySQL)
- **Data Visualizations:** Chart.js 4.4
- **Icons & Typography:** Font Awesome 6.5, Plus Jakarta Sans
- **Database Driver:** PHP Data Objects (PDO) with prepared statements

---

## 4. System Requirements

- **Operating System:** Windows 10/11, macOS, or Linux
- **Web Server:** Apache 2.4+
- **PHP Version:** PHP 8.0, 8.1, or 8.2 with `pdo_mysql` and `curl` extensions enabled
- **Database Server:** MySQL 5.7+ or MariaDB 10.4+
- **Web Browser:** Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari

---

## 5. XAMPP Installation Guide

1. Download XAMPP for your OS from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Run the installer and ensure **Apache** and **MySQL** components are checked.
3. Complete installation to the default path:
   - Windows: `C:\xampp`
   - Linux: `/opt/lampp`
   - macOS: `/Applications/XAMPP`
4. Launch the **XAMPP Control Panel**.
5. Click **Start** for both **Apache** and **MySQL**. Both modules should display green status badges.

---

## 6. Database Setup in phpMyAdmin

1. Open your web browser and navigate to:
   ```
   http://localhost/phpmyadmin/
   ```
2. Click on **New** in the left sidebar.
3. Enter database name: `mental_health_system`
4. Select Collation: `utf8mb4_unicode_ci` and click **Create**.
5. Click the **Import** tab at the top.
6. Click **Choose File** and select:
   ```
   mental-health/database/mental_health_system.sql
   ```
7. Scroll to the bottom and click **Import** (or **Go**).
8. Verify that all 8 tables are created:
   - `users`
   - `questions`
   - `assessments`
   - `assessment_answers`
   - `mood_entries`
   - `recommendations`
   - `journal_analysis`
   - `admin_logs`

---

## 7. Project Deployment

1. Copy the entire `mental-health` folder into your XAMPP web root directory:
   - **Windows:** `C:\xampp\htdocs\mental-health`
   - **Linux:** `/opt/lampp/htdocs/mental-health`
   - **macOS:** `/Applications/XAMPP/htdocs/mental-health`
2. Ensure directory permissions allow Apache to read files.

---

## 8. Configuration

Open `config/database.php` and verify your local MySQL credentials:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');       // Default is blank in XAMPP
define('DB_NAME', 'mental_health_system');
define('DB_PORT', '3306');
```

In `config/config.php`:
```php
define('BASE_URL', 'http://localhost/mental-health/');
define('GEMINI_API_KEY', ''); // Optional Google AI Studio key; fallback NLP engages automatically if blank
```

---

## 9. How to Run

Open your browser and navigate to:
```
http://localhost/mental-health/
```

---

## 10. Default Demo Credentials (College Viva Testing)

### Student Account:
- **Email:** `student@mentalhealth.local`
- **Password:** `Student@12345`
- **Name:** Aarav Sharma (B.Tech CSE 4th Year)

### Faculty / Administrator Account:
- **Email:** `admin@mentalhealth.local`
- **Password:** `Admin@12345`
- **Name:** System Administrator

*(New students can also register freely on the `/register.php` page).*

---

## 11. Folder Architecture

```text
mental-health/
│
├── index.php                 # Public landing page with features & crisis helpline
├── login.php                 # Unified student login portal
├── register.php              # Comprehensive student onboarding
├── logout.php                # Session clearing & logout handler
├── dashboard.php             # Modern analytics dashboard with Chart.js
├── assessment.php            # 30-Question Likert self-assessment
├── submit_assessment.php     # Scoring engine with reverse weighting
├── mood_tracker.php          # Daily emoji mood, sliders, sleep tracker
├── save_mood.php             # Save daily mood & trigger AI NLP
├── journal.php               # Historical mood and AI reflections
├── recommendations.php       # Dynamic domain-specific wellness guidelines
├── history.php               # Assessment progression table & print view
├── profile.php               # Profile update, password change & data erasure
│
├── admin/                    # Institutional administration portal
│   ├── login.php             # Admin authentication gate
│   ├── dashboard.php         # Aggregate institutional analytics & donut chart
│   ├── students.php          # Enrolled student directory & management
│   ├── student_details.php   # Detailed student case study & history
│   ├── assessments.php       # Filterable cross-campus assessment logs
│   ├── recommendations.php   # Manage score-triggered advice rules
│   └── logout.php            # Admin session destruction
│
├── api/                      # Asynchronous JSON API endpoints
│   ├── analyze_journal.php   # AI / NLP sentiment & crisis detection API
│   ├── mood_data.php         # 7-day and 30-day Chart.js data feeder
│   └── assessment_data.php   # Category breakdown radar chart feeder
│
├── config/                   # Central application configuration
│   ├── database.php          # PDO singleton instance & connection handler
│   └── config.php            # Session parameters, emergency contacts, constants
│
├── includes/                 # Reusable components & business logic
│   ├── auth.php              # Role guards (requireStudent, requireAdmin)
│   ├── header.php            # HTML5 head, Font Awesome, Chart.js, disclaimer
│   ├── footer.php            # Emergency support directory, scripts, copyright
│   ├── navbar.php            # Responsive navbar with active state tracking
│   └── functions.php         # Scoring formula, reverse scorer, NLP analyzer
│
├── assets/                   # Static resources
│   ├── css/
│   │   ├── style.css         # Primary modern SaaS stylesheet
│   │   ├── dashboard.css     # Stats cards, sliders, progress bars, radar UI
│   │   └── responsive.css    # Mobile, tablet, desktop media queries
│   ├── js/
│   │   ├── main.js           # Flash dismiss, Likert progress updater
│   │   ├── dashboard.js      # Fetch API integration for live AI journal
│   │   ├── mood.js           # Emoji picker & range slider counter
│   │   └── charts.js         # Modular Chart.js rendering engine
│   └── images/
│
└── database/
    └── mental_health_system.sql # Complete schema with tables & demo records
```

---

## 12. Scoring Algorithm & Mathematical Formula

The 30-question instrument evaluates 7 distinct domains using a 1–5 Likert scale:
- $1 = \text{Never}$
- $2 = \text{Rarely}$
- $3 = \text{Sometimes}$
- $4 = \text{Often}$
- $5 = \text{Always}$

### Reverse Scoring Rule
For items framed positively (e.g., $Q_{12}$: *"I feel supported by my family"*), the score is inverted:
$$\text{Adjusted Score} = 6 - \text{Raw Answer}$$

### Normalized Percentage Formula
$$\text{Min Score} = 30 \times 1 = 30$$
$$\text{Max Score} = 30 \times 5 = 150$$
$$\text{Stress Percentage} = \left( \frac{\text{Total Score} - \text{Min Score}}{\text{Max Score} - \text{Min Score}} \right) \times 100$$

### Wellness Classification
- **$0\% - 33.3\%$:** **Low Stress** (Healthy emotional stability)
- **$33.4\% - 66.6\%$:** **Moderate Stress** (Manageable academic pressure)
- **$66.7\% - 100.0\%$:** **High Stress** (Elevated tension; proactive support recommended)

---

## 13. Security Implementation

1. **SQL Injection Defense:** Strict usage of PDO Prepared Statements with bound parameters across all database interactions.
2. **Cross-Site Scripting (XSS) Prevention:** Output sanitized using `htmlspecialchars($str, ENT_QUOTES, 'UTF-8')`.
3. **Password Security:** One-way hashing using PHP `password_hash($pass, PASSWORD_BCRYPT)`. Plaintext passwords are never stored.
4. **CSRF Protection:** Cryptographically secure pseudorandom tokens (`bin2hex(random_bytes(32))`) validated on all POST operations.
5. **Session Hardening:** `session.cookie_httponly = 1`, `session.use_only_cookies = 1`, and `session_regenerate_id(true)` upon authentication.
6. **Role-Based Access Control (RBAC):** Strict separation of `student` and `admin` routes via server-side middleware (`requireStudent()`, `requireAdmin()`).

---

## 14. Viva Questions & Project Defense Guide

| Viva Question | Technical Answer |
|---|---|
| **Why use PDO instead of MySQLi?** | PDO provides a consistent database abstraction layer, supports named parameters, and enforces prepared statements to eliminate SQL injection vulnerabilities. |
| **How does reverse scoring work?** | Questions with positive valence (like feeling supported or safe) decrease overall stress when answered highly. If a student answers 5 (Always supported), `6 - 5 = 1` stress point is added. |
| **What happens if the Gemini AI API is down?** | The system includes a dual-mode NLP engine: it seamlessly falls back to an offline rule-based lexicon and sentiment analyzer with keyword tokenization and crisis pattern detection. |
| **How is student privacy protected?** | The system enforces session-scoped data isolation so students can only inspect their own records. Additionally, a GDPR-style "Right to Erasure" feature allows students to permanently delete their account and logs. |

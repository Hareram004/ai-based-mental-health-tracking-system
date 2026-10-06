<?php
/**
 * Public Landing Page
 * AI-Based Student Mental Health Monitoring System
 */

$pageTitle = "Home - Student Mental Health & Wellness Monitoring System";
require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section style="background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%); padding: 5rem 0 4rem; border-bottom: 1px solid var(--border-color);">
  <div class="container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 3rem; align-items: center;">
    
    <div>
      <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: #eef2ff; color: #4f46e5; padding: 0.35rem 0.9rem; border-radius: 999px; font-weight: 700; font-size: 0.82rem; margin-bottom: 1.25rem;">
        <i class="fa-solid fa-sparkles"></i> AI-Powered Wellness & Stress Analytics
      </div>
      <h1 style="font-size: 2.75rem; font-weight: 800; color: #0f172a; line-height: 1.15; margin-bottom: 1.25rem;">
        Understand Your Well-Being.<br><span style="color: var(--primary);">Build a Healthier Routine.</span>
      </h1>
      <p style="font-size: 1.15rem; color: #475569; line-height: 1.6; margin-bottom: 2rem;">
        Track your mood, understand your stress patterns, and receive personalized wellness recommendations designed specifically for undergraduate and postgraduate students.
      </p>

      <div class="hero-actions" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <a href="<?php echo BASE_URL; ?>assessment.php" class="btn btn-primary" style="padding: 0.85rem 1.75rem; font-size: 1rem;">
          <i class="fa-solid fa-clipboard-list"></i> Start Assessment
        </a>
        <a href="<?php echo BASE_URL; ?>login.php" class="btn btn-outline" style="padding: 0.85rem 1.75rem; font-size: 1rem;">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Student Login
        </a>
      </div>

      <div style="display: flex; gap: 2rem; margin-top: 2.5rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #0f172a;">30</div>
          <div style="font-size: 0.82rem; color: #64748b;">Validated Questions</div>
        </div>
        <div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--secondary);">7</div>
          <div style="font-size: 0.82rem; color: #64748b;">Stress Categories</div>
        </div>
        <div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent);">100%</div>
          <div style="font-size: 0.82rem; color: #64748b;">Student Privacy</div>
        </div>
      </div>
    </div>

    <div>
      <div class="card" style="border: 2px solid #e0e7ff; box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.1); padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <span style="font-size: 0.8rem; font-weight: 700; color: #6366f1; text-transform: uppercase;">Sample Wellness Snapshot</span>
            <h3 style="margin-top: 0.2rem;">Semester Stress Index</h3>
          </div>
          <span class="badge badge-success"><i class="fa-solid fa-check"></i> Balanced</span>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.88rem; font-weight: 600;">
            <span>Academic Workload Stress</span>
            <span style="color: #4f46e5;">38% (Low-Mod)</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill progress-moderate" style="width: 38%;"></div>
          </div>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.88rem; font-weight: 600;">
            <span>Sleep & Recovery Quality</span>
            <span style="color: #10b981;">7.4 hrs (Healthy)</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill progress-low" style="width: 82%;"></div>
          </div>
        </div>

        <div style="background: #eef2ff; border-radius: 12px; padding: 1rem; display: flex; gap: 0.85rem; align-items: center;">
          <i class="fa-solid fa-lightbulb" style="color: #4f46e5; font-size: 1.35rem;"></i>
          <p style="font-size: 0.85rem; color: #3730a3; margin: 0; line-height: 1.4;">
            <strong>AI Recommendation:</strong> Maintain your consistent sleep window before morning lab practicals.
          </p>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- How It Works Section -->
<section id="features" class="container" style="padding: 4.5rem 1.5rem;">
  <div style="text-align: center; max-width: 680px; margin: 0 auto 3.5rem;">
    <span class="badge badge-neutral" style="margin-bottom: 0.5rem;">HOW THE SYSTEM WORKS</span>
    <h2>A Holistic 4-Step Support Loop</h2>
    <p style="color: #64748b; margin-top: 0.5rem;">Built to encourage gentle self-awareness, academic equilibrium, and supportive campus intervention.</p>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
    
    <div class="card" style="text-align: center; padding: 2rem 1.5rem;">
      <div style="width: 60px; height: 60px; border-radius: 16px; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 1.25rem;">
        <i class="fa-solid fa-list-check"></i>
      </div>
      <h3>1. Self-Assessment</h3>
      <p style="font-size: 0.88rem; color: #64748b; margin-top: 0.65rem;">
        Complete a 30-question survey spanning academic pressure, social life, family expectations, screen habits, and campus environment.
      </p>
    </div>

    <div class="card" style="text-align: center; padding: 2rem 1.5rem;">
      <div style="width: 60px; height: 60px; border-radius: 16px; background: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 1.25rem;">
        <i class="fa-solid fa-chart-line"></i>
      </div>
      <h3>2. Stress Classification</h3>
      <p style="font-size: 0.88rem; color: #64748b; margin-top: 0.65rem;">
        Our PHP scoring algorithm calculates normalized stress percentages and non-clinical categories (Low, Moderate, High Stress).
      </p>
    </div>

    <div class="card" style="text-align: center; padding: 2rem 1.5rem;">
      <div style="width: 60px; height: 60px; border-radius: 16px; background: #fffbeb; color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 1.25rem;">
        <i class="fa-regular fa-face-smile-beam"></i>
      </div>
      <h3>3. Daily Mood & AI Journal</h3>
      <p style="font-size: 0.88rem; color: #64748b; margin-top: 0.65rem;">
        Log daily mood, sleep hours, and journal reflections. AI/NLP analyzes sentiment and identifies recurring emotional themes.
      </p>
    </div>

    <div class="card" style="text-align: center; padding: 2rem 1.5rem;">
      <div style="width: 60px; height: 60px; border-radius: 16px; background: #f3e8ff; color: #8b5cf6; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 1.25rem;">
        <i class="fa-solid fa-bullseye"></i>
      </div>
      <h3>4. Actionable Guidance</h3>
      <p style="font-size: 0.88rem; color: #64748b; margin-top: 0.65rem;">
        Receive constructive study tips, sleep hygiene guidelines, and verified campus helpline resources tailored to your scores.
      </p>
    </div>

  </div>
</section>

<!-- Crisis & Safety Section -->
<section id="safety" style="background: #ffffff; padding: 4rem 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
  <div class="container">
    <div class="crisis-box">
      <div class="crisis-box-icon">
        <i class="fa-solid fa-hand-holding-heart"></i>
      </div>
      <div>
        <h3 style="color: #991b1b; margin-bottom: 0.4rem;">Immediate Campus & Emergency Support</h3>
        <p style="color: #7f1d1d; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem;">
          If you are experiencing severe distress or having thoughts of self-harm, please remember that you are not alone. Please reach out to trusted mentors, campus counselors, or national crisis helplines immediately.
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="tel:14416" class="btn btn-danger btn-sm"><i class="fa-solid fa-phone"></i> Call Tele-MANAS (14416)</a>
          <a href="tel:18005990019" class="btn btn-outline btn-sm"><i class="fa-solid fa-phone"></i> Call Kiran (1800-599-0019)</a>
        </div>
      </div>
    </div>
  </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

<?php
/**
 * Common HTML Footer Component
 * AI-Based Student Mental Health Monitoring System
 */

global $EMERGENCY_RESOURCES;
?>
  </main>

  <footer class="footer">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
        
        <div>
          <div class="nav-brand" style="margin-bottom: 0.75rem;">
            <i class="fa-solid fa-heart-pulse"></i>
            <span><?php echo APP_NAME; ?></span>
          </div>
          <p style="font-size: 0.88rem; color: #64748b; line-height: 1.6; margin-bottom: 1rem;">
            A compassionate, data-driven mental wellness monitoring platform crafted for higher-education students to track emotional patterns, study stressors, and sleep quality.
          </p>
          <span class="badge badge-neutral">B.Tech Final Year CSE Capstone</span>
        </div>

        <div>
          <h4 style="font-size: 0.95rem; margin-bottom: 0.85rem; color: #1e293b;"><i class="fa-solid fa-phone-volume text-primary"></i> 24x7 Student Support Helplines</h4>
          <ul style="list-style: none; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem; color: #475569;">
            <li><strong>Tele-MANAS:</strong> 14416 / 1800-891-4416 (Toll-Free)</li>
            <li><strong>Kiran Helpline:</strong> 1800-599-0019 (24 Hours)</li>
            <li><strong>Vandrevala Foundation:</strong> +91 9999 666 555</li>
            <li><strong>Campus Counseling Cell:</strong> Room 102, Student Centre</li>
          </ul>
        </div>

        <div>
          <h4 style="font-size: 0.95rem; margin-bottom: 0.85rem; color: #1e293b;"><i class="fa-solid fa-shield-heart text-secondary"></i> Ethical & Privacy Notice</h4>
          <p style="font-size: 0.82rem; color: #64748b; line-height: 1.6;">
            All assessment responses and journal entries are private to the student account and encrypted/stored securely. No automated psychiatric diagnosis is rendered.
          </p>
        </div>

      </div>

      <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; font-size: 0.82rem; color: #94a3b8;">
        <div>
          &copy; <?php echo date('Y'); ?> <?php echo APP_FULL_TITLE; ?>. Designed for College Academic Submission.
        </div>
        <div>
          <span>PHP 8+ &bull; MySQL &bull; Vanilla JS &bull; Chart.js &bull; PDO Secure</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- Core JavaScript Bundles -->
  <script src="<?php echo BASE_URL; ?>assets/js/main.js"></script>
  <script src="<?php echo BASE_URL; ?>assets/js/charts.js"></script>
  <script src="<?php echo BASE_URL; ?>assets/js/mood.js"></script>
  <script src="<?php echo BASE_URL; ?>assets/js/dashboard.js"></script>
</body>
</html>

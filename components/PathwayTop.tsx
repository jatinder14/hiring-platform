"use client";

export function PathwayTop() {
  return (
    <section className="pw-section pw-hero-shell" id="pathway-top" aria-label="Hero">
      <div className="pw-hero-panel">
        <div className="pw-hero-smoke" aria-hidden="true" />

        <div className="pw-badges" aria-label="Platform stats">
          <span>$80/hr Average pay</span>
          <span>1K+ hired weekly</span>
          <span>$1M paid weekly</span>
        </div>

        <div className="pw-hero-copy">
          <h1>
            WHERE EXPERTS GET
            <br />
            PAID TO TRAIN AI
          </h1>
          <p>
            Join our expert network and unlock continuous opportunities, remote work, and faster team connections.
          </p>

          <div className="pw-hero-actions">
            <a className="pw-cta-btn" href="/recruiter/register">
              Hire a Talent
            </a>
            <a className="pw-cta-btn ghost" href="#team">
              Connect to Team
            </a>
          </div>
        </div>

        <span className="pw-hero-star" aria-hidden="true">
          ✦
        </span>
      </div>
    </section>
  );
}

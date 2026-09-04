// Standalone "Coming Soon" page served directly by middleware.js.
// Kept as a plain HTML string so the gate renders without the app shell
// (no header, nav, footer, auth session or database access).

const YEAR = new Date().getFullYear();

export const comingSoonHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Coming Soon &middot; Subconscious Valley</title>
<meta name="description" content="Subconscious Valley is launching soon. Science-backed hypnotherapy and NLP audio sessions." />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" href="/favicon.ico" />
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    padding: clamp(18px, 4vh, 40px) clamp(14px, 4vw, 20px);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #e2e8f0;
    background: #04110f;
    background-image:
      radial-gradient(900px 600px at 15% 12%, rgba(13,148,136,.34), transparent 60%),
      radial-gradient(760px 560px at 88% 84%, rgba(16,185,129,.24), transparent 62%),
      linear-gradient(160deg, #032723 0%, #04110f 46%, #06231d 100%);
    -webkit-font-smoothing: antialiased;
  }
  /* margin:auto centres the card without clipping it when it is taller
     than the viewport (align-items:center would push the top out of reach). */
  .card { width: 100%; max-width: 620px; margin: auto; text-align: center; }
  .logo {
    display: inline-block;
    background: #fff;
    padding: 10px 14px;
    border-radius: 14px;
    line-height: 0;
    box-shadow: 0 18px 45px rgba(0,0,0,.45);
  }
  .logo img { height: clamp(40px, 7.2vh, 58px); width: auto; display: block; }
  h1 {
    margin: clamp(24px, 5vh, 46px) 0 clamp(12px, 2vh, 18px);
    font-size: clamp(1.95rem, 6.4vw + .2vh, 3.5rem);
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: -.02em;
    color: #fff;
    text-wrap: balance;
  }
  /* inline-block keeps the gradient phrase from splitting across lines */
  h1 span {
    display: inline-block;
    background: linear-gradient(95deg, #2dd4bf, #34d399 55%, #a7f3d0);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  p.sub { margin: 0 auto; max-width: 27rem; font-size: clamp(.9rem, 2.2vw, 1rem); line-height: 1.6; color: #94aba6; }
  .rule {
    width: 64px; height: 3px; margin: clamp(16px, 3.4vh, 30px) auto;
    border-radius: 999px;
    background: linear-gradient(90deg, #14b8a6, #34d399);
  }
  .contact {
    display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    max-width: 100%;
    padding: 12px clamp(14px, 4vw, 22px);
    font-size: clamp(.72rem, 3.2vw, .95rem); font-weight: 600;
    color: #04110f; text-decoration: none;
    background: linear-gradient(95deg, #14b8a6, #34d399);
    border-radius: 999px;
    transition: transform .18s ease, box-shadow .18s ease;
    box-shadow: 0 12px 30px rgba(20,184,166,.28);
  }
  .contact:hover { transform: translateY(-2px); box-shadow: 0 16px 38px rgba(20,184,166,.4); }
  .socials { margin-top: clamp(18px, 3.6vh, 34px); display: flex; justify-content: center; gap: clamp(8px, 2.6vw, 12px); }
  .socials a {
    display: inline-flex; align-items: center; justify-content: center;
    flex: 0 0 auto;
    width: clamp(36px, 10vw, 42px); height: clamp(36px, 10vw, 42px);
    color: #b6c8c4;
    border: 1px solid rgba(148,163,184,.22);
    border-radius: 50%;
    transition: color .18s ease, border-color .18s ease, background .18s ease;
  }
  .socials a:hover { color: #fff; border-color: rgba(45,212,191,.55); background: rgba(20,184,166,.16); }
  .socials svg { width: 19px; height: 19px; }
  footer { margin-top: clamp(18px, 3.8vh, 38px); font-size: .8rem; color: #5c716d; line-height: 1.7; }
  /* Short viewports (landscape phones): tighten everything so the logo and
     copyright stay on screen without scrolling. */
  @media (max-height: 470px) {
    .logo { padding: 7px 10px; border-radius: 10px; }
    .logo img { height: 32px; }
    h1 { margin: 14px 0 8px; font-size: clamp(1.5rem, 4.2vw, 2.1rem); }
    p.sub { font-size: .82rem; max-width: 34rem; }
    .rule { margin: 12px auto; }
    .contact { padding: 9px 18px; }
    .socials { margin-top: 14px; }
    .socials a { width: 34px; height: 34px; }
    .socials svg { width: 16px; height: 16px; }
    footer { margin-top: 14px; font-size: .74rem; }
  }
  @media (prefers-reduced-motion: no-preference) {
    .card { animation: rise .7s cubic-bezier(.21,.6,.35,1) both; }
    @keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  }
</style>
</head>
<body>
  <main class="card">
    <span class="logo">
      <img src="https://cdn.subconsciousvalley.workers.dev/legend.png" alt="Subconscious Valley" width="120" height="58" />
    </span>

    <h1>Something calm is <span>on its way</span></h1>

    <p class="sub">Our site is temporarily unavailable while we prepare for launch. Thank you for your patience.</p>

    <div class="rule"></div>

    <a class="contact" href="mailto:hello@subconsciousvalley.com">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
        <path d="m22 7-10 6L2 7"></path>
      </svg>
      hello@subconsciousvalley.com
    </a>

    <nav class="socials" aria-label="Social media">
      <a href="https://www.instagram.com/subconsciousvalley/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle></svg>
      </a>
      <a href="https://www.youtube.com/@SubconsciousValley" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.6-.46-5.3a2.77 2.77 0 0 0-1.95-1.96C18.88 4.28 12 4.28 12 4.28s-6.88 0-8.59.46A2.77 2.77 0 0 0 1.46 6.7 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.3 2.77 2.77 0 0 0 1.95 1.96c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.77 2.77 0 0 0 1.95-1.96C23 15.6 23 12 23 12zM9.75 15.27V8.73L15.5 12z"></path></svg>
      </a>
      <a href="https://www.tiktok.com/@subconciousvalley" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.16 20.5a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.5z"></path></svg>
      </a>
      <a href="https://www.facebook.com/people/Subconscious-Valley/61581912532657/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
      </a>
      <a href="https://www.linkedin.com/in/vanita-pande-343032165" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-10h4v1.5A4 4 0 0 1 16 8z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      </a>
    </nav>

    <footer>
      &#128205; Dubai, United Arab Emirates<br />
      &copy; ${YEAR} Subconscious Valley. All rights reserved.
    </footer>
  </main>
</body>
</html>`;

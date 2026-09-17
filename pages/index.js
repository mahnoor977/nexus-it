import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const bodyHtml = `
`.replace('${new Date().getFullYear()}', '') + `
<nav>
  <div class="logo"><img src="/logo.png" alt="" style="width:26px;height:26px;object-fit:contain;vertical-align:middle;margin-right:8px;" />NEXUS-IT</div>
  <div class="nav-links">
    <a class="link" href="#problem">Why</a>
    <a class="link" href="#features">What you get</a>
    <a class="link" href="#how">How it works</a>
    <button class="btn" onclick="openModal('login')">Log in</button>
    <button class="btn btn-solid" onclick="openModal('signup')">Create account</button>
  </div>
  <button class="nav-mobile-toggle" id="nav-mobile-toggle" aria-label="Toggle navigation" onclick="toggleMobileNav()">
    <i class="ti ti-menu-2"></i>
  </button>
</nav>
<div class="mobile-nav-panel" id="mobile-nav-panel">
  <a href="#problem" onclick="closeMobileNav()">Why</a>
  <a href="#features" onclick="closeMobileNav()">What you get</a>
  <a href="#how" onclick="closeMobileNav()">How it works</a>
  <div class="mobile-nav-btns">
    <button class="btn" onclick="closeMobileNav(); openModal('login')">Log in</button>
    <button class="btn btn-solid" onclick="closeMobileNav(); openModal('signup')">Create account</button>
  </div>
</div>

<section class="hero">
  <div class="gradient-mesh">
    <div class="mesh-blob b1"></div>
    <div class="mesh-blob b2"></div>
    <div class="mesh-blob b3"></div>
  </div>
  <div class="hero-content" style="position:relative;z-index:1;">
    <div class="eyebrow mono" id="boot-text">INITIALIZING_IT_COLLECTIVE</div>
    <h1>What builders are<br><span>shipping.</span></h1>
    <p class="sub">A verified space to showcase mini-projects, find collaborators by skill, get real feedback, and ship things worth putting on your résumé not another repo nobody sees. Open to builders everywhere, not just one campus.</p>
    <div class="hero-form">
      <input type="email" placeholder="you@email.com" id="hero-email">
      <button id="hero-cta-btn" onclick="openModal('signup')">Get Early Access</button>
    </div>
        <div class="hero-note">// email-verified accounts · free to join · open worldwide</div>
  </div>

    <div class="hero-visual" style="position:relative;z-index:1;">
    <div class="mock-window">
  <div class="mock-browserbar">
    <span class="mbb-dot"></span><span class="mbb-dot"></span><span class="mbb-dot"></span>
    <span class="mbb-url"><i class="ti ti-lock"></i>nexus-it.dev/projects</span>
  </div>
  <div class="mock-topbar">
    <div class="mock-brand"><img src="/logo.png" alt="" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;margin-right:6px;" />NEXUS-IT</div>
    <div class="mock-search"><i class="ti ti-search"></i>Search projects... <span class="mock-kbd">⌘K</span></div>
    <span class="mock-bell"><i class="ti ti-bell mock-icon-btn"></i><span class="mock-bell-dot"></span></span>
    <div class="mock-avatar">MA</div>
  </div>
  <div class="mock-stats">
    <div class="mock-stat"><strong>2.4k</strong><span>Builders</span><em><i class="ti ti-trending-up"></i>+12%</em></div>
    <div class="mock-stat"><strong>1.2k</strong><span>Projects shipped</span><em><i class="ti ti-trending-up"></i>+8%</em></div>
    <div class="mock-stat"><strong>8.9k</strong><span>Feedback given</span><em><i class="ti ti-trending-up"></i>+23%</em></div>
  </div>
  <div class="mock-section-head">
    <span><span class="mock-live"></span>Top shipped this week</span>
    <a href="#">View all →</a>
  </div>
  <div class="mock-row mock-row-top">
    <span class="mock-rank">1</span>
    <div class="mock-icon" style="background:#8B5CF6;"><i class="ti ti-sparkles"></i></div>
    <div class="mock-row-text">
      <div class="mock-row-title">LaunchFlow <span class="mock-top-pill"><i class="ti ti-crown"></i>Top</span></div>
      <div class="mock-row-sub">AI-powered release orchestration</div>
    </div>
    <span class="mock-tag" style="background:#EFE9FB;color:#6D4FC4;">DevTools</span>
    <div class="mock-row-meta">
      <span class="mock-count"><i class="ti ti-star-filled"></i>1.2k</span>
      <span class="mock-time">Shipped 2d ago</span>
    </div>
  </div>
  <div class="mock-row">
    <span class="mock-rank">2</span>
    <div class="mock-icon" style="background:#22A06B;"><i class="ti ti-chart-bar"></i></div>
    <div class="mock-row-text">
      <div class="mock-row-title">Metricly</div>
      <div class="mock-row-sub">Real-time analytics for modern teams</div>
    </div>
    <span class="mock-tag" style="background:#E4F5EC;color:#1D7A54;">Analytics</span>
    <div class="mock-row-meta">
      <span class="mock-count"><i class="ti ti-star"></i>948</span>
      <span class="mock-time">Shipped 3d ago</span>
    </div>
  </div>
  <div class="mock-row">
    <span class="mock-rank">3</span>
    <div class="mock-icon" style="background:#2563EB;"><i class="ti ti-shield-check"></i></div>
    <div class="mock-row-text">
      <div class="mock-row-title">ShieldStack</div>
      <div class="mock-row-sub">Infrastructure security, simplified</div>
    </div>
    <span class="mock-tag" style="background:#E6EEFD;color:#1D4ED8;">Security</span>
    <div class="mock-row-meta">
      <span class="mock-count"><i class="ti ti-star"></i>723</span>
      <span class="mock-time">Shipped 4d ago</span>
    </div>
  </div>
  <div class="mock-footbar">
    <span class="mock-foot-avatar">DK</span>
    <div class="mock-foot-text"><strong>Collab request</strong><span>DK wants to join LaunchFlow</span></div>
    <span class="mock-foot-btn">Accept</span>
  </div>
</div>
    </div>

</section>

<div class="trust-bar">
  <span><i class="ti ti-lock"></i>Your data stays private</span>
  <span><i class="ti ti-shield-check"></i>Email-verified accounts</span>
  <span><i class="ti ti-world"></i>Open to builders everywhere</span>
  <span><i class="ti ti-gift"></i>Free, always</span>
</div>

<section id="problem">
  <div class="section-row reveal">
    <div class="section-head">
      <div class="eyebrow">The Problem</div>
      <h2>Great projects, zero visibility.</h2>
      <p>Every semester, hundreds of solid mini-projects get built, graded, and forgotten. Nobody outside the classroom ever sees them.</p>
    </div>
    <div class="section-illus" aria-hidden="true">
      <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M104 84 C 160 40 248 44 306 92" stroke="var(--tea)" stroke-width="1.5" stroke-dasharray="5 7" opacity="0.5"/>
        <path d="M84 122 C 60 190 110 240 170 244" stroke="var(--tea)" stroke-width="1.5" stroke-dasharray="5 7" opacity="0.35"/>
        <path d="M318 128 C 340 190 300 236 246 244" stroke="var(--tea)" stroke-width="1.5" stroke-dasharray="5 7" opacity="0.35"/>
        <circle cx="86" cy="96" r="22" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
        <text x="86" y="101" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="11" font-weight="600" fill="var(--tea)">DK</text>
        <circle cx="322" cy="104" r="22" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
        <text x="322" y="109" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="11" font-weight="600" fill="var(--tea)">SA</text>
        <circle cx="204" cy="52" r="24" fill="var(--tea)"/>
        <text x="204" y="57" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="11" font-weight="600" fill="var(--black)">MA</text>
        <rect x="118" y="112" width="172" height="118" rx="16" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
        <rect x="136" y="130" width="92" height="8" rx="4" fill="var(--text)" opacity="0.75"/>
        <rect x="136" y="146" width="136" height="6" rx="3" fill="var(--muted)" opacity="0.45"/>
        <rect x="136" y="158" width="112" height="6" rx="3" fill="var(--muted)" opacity="0.35"/>
        <rect x="136" y="176" width="48" height="16" rx="8" fill="rgba(197,160,89,0.16)"/>
        <rect x="190" y="176" width="48" height="16" rx="8" fill="rgba(197,160,89,0.16)"/>
        <rect x="136" y="202" width="60" height="14" rx="7" fill="var(--tea)"/>
        <circle cx="292" cy="112" r="17" fill="var(--tea)"/>
        <path d="M292 119 c-5.5-4.4 -8-7.3 -8-10.2 a4.6 4.6 0 0 1 8-3.1 a4.6 4.6 0 0 1 8 3.1 c0 2.9 -2.5 5.8 -8 10.2 z" fill="var(--black)"/>
        <rect x="52" y="196" width="74" height="40" rx="12" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
        <circle cx="74" cy="216" r="3" fill="var(--tea)"/>
        <circle cx="89" cy="216" r="3" fill="var(--tea)"/>
        <circle cx="104" cy="216" r="3" fill="var(--tea)"/>
        <path d="M348 60 l3 8 8 3 -8 3 -3 8 -3-8 -8-3 8-3 z" fill="var(--tea)" opacity="0.8"/>
        <path d="M48 42 l2.2 6 6 2.2 -6 2.2 -2.2 6 -2.2-6 -6-2.2 6-2.2 z" fill="var(--tea)" opacity="0.5"/>
      </svg>
    </div>
  </div>
  <div class="problem-grid reveal">
    <div class="problem-card">
      <div class="num">01</div>
      <p>Projects get pushed to GitHub once, then never revisited or discovered by anyone who could use or improve them.</p>
    </div>
    <div class="problem-card">
      <div class="num">02</div>
      <p>Finding a teammate means asking around in scattered WhatsApp groups, limited to whoever happens to be in your own circle.</p>
    </div>
    <div class="problem-card">
      <div class="num">03</div>
      <p>Feedback, when it happens, lives in screenshots and DMs disconnected from the project it was actually about.</p>
    </div>
  </div>
</section>

<section id="features">
  <div class="section-head reveal">
    <div class="eyebrow">What You Get</div>
    <h2>Built specifically for student builders.</h2>
    <p>Not a GitHub replacement, and not another LinkedIn. A layer made for the way students actually collaborate.</p>
  </div>
  <div class="feature-grid reveal">
    <div class="feature-card">
      <div class="feature-icon"><i class="ti ti-presentation"></i></div>
      <div class="feature-tag">Showcase</div>
      <h3>Project profiles</h3>
      <p>Post your mini-projects and reports with tech stack, demo links, and files and keep getting feedback long after submission.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon"><i class="ti ti-message-circle"></i></div>
      <div class="feature-tag">Connect</div>
      <h3>Direct messaging</h3>
      <p>Message peers directly, form project teams, and keep the conversation attached to the work not lost in a group chat.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon"><i class="ti ti-messages"></i></div>
      <div class="feature-tag">Discuss</div>
      <h3>Threaded feedback</h3>
      <p>Every project has its own discussion thread, so critique and ideas stay exactly where the work lives.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon"><i class="ti ti-sparkles"></i></div>
      <div class="feature-tag">AI Advisor</div>
      <h3>Your project co-pilot</h3>
      <p>Stuck on an idea, an architecture choice, or a bug? The advisor suggests project ideas, reviews your approach, and matches you with peers building similar things.</p>
    </div>
  </div>
</section>

<section id="how">
  <div class="section-head reveal">
    <div class="eyebrow">How It Works</div>
    <h2>Four steps. That's it.</h2>
  </div>
  <div class="how-row reveal">
    <div class="terminal">
    <div class="terminal-head"><span></span><span></span><span></span></div>
    <div class="terminal-body">
      <div class="term-line">
        <span class="term-idx">01</span>
        <div><strong>Join with your email</strong><span class="desc">Open to anyone building in IT students, self-taught devs, professionals. No campus restriction.</span></div>
      </div>
      <div class="term-line">
        <span class="term-idx">02</span>
        <div><strong>Verify your inbox</strong><span class="desc">One code, and you're in. Keeps accounts real, not restricted.</span></div>
      </div>
      <div class="term-line">
        <span class="term-idx">03</span>
        <div><strong>Build your profile</strong><span class="desc">Add your skills, link your work, tell people what you're building.</span></div>
      </div>
      <div class="term-line">
        <span class="term-idx">04</span>
        <div><strong>Post, message, collaborate</strong><span class="desc">Showcase projects, message peers, and let the AI advisor point you to your next build.</span></div>
      </div>
    </div>
    </div>
    <div class="section-illus" aria-hidden="true">
      <svg width="230" height="390" viewBox="0 0 230 390" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="220" height="380" rx="32" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
        <rect x="90" y="18" width="50" height="6" rx="3" fill="var(--line)"/>
        <text x="24" y="52" font-family="'IBM Plex Sans',sans-serif" font-size="12" font-weight="700" fill="var(--tea)">NEXUS-IT</text>
        <circle cx="196" cy="47" r="10" fill="var(--tea)"/>
        <text x="196" y="51" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="8" font-weight="600" fill="var(--black)">MA</text>
        <rect x="22" y="66" width="186" height="26" rx="13" fill="var(--panel-2)" stroke="var(--line)"/>
        <circle cx="38" cy="79" r="4.5" stroke="var(--muted)" stroke-width="1.5"/>
        <line x1="41.5" y1="82.5" x2="45" y2="86" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round"/>
        <rect x="52" y="76" width="70" height="6" rx="3" fill="var(--muted)" opacity="0.4"/>
        <rect x="22" y="106" width="186" height="74" rx="14" fill="var(--panel-2)" stroke="var(--line)"/>
        <circle cx="42" cy="128" r="9" fill="var(--tea)"/>
        <rect x="58" y="121" width="72" height="7" rx="3.5" fill="var(--text)" opacity="0.7"/>
        <rect x="58" y="133" width="52" height="5" rx="2.5" fill="var(--muted)" opacity="0.5"/>
        <rect x="34" y="150" width="140" height="5" rx="2.5" fill="var(--muted)" opacity="0.4"/>
        <rect x="34" y="161" width="40" height="12" rx="6" fill="rgba(197,160,89,0.18)"/>
        <path d="M186 163 c-3.6-2.9 -5.2-4.8 -5.2-6.7 a3 3 0 0 1 5.2-2 a3 3 0 0 1 5.2 2 c0 1.9 -1.6 3.8 -5.2 6.7 z" fill="var(--tea)"/>
        <rect x="22" y="190" width="186" height="74" rx="14" fill="var(--panel-2)" stroke="var(--tea)" stroke-width="1.5"/>
        <circle cx="42" cy="212" r="9" fill="var(--tea)"/>
        <rect x="58" y="205" width="84" height="7" rx="3.5" fill="var(--text)" opacity="0.7"/>
        <rect x="58" y="217" width="60" height="5" rx="2.5" fill="var(--muted)" opacity="0.5"/>
        <rect x="34" y="234" width="140" height="5" rx="2.5" fill="var(--muted)" opacity="0.4"/>
        <rect x="34" y="245" width="52" height="12" rx="6" fill="var(--tea)"/>
        <path d="M186 247 c-3.6-2.9 -5.2-4.8 -5.2-6.7 a3 3 0 0 1 5.2-2 a3 3 0 0 1 5.2 2 c0 1.9 -1.6 3.8 -5.2 6.7 z" fill="var(--tea)"/>
        <rect x="22" y="274" width="186" height="60" rx="14" fill="var(--panel-2)" stroke="var(--line)"/>
        <circle cx="42" cy="296" r="9" fill="var(--tea)"/>
        <rect x="58" y="289" width="64" height="7" rx="3.5" fill="var(--text)" opacity="0.7"/>
        <rect x="58" y="301" width="44" height="5" rx="2.5" fill="var(--muted)" opacity="0.5"/>
        <rect x="34" y="316" width="120" height="5" rx="2.5" fill="var(--muted)" opacity="0.4"/>
        <rect x="22" y="344" width="186" height="28" rx="14" fill="var(--panel-2)" stroke="var(--line)"/>
        <circle cx="45" cy="358" r="4" fill="var(--tea)"/>
        <circle cx="92" cy="358" r="4" fill="var(--muted)" opacity="0.5"/>
        <circle cx="138" cy="358" r="4" fill="var(--muted)" opacity="0.5"/>
        <circle cx="185" cy="358" r="4" fill="var(--muted)" opacity="0.5"/>
      </svg>
    </div>
  </div>
</section>

<section id="faq">
  <div class="section-head reveal">
    <div class="eyebrow">Questions</div>
    <h2>Before you join.</h2>
  </div>
  <div class="faq-row reveal">
    <div class="section-illus faq-illus" aria-hidden="true">
      <svg width="300" height="280" viewBox="0 0 300 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 20 C 150 6 210 10 246 34" stroke="var(--tea)" stroke-width="1.5" stroke-dasharray="5 7" opacity="0.4"/>
        <rect x="34" y="48" width="160" height="104" rx="20" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
        <path d="M74 151 l-6 27 30 -27 z" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
        <text x="114" y="122" text-anchor="middle" font-family="'Newsreader',serif" font-size="60" fill="var(--tea)">?</text>
        <rect x="168" y="160" width="104" height="64" rx="16" fill="var(--tea)"/>
        <path d="M232 223 l6 23 -26 -23 z" fill="var(--tea)"/>
        <circle cx="200" cy="192" r="4" fill="var(--black)"/>
        <circle cx="220" cy="192" r="4" fill="var(--black)"/>
        <circle cx="240" cy="192" r="4" fill="var(--black)"/>
        <circle cx="236" cy="64" r="26" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
        <path d="M236 52 a9 9 0 0 1 9 9 c0 7 -9 6 -9 13" stroke="var(--tea)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="236" cy="82" r="2" fill="var(--tea)"/>
        <path d="M52 210 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5-7 -7-2.5 7-2.5 z" fill="var(--tea)" opacity="0.6"/>
        <path d="M280 120 l2 5.5 5.5 2 -5.5 2 -2 5.5 -2-5.5 -5.5-2 5.5-2 z" fill="var(--tea)" opacity="0.5"/>
      </svg>
    </div>
    <div class="faq-section">
    <div class="faq-item" onclick="this.classList.toggle('open')">
      <div class="faq-question">Is NEXUS-IT free? <span class="faq-icon">+</span></div>
      <div class="faq-answer">Yes, completely free. No premium tier, no hidden costs.</div>
    </div>
    <div class="faq-item" onclick="this.classList.toggle('open')">
      <div class="faq-question">Do I need to be a student to join? <span class="faq-icon">+</span></div>
      <div class="faq-answer">No. Students, self-taught developers, and working professionals are all welcome.</div>
    </div>
    <div class="faq-item" onclick="this.classList.toggle('open')">
      <div class="faq-question">Who can see my projects? <span class="faq-icon">+</span></div>
      <div class="faq-answer">Your projects are public to anyone on the platform, so people can discover and give feedback on your work.</div>
    </div>
    <div class="faq-item" onclick="this.classList.toggle('open')">
      <div class="faq-question">Can I remove content I've posted? <span class="faq-icon">+</span></div>
      <div class="faq-answer">Yes, you can edit or delete your own projects, posts, and comments at any time.</div>
    </div>
    <div class="faq-item" onclick="this.classList.toggle('open')">
      <div class="faq-question">What if someone is harassing me? <span class="faq-icon">+</span></div>
      <div class="faq-answer">You can block any user and report content directly from their profile.</div>
    </div>
    </div>
  </div>
</section>

<section class="cta-section" id="join">
  <div class="eyebrow" style="justify-content:center;margin-bottom:20px;">Ready When You Are</div>
  <h2>Stop building in isolation.</h2>
  <p class="cta-sub">Join the builders already sharing their work, finding teammates, and shipping together.</p>
  <button class="btn btn-solid" id="bottom-cta-btn" style="padding:16px 34px;font-size:14px;" onclick="openModal('signup')">Join NEXUS-IT for free</button>
</section>

<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-col">
      <div class="logo" style="margin-bottom:14px;"><img src="/logo.png" alt="" style="width:24px;height:24px;object-fit:contain;vertical-align:middle;margin-right:8px;" />NEXUS-IT</div>
      <p style="color:var(--muted);font-size:13px;line-height:1.6;max-width:280px;">
        Where IT builders showcase projects, find collaborators, and get real feedback open to everyone, everywhere.
      </p>
      <div class="footer-social">
        <a href="#" aria-label="GitHub"><i class="ti ti-brand-github"></i></a>
        <a href="#" aria-label="X"><i class="ti ti-brand-x"></i></a>
        <a href="#" aria-label="Email"><i class="ti ti-mail"></i></a>
      </div>
    </div>
    <div class="footer-col">
      <h4>Product</h4>
      <a href="#problem">Why NEXUS-IT</a>
      <a href="#features">Features</a>
      <a href="#faq">FAQ</a>
    </div>
    <div class="footer-col">
      <h4>Legal</h4>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
    </div>
    <div class="footer-col">
      <h4>Contact</h4>
      <a href="mailto:support@nexus-it.dev">support@nexus-it.dev</a>
      <a href="#faq">Help &amp; FAQ</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>NEXUS-IT · Built by Mahnoor Ahsan for Strangers · © 2026</span>
    <span class="footer-made"><i class="ti ti-heart-filled"></i> Made for builders</span>
  </div>
</footer>

<!-- SIGNUP MODAL -->
<div class="modal-overlay" id="modal-overlay">
  <div class="modal" id="signup-modal">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <h3>Create your account</h3>
    <p class="modal-sub">Any working email works. Verification keeps this network real, not where you study.</p>
    <div class="field">
      <label>Email</label>
      <input type="email" placeholder="you@email.com" id="signup-email">
    </div>
    <div class="field">
      <label>Nickname</label>
      <input type="text" placeholder="e.g. mahnoor.dev" id="signup-nickname">
      <div class="field-hint">// this is what others see, never your email</div>
    </div>
    <div class="field">
      <label>Password</label>
      <div class="pass-wrap">
        <input type="password" placeholder="At least 8 characters" id="signup-password">
        <button type="button" class="pass-eye" onclick="togglePass('signup-password', this)" aria-label="Show password"><i class="ti ti-eye"></i></button>
      </div>
      <div class="field-hint">// stored securely, never shared</div>
    </div>
    <div class="form-error" id="signup-error" style="display:none;color:#e35d5d;font-size:13px;margin-top:8px;"></div>
    <button class="btn btn-solid" id="signup-submit-btn" onclick="goToVerify()" style="width:100%;margin-bottom:10px;">Create account</button>
    <button class="btn" id="github-signup-btn" style="margin-top:10px;width:100%;">Continue with GitHub</button>
    <button class="btn" id="google-signup-btn" style="margin-top:10px;width:100%;">Continue with Google</button>
    <div class="modal-switch">Already a member? <a href="#" id="switch-to-login">Log in</a></div>
  </div>

  <div class="modal" id="login-modal" style="display:none;">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <h3>Log in</h3>
    <p class="modal-sub">Welcome back. Enter your email and password.</p>
    <div class="field">
      <label>Email</label>
      <input type="email" placeholder="you@email.com" id="login-email">
    </div>
    <div class="field">
      <label>Password</label>
      <div class="pass-wrap">
        <input type="password" placeholder="Your password" id="login-password">
        <button type="button" class="pass-eye" onclick="togglePass('login-password', this)" aria-label="Show password"><i class="ti ti-eye"></i></button>
      </div>
    </div>
    <div class="forgot-row"><a href="#" id="forgot-link">Forgot password?</a></div>
    <div class="form-error" id="login-error" style="display:none;color:#e35d5d;font-size:13px;margin-top:8px;"></div>
    <button class="btn btn-solid" id="login-submit-btn" style="width:100%;margin-bottom:10px;">Log in</button>
    <button class="btn" id="github-login-btn" style="margin-top:10px;width:100%;">Continue with GitHub</button>
    <button class="btn" id="google-login-btn" style="margin-top:10px;width:100%;">Continue with Google</button>
    <div class="modal-switch">New here? <a href="#" id="switch-to-signup">Create an account</a></div>
  </div>

  <div class="modal" id="verify-modal" style="display:none;">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <div class="verify-icon"><i class="ti ti-mail"></i></div>
    <h3>Check your inbox</h3>
    <p class="modal-sub">We sent a 6-digit code to <strong id="verify-email-display" style="color:var(--tea);"></strong>. Enter it below to verify your account.</p>
    <div class="code-row">
      <input maxlength="1" class="code-digit">
      <input maxlength="1" class="code-digit">
      <input maxlength="1" class="code-digit">
      <input maxlength="1" class="code-digit">
      <input maxlength="1" class="code-digit">
      <input maxlength="1" class="code-digit">
    </div>
    <div class="form-error" id="verify-error" style="display:none;color:#e35d5d;font-size:13px;margin-top:8px;"></div>
    <button class="btn btn-solid" id="verify-submit-btn" onclick="verifySuccess()" style="width:100%;">Verify & continue</button>
    <div class="resend">Didn't get it? <a href="#" onclick="return false;" id="resend-link">Resend code</a></div>
  </div>

  <div class="modal" id="success-modal" style="display:none;text-align:center;">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <div class="verify-icon" style="margin:0 auto 20px;background:var(--tea);color:var(--black);"><i class="ti ti-check"></i></div>
    <h3>You're verified.</h3>
    <p class="modal-sub">Your account is ready. Next up: build your profile and post your first project.</p>
    <button class="btn btn-solid" onclick="continueToDashboard()">Continue</button>
  </div>

  <div class="modal" id="forgot-modal" style="display:none;">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <h3>Reset your password</h3>
    <p class="modal-sub">Enter your account email. We'll send a secure link to verify it's you.</p>
    <div class="field">
      <label>Email</label>
      <input type="email" placeholder="you@email.com" id="forgot-email">
    </div>
    <div class="form-error" id="forgot-error" style="display:none;color:#e35d5d;font-size:13px;margin-top:8px;"></div>
    <button class="btn btn-solid" id="forgot-submit-btn" style="width:100%;">Send reset link</button>
    <div class="modal-switch">Remembered it? <a href="#" id="back-to-login">Log in</a></div>
  </div>

  <div class="modal" id="reset-modal" style="display:none;">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <div class="verify-icon"><i class="ti ti-mail-forward"></i></div>
    <h3>Check your inbox</h3>
    <p class="modal-sub">We sent a secure reset link to <strong id="reset-email-display" style="color:var(--tea);"></strong>. Open it to choose a new password.</p>
    <p class="modal-sub" style="font-size:13px;">Tip: open the link on this device so you land right back here.</p>
    <div class="form-error" id="reset-error" style="display:none;color:#e35d5d;font-size:13px;margin-top:8px;"></div>
    <div class="resend">Didn't get it? <a href="#" onclick="return false;" id="reset-resend-link">Resend link</a></div>
  </div>
</div>

`;

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkSession() {
      // A recovery link that falls back to the site root carries its
      // tokens in the URL hash. Send it to the reset page instead of
      // auto-logging into the app.
      if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
        router.replace('/reset-password');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/projects');
        return;
      }
      setCheckingAuth(false);
    }
    checkSession();
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;

    let rafId;
    let bootTimeoutId;

      // ---------- Boot text typing effect ----------
  const bootMessages = ["INITIALIZING_IT_COLLECTIVE","CONNECTING_BUILDERS","NETWORK_ONLINE"];
  let bootIdx = 0;
  const bootEl = document.getElementById('boot-text');
  function typeBoot(){
    const msg = bootMessages[bootIdx % bootMessages.length];
    let i = 0;
    const iv = setInterval(()=>{
      requestAnimationFrame(() => {
        bootEl.textContent = msg.slice(0,i);
      });
      i++;
      if(i > msg.length){
        clearInterval(iv);
        setTimeout(()=>{ bootIdx++; typeBoot(); }, 2200);
      }
    }, 45);
  }
  typeBoot();
  //   // ---------- Custom cursor ----------
  // const cursor = document.getElementById('custom-cursor');
  // function moveCursor(e){
  //   cursor.style.left = e.clientX + 'px';
  //   cursor.style.top = e.clientY + 'px';
  // }
  // document.addEventListener('mousemove', moveCursor);

  // const hoverTargets = document.querySelectorAll('a, button, .feature-card, .problem-card');
  // hoverTargets.forEach((el) => {
  //   el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
  //   el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  // });

  // ---------- Magnetic hover ----------
  // const magneticEls = document.querySelectorAll('.btn, .btn-solid');
  // magneticEls.forEach((el) => {
  //   el.classList.add('magnetic');
  //   el.addEventListener('mousemove', (e) => {
  //     const rect = el.getBoundingClientRect();
  //     const x = e.clientX - rect.left - rect.width / 2;
  //     const y = e.clientY - rect.top - rect.height / 2;
  //     el.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
  //   });
  //   el.addEventListener('mouseleave', () => {
  //     el.style.transform = 'translate(0,0)';
  //   });
  // });
  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  }, {threshold:0.15});
  revealEls.forEach(el=>io.observe(el));

  // ---------- Modal logic ----------
  const overlay = document.getElementById('modal-overlay');
  const signupModal = document.getElementById('signup-modal');
  const loginModal = document.getElementById('login-modal');
  const verifyModal = document.getElementById('verify-modal');
  const successModal = document.getElementById('success-modal');
  const forgotModal = document.getElementById('forgot-modal');
  const resetModal = document.getElementById('reset-modal');

  function hideAllModals(){
    signupModal.style.display = 'none';
    loginModal.style.display = 'none';
    verifyModal.style.display = 'none';
    successModal.style.display = 'none';
    if (forgotModal) forgotModal.style.display = 'none';
    if (resetModal) resetModal.style.display = 'none';
  }

  function togglePass(id, btn){
    const inp = document.getElementById(id);
    if (!inp) return;
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    const ic = btn.querySelector('i');
    if (ic) ic.className = show ? 'ti ti-eye-off' : 'ti ti-eye';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  }

  function openModal(type){
    overlay.classList.add('open');
    hideAllModals();
    if(type === 'login'){
      loginModal.style.display = 'block';
    } else {
      signupModal.style.display = 'block';
      const heroEmail = document.getElementById('hero-email').value;
      if(heroEmail) document.getElementById('signup-email').value = heroEmail;
    }
  }
  function closeModal(){
    overlay.classList.remove('open');
  }
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeModal(); });

  document.getElementById('switch-to-login').addEventListener('click', (e)=>{
    e.preventDefault();
    openModal('login');
  });
  document.getElementById('switch-to-signup').addEventListener('click', (e)=>{
    e.preventDefault();
    openModal('signup');
  });

  let pendingEmail = '';

    function showError(elId, message){
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = message;
    el.style.color = '#e35d5d';
    el.style.display = 'block';
  }
  function hideError(elId){
    const el = document.getElementById(elId);
    if (!el) return;
    el.style.display = 'none';
  }
  function setBtnLoading(btnId, loading, defaultText){
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait…' : defaultText;
  }

  async function goToVerify(){
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const nickname = document.getElementById('signup-nickname').value.trim();
    hideError('signup-error');

    if(!email || !password || !nickname){
      showError('signup-error', 'Please fill in email, password, and a nickname.');
      return;
    }
    if(password.length < 8){
      showError('signup-error', 'Password must be at least 8 characters.');
      return;
    }

    setBtnLoading('signup-submit-btn', true, 'Create account');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    });
    setBtnLoading('signup-submit-btn', false, 'Create account');

    if(error){
      showError('signup-error', error.message);
      return;
    }

      pendingEmail = email;
    const verifyDisplay = document.getElementById('verify-email-display');
    if (verifyDisplay) verifyDisplay.textContent = email;
    hideAllModals();
    if (verifyModal) verifyModal.style.display = 'block';
    const firstDigit = document.querySelector('.code-digit');
    if (firstDigit) firstDigit.focus();
  }

  async function verifySuccess(){
    hideError('verify-error');
    const digits = Array.from(document.querySelectorAll('.code-digit')).map(d => d.value).join('');

    if(digits.length !== 6){
      showError('verify-error', 'Enter all 6 digits from your email.');
      return;
    }

    setBtnLoading('verify-submit-btn', true, 'Verify & continue');
    const { data, error } = await supabase.auth.verifyOtp({
      email: pendingEmail,
      token: digits,
      type: 'signup',
    });
    setBtnLoading('verify-submit-btn', false, 'Verify & continue');

    if(error){
      showError('verify-error', error.message);
      return;
    }

    if (verifyModal) verifyModal.style.display = 'none';
    if (successModal) successModal.style.display = 'block';
    // localStorage.setItem('nexus-returning-user', 'true');
  }

  async function resendCode(){
    if(!pendingEmail) return;
    hideError('verify-error');
    const { error } = await supabase.auth.resend({ type: 'signup', email: pendingEmail });
    if(error){
      showError('verify-error', error.message);
      } else {
      showError('verify-error', 'Code resent. Check your inbox.');
      const verifyErrorEl = document.getElementById('verify-error');
      if (verifyErrorEl) verifyErrorEl.style.color = 'var(--tea, #A3752F)';
    }
  }

  async function handleGitHubLogin(){
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${window.location.origin}/projects` }
  });
  if(error){
    console.error('GitHub login error:', error);
  }
}
  async function handleGoogleLogin(){
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/projects` }
  });
  if(error){
    console.error('Google login error:', error);
  }
}
  async function handleLogin(){
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    hideError('login-error');

    if(!email || !password){
      showError('login-error', 'Please enter both your email and password.');
      return;
    }

    setBtnLoading('login-submit-btn', true, 'Log in');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBtnLoading('login-submit-btn', false, 'Log in');

    if(error){
      if(error.message.toLowerCase().includes('email not confirmed')){
        showError('login-error', 'Please verify your email first. Check your inbox for the code.');
      } else {
        showError('login-error', error.message);
      }
      return;
    }

        // localStorage.setItem('nexus-returning-user', 'true');
    closeModal();
    router.push('/projects');
  }

    function continueToDashboard(){
    closeModal();
    router.push('/projects');
  }

  // ---------- Forgot password (email code + new password) ----------
  let resetEmail = '';

  function openForgot(){
    hideAllModals();
    const loginEmail = document.getElementById('login-email').value.trim();
    if (loginEmail) document.getElementById('forgot-email').value = loginEmail;
    hideError('forgot-error');
    if (forgotModal) forgotModal.style.display = 'block';
  }

  async function sendResetLink(){
    const email = document.getElementById('forgot-email').value.trim();
    hideError('forgot-error');
    if(!email){
      showError('forgot-error', 'Enter your account email.');
      return;
    }
    setBtnLoading('forgot-submit-btn', true, 'Send reset link');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBtnLoading('forgot-submit-btn', false, 'Send reset link');
    if(error){
      showError('forgot-error', error.message);
      return;
    }
    resetEmail = email;
    const disp = document.getElementById('reset-email-display');
    if (disp) disp.textContent = email;
    hideAllModals();
    hideError('reset-error');
    if (resetModal) resetModal.style.display = 'block';
  }

  async function resendResetLink(){
    if(!resetEmail) return;
    hideError('reset-error');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if(error){
      showError('reset-error', error.message);
    } else {
      showError('reset-error', 'Link resent. Check your inbox.');
      const el = document.getElementById('reset-error');
      if (el) el.style.color = 'var(--tea, #A3752F)';
    }
  }


  function toggleMobileNav() {
    const panel = document.getElementById('mobile-nav-panel');
    if (panel) panel.classList.toggle('open');
  }

  function closeMobileNav() {
    const panel = document.getElementById('mobile-nav-panel');
    if (panel) panel.classList.remove('open');
  }

  window.openModal = openModal;
  window.closeModal = closeModal;
  window.goToVerify = goToVerify;
  window.verifySuccess = verifySuccess;
  window.resendCode = resendCode;
  window.continueToDashboard = continueToDashboard;
  window.toggleMobileNav = toggleMobileNav;
  window.closeMobileNav = closeMobileNav;
  window.togglePass = togglePass;
  document.getElementById('resend-link').addEventListener('click', (e) => { e.preventDefault(); resendCode(); });
  document.getElementById('forgot-link')?.addEventListener('click', (e) => { e.preventDefault(); openForgot(); });
  document.getElementById('back-to-login')?.addEventListener('click', (e) => { e.preventDefault(); openModal('login'); });
  document.getElementById('forgot-submit-btn')?.addEventListener('click', sendResetLink);
  document.getElementById('reset-resend-link')?.addEventListener('click', (e) => { e.preventDefault(); resendResetLink(); });
  document.getElementById('login-submit-btn').addEventListener('click', handleLogin);
  document.getElementById('github-signup-btn').addEventListener('click', handleGitHubLogin);
  document.getElementById('github-login-btn').addEventListener('click', handleGitHubLogin);
  document.getElementById('google-signup-btn').addEventListener('click', handleGoogleLogin);
  document.getElementById('google-login-btn').addEventListener('click', handleGoogleLogin); 

  const digits = document.querySelectorAll('.code-digit');
  digits.forEach((d,idx)=>{
    d.addEventListener('input', ()=>{
      if(d.value && idx<digits.length-1) digits[idx+1].focus();
    });
    d.addEventListener('keydown', (e)=>{
      if(e.key==='Backspace' && !d.value && idx>0) digits[idx-1].focus();
    });
  });



      return () => {};
  }, [checkingAuth]);

    if (checkingAuth) {
    return null;
  }

  return (
    <>
      <Head>
        <title>NEXUS-IT · Where Builders Find Each Other</title>
        <meta name="description" content="A verified space for IT builders to showcase projects, find collaborators, and get an AI advisor's help. Open to everyone, not just one campus." />
      </Head>
      <div className="force-light" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
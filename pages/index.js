import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const bodyHtml = `
`.replace('${new Date().getFullYear()}', '') + `
<nav>
  <div class="logo"><span class="dot"></span>NEXUS-IT</div>
  <div class="nav-links">
    <a class="link" href="#problem">Why</a>
    <a class="link" href="#features">What you get</a>
    <a class="link" href="#how">How it works</a>
    <button class="btn" onclick="openModal('login')">Log in</button>
    <button class="btn btn-solid" onclick="openModal('signup')">Create account</button>
  </div>
</nav>

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

    <div class="hero-mockup glass-card" style="position:relative;z-index:1;">
    <div class="hero-mockup-bar"><span></span><span></span><span></span></div>
    <div class="hero-mockup-body">
      <div class="hero-mockup-card">
        <span class="hero-mockup-badge">Top ranked</span>
        <div class="hero-mockup-title">Weather dashboard</div>
        <div class="hero-mockup-meta">by Aisha Rahman · 24 likes · 9 comments</div>
      </div>
      <div class="hero-mockup-card">
        <div class="hero-mockup-title">Real-time chat app</div>
        <div class="hero-mockup-meta">by Kwame Owusu · React, Node.js</div>
      </div>
    </div>
  </div>

  <div class="scroll-cue"><div class="bar"></div>SCROLL</div>
</section>

<div class="trust-bar">
  <span>🔒 Your data stays private</span>
  <span>✅ Email-verified accounts</span>
  <span>🌍 Open to builders everywhere</span>
  <span>🆓 Free, always</span>
</div>

<section id="problem">
  <div class="section-head reveal">
    <div class="eyebrow">The Problem</div>
    <h2>Great projects, zero visibility.</h2>
    <p>Every semester, hundreds of solid mini-projects get built, graded, and forgotten. Nobody outside the classroom ever sees them.</p>
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
      <div class="feature-tag">Showcase</div>
      <h3>Project profiles</h3>
      <p>Post your mini-projects and reports with tech stack, demo links, and files and keep getting feedback long after submission.</p>
    </div>
    <div class="feature-card">
      <div class="feature-tag">Connect</div>
      <h3>Direct messaging</h3>
      <p>Message peers directly, form project teams, and keep the conversation attached to the work not lost in a group chat.</p>
    </div>
    <div class="feature-card">
      <div class="feature-tag">Discuss</div>
      <h3>Threaded feedback</h3>
      <p>Every project has its own discussion thread, so critique and ideas stay exactly where the work lives.</p>
    </div>
    <div class="feature-card">
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
  <div class="terminal reveal">
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
</section>

<section id="faq">
  <div class="section-head reveal">
    <div class="eyebrow">Questions</div>
    <h2>Before you join.</h2>
  </div>
  <div class="faq-section reveal">
    <div class="faq-item" onclick="this.classList.toggle('open')">
      <div class="faq-question">Is NEXUS-IT free? <span class="faq-icon">+</span></div>
      <div class="faq-answer">Yes, completely free — no premium tier, no hidden costs.</div>
    </div>
    <div class="faq-item" onclick="this.classList.toggle('open')">
      <div class="faq-question">Do I need to be a student to join? <span class="faq-icon">+</span></div>
      <div class="faq-answer">No — students, self-taught developers, and working professionals are all welcome.</div>
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
</section>
  <div class="eyebrow" style="justify-content:center;margin-bottom:20px;">Ready When You Are</div>
  <h2>Stop building in isolation.</h2>
  <button class="btn btn-solid" id="bottom-cta-btn" style="padding:16px 34px;font-size:14px;" onclick="openModal('signup')">Join NEXUS-IT — it's free</button>
</section>

<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-col">
      <div class="logo" style="margin-bottom:14px;"><span class="dot"></span>NEXUS-IT</div>
      <p style="color:var(--muted);font-size:13px;line-height:1.6;max-width:280px;">
        Where IT builders showcase projects, find collaborators, and get real feedback open to everyone, everywhere.
      </p>
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
  </div>
  <div class="footer-bottom">
      NEXUS-IT — Built by Mahnoor Ahsan for Strangers · © 2026
  </div>
</footer>

<!-- SIGNUP MODAL -->
<div class="modal-overlay" id="modal-overlay">
  <div class="modal" id="signup-modal">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <h3>Create your account</h3>
    <p class="modal-sub">Any working email — that's what keeps this network verified, not where you study.</p>
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
      <input type="password" placeholder="At least 8 characters" id="signup-password">
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
    <p class="modal-sub">Welcome back — enter your email and password.</p>
    <div class="field">
      <label>Email</label>
      <input type="email" placeholder="you@email.com" id="login-email">
    </div>
    <div class="field">
      <label>Password</label>
      <input type="password" placeholder="Your password" id="login-password">
    </div>
    <div class="form-error" id="login-error" style="display:none;color:#e35d5d;font-size:13px;margin-top:8px;"></div>
    <button class="btn btn-solid" id="login-submit-btn" style="width:100%;margin-bottom:10px;">Log in</button>
    <button class="btn" id="github-login-btn" style="margin-top:10px;width:100%;">Continue with GitHub</button>
    <button class="btn" id="google-login-btn" style="margin-top:10px;width:100%;">Continue with Google</button>
    <div class="modal-switch">New here? <a href="#" id="switch-to-signup">Create an account</a></div>
  </div>

  <div class="modal" id="verify-modal" style="display:none;">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <div class="verify-icon">@</div>
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
    <div class="verify-icon" style="margin:0 auto 20px;background:var(--tea);color:var(--black);">✓</div>
    <h3>You're verified.</h3>
    <p class="modal-sub">Your account is ready. Next up: build your profile and post your first project.</p>
    <button class="btn btn-solid" onclick="continueToDashboard()">Continue</button>
  </div>
</div>

`;

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkSession() {
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
    bootEl.textContent = '';
    const iv = setInterval(()=>{
      bootEl.textContent = msg.slice(0,i);
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

  function hideAllModals(){
    signupModal.style.display = 'none';
    loginModal.style.display = 'none';
    verifyModal.style.display = 'none';
    successModal.style.display = 'none';
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
      showError('verify-error', 'Code resent — check your inbox.');
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

  window.openModal = openModal;
  window.closeModal = closeModal;
  window.goToVerify = goToVerify;
  window.verifySuccess = verifySuccess;
  window.resendCode = resendCode;
  window.continueToDashboard = continueToDashboard;
  document.getElementById('resend-link').addEventListener('click', (e) => { e.preventDefault(); resendCode(); });
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
        <title>NEXUS-IT — Where Builders Find Each Other</title>
        <meta name="description" content="A verified space for IT builders to showcase projects, find collaborators, and get an AI advisor's help — open to everyone, not just one campus." />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
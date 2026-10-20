/* ═══════════════════════════════════════════════════════════════
   EKLAVYA SRIVASTAVA — Portfolio JS
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Utility ─────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp  = (a, b, t) => a + (b - a) * t;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── 1. Scroll Progress Bar ──────────────────────────────────── */
(function initScrollProgress() {
  const bar = $('.scroll-progress');
  if (!bar) return;
  const update = () => {
    const max  = document.documentElement.scrollHeight - window.innerHeight;
    const pct  = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${pct})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ─── 2. Custom Cursor ─────────────────────────────────────────── */
(function initCursor() {
  if (window.matchMedia('(max-width: 720px)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let rafId = null;

  const tick = () => {
    rx = lerp(rx, mx, 0.14);
    ry = lerp(ry, my, 0.14);
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(tick);
  };

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(tick);
  }, { passive: true });

  // hover state
  const setHover = (on) => document.body.classList.toggle('cursor-hover', on);
  const setActive = (on) => document.body.classList.toggle('cursor-active', on);

  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a, button, [role="button"], .tilt-card, .skill-pill, .contact-card');
    setHover(!!el);
  });
  document.addEventListener('mousedown', () => setActive(true));
  document.addEventListener('mouseup',   () => setActive(false));
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1'; ring.style.opacity = '1';
  });
})();

/* ─── 3. Navigation ────────────────────────────────────────────── */
(function initNav() {
  const nav   = $('.nav');
  const burger = $('.nav-hamburger');
  const menu  = $('#nav-menu');
  if (!nav || !burger || !menu) return;

  // scrolled state
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // hamburger
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  // close on link click
  $$('.nav-link', menu).forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // active nav link on scroll
  const sections = $$('section[id]');
  const links    = $$('.nav-link');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => observer.observe(s));
})();

/* ─── 4. Hero Particle Canvas ─────────────────────────────────── */
(function initParticles() {
  const canvas = $('.hero-canvas');
  if (!canvas || prefersReducedMotion()) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], raf;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };

  const rand = (lo, hi) => lo + Math.random() * (hi - lo);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = rand(0, W);
      this.y  = rand(0, H);
      this.r  = rand(0.5, 2);
      this.vx = rand(-0.3, 0.3);
      this.vy = rand(-0.5, -0.1);
      this.life = rand(0.3, 1);
      this.fade = rand(0.003, 0.008);
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.fade;
      if (this.life <= 0 || this.y < -4) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,90,0,${this.life * 0.5})`;
      ctx.fill();
    }
  }

  const init = () => {
    resize();
    particles = Array.from({ length: 80 }, () => new Particle());
  };

  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.step(); p.draw(); });
    raf = requestAnimationFrame(loop);
  };

  // pause off-screen
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) loop(); }
    else { cancelAnimationFrame(raf); raf = null; }
  });

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else loop();
  });

  init();
  io.observe(canvas);
  loop();
})();

/* ─── 5. Typing Effect ─────────────────────────────────────────── */
(function initTyping() {
  const el = $('#typed-role');
  if (!el) return;

  const roles = [
    'AI/ML Enthusiast',
    'Hackathon Winner',
    'Full-Stack Developer',
    'Team Leader',
    'Problem Solver',
  ];

  let ri = 0, ci = 0, deleting = false;
  const typeSpeed   = 60;
  const deleteSpeed = 35;
  const pauseEnd    = 1800;
  const pauseStart  = 400;

  const tick = () => {
    const word = roles[ri];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) {
        deleting = true;
        setTimeout(tick, pauseEnd);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
        setTimeout(tick, pauseStart);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  };

  if (prefersReducedMotion()) {
    el.textContent = roles[0];
  } else {
    setTimeout(tick, 900);
  }
})();

/* ─── 6. Scroll Reveal ─────────────────────────────────────────── */
(function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => {
    if (prefersReducedMotion()) { el.classList.add('in'); return; }
    io.observe(el);
  });
})();

/* ─── 7. Stat Counter Animation ────────────────────────────────── */
(function initCounters() {
  const counters = $$('.stat-number[data-target]');
  if (!counters.length) return;

  const run = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const dur    = 1200;
    const start  = performance.now();
    const step   = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.round(ease * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (prefersReducedMotion()) {
          e.target.textContent = e.target.dataset.target;
        } else {
          run(e.target);
        }
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();

/* ─── 8. 3D Card Tilt ──────────────────────────────────────────── */
(function initTilt() {
  if (prefersReducedMotion()) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  $$('.tilt-card').forEach(card => {
    const inner = card.querySelector('.project-card-inner');
    const glow  = card.querySelector('.project-card-glow');
    let raf = null;
    let tX = 0, tY = 0, cX = 0, cY = 0;

    const tick = () => {
      cX = lerp(cX, tX, 0.1);
      cY = lerp(cY, tY, 0.1);
      card.style.transform = `perspective(800px) rotateY(${cX}deg) rotateX(${cY}deg)`;
      if (Math.abs(tX - cX) > 0.02 || Math.abs(tY - cY) > 0.02) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const px   = (e.clientX - rect.left) / rect.width;
      const py   = (e.clientY - rect.top)  / rect.height;
      tX =  (px - 0.5) * 12; // max ±6deg
      tY = -(py - 0.5) * 10;

      // glare position
      if (glow) {
        glow.style.setProperty('--mx', (px * 100) + '%');
        glow.style.setProperty('--my', (py * 100) + '%');
      }

      if (!raf) raf = requestAnimationFrame(tick);
    });

    card.addEventListener('mouseleave', () => {
      tX = 0; tY = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  });
})();

/* ─── 9. Parallax (hero accents + sections bg) ─────────────────── */
(function initParallax() {
  if (prefersReducedMotion()) return;

  const a1 = $('.hero-accent-1');
  const a2 = $('.hero-accent-2');
  const grid = $('.hero-grid');

  let lastY = 0, raf = null;
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) loop(); }
    else { cancelAnimationFrame(raf); raf = null; }
  });

  const hero = $('.hero');
  if (hero) io.observe(hero);

  const loop = () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) > 0.5) {
      lastY = y;
      const p = y * 0.25;
      if (a1) a1.style.transform = `translateY(${p * 0.6}px)`;
      if (a2) a2.style.transform = `translateY(${p * 0.4}px)`;
      if (grid) grid.style.transform = `translateY(${p * 0.3}px)`;
    }
    raf = requestAnimationFrame(loop);
  };
})();

/* ─── 10. Interactive Hold Moment ──────────────────────────────── */
(function initHoldMoment() {
  const btn      = $('#moment-btn');
  const reveal   = $('#moment-reveal');
  const ringFill = $('.moment-ring-fill');
  if (!btn || !reveal || !ringFill) return;

  const CIRCUMFERENCE = 213.6;
  const HOLD_MS       = 1200;

  let holdStart = null, progress = 0, raf = null, completed = false;

  const setProgress = (p) => {
    progress = clamp(p, 0, 1);
    ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
    btn.setAttribute('aria-pressed', progress >= 1);
  };

  const tick = (now) => {
    if (holdStart === null) return;
    const elapsed = now - holdStart;
    const p = elapsed / HOLD_MS;
    setProgress(p);
    if (p >= 1) {
      complete();
    } else {
      raf = requestAnimationFrame(tick);
    }
  };

  const release = () => {
    holdStart = null;
    cancelAnimationFrame(raf);
    raf = null;
    if (!completed) {
      // ease back
      const ease = () => {
        setProgress(progress - 0.04);
        if (progress > 0) requestAnimationFrame(ease);
      };
      requestAnimationFrame(ease);
    }
  };

  const complete = () => {
    completed = true;
    setProgress(1);
    reveal.classList.add('visible');
    btn.setAttribute('aria-pressed', 'true');
    // add a brief flash glow to the section
    const section = btn.closest('.interactive-moment');
    if (section) {
      section.style.borderColor = 'rgba(255,90,0,0.5)';
      section.style.boxShadow   = '0 0 40px rgba(255,90,0,0.12)';
    }
  };

  if (prefersReducedMotion()) {
    complete();
    return;
  }

  btn.addEventListener('mousedown', () => {
    if (completed) return;
    holdStart = performance.now();
    raf = requestAnimationFrame(tick);
  });
  btn.addEventListener('mouseup',    release);
  btn.addEventListener('mouseleave', release);
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (completed) return;
    holdStart = performance.now();
    raf = requestAnimationFrame(tick);
  }, { passive: false });
  btn.addEventListener('touchend', release);
})();

/* ─── 11. Contact Form (JS-only success state) ─────────────────── */
(function initForm() {
  const form    = $('#contact-form');
  const success = $('#form-success');
  if (!form || !success) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#form-name', form).value.trim();
    if (!name) { $('#form-name', form).focus(); return; }
    success.textContent = `Thanks, ${name}! I'll get back to you soon.`;
    form.reset();
    // clear after 6s
    setTimeout(() => { success.textContent = ''; }, 6000);
  });
})();

/* ─── 12. Smooth Scroll for anchor links ──────────────────────── */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72');
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
})();

/* ─── 13. Pause animations on hidden tab ─────────────────────── */
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('paused', document.hidden);
});

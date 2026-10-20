/* ═══════════════════════════════════════════════════════════════
   EKLAVYA SRIVASTAVA — Portfolio High-Performance Engine
   Zero Jank · GPU-Accelerated · Smooth & Responsive
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Fast Selectors & Helpers ───────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp  = (a, b, t) => a + (b - a) * t;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── 1. Ultra-Smooth Scroll Progress Bar ─────────────────────── */
(function initScrollProgress() {
  const bar = $('.scroll-progress');
  if (!bar) return;

  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${pct})`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();

/* ─── 2. GPU-Accelerated Custom Cursor (Zero Lag) ─────────────── */
(function initCursor() {
  if (window.matchMedia('(max-width: 720px)').matches ||
      window.matchMedia('(pointer: coarse)').matches ||
      prefersReducedMotion()) return;

  const dot  = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let rafId = null;

  const tick = () => {
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);

    // Using translate3d for hardware-accelerated compositor positioning
    dot.style.transform  = `translate3d(${mx}px, ${my}px, 0) translate3d(-50%, -50%, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate3d(-50%, -50%, 0)`;

    rafId = requestAnimationFrame(tick);
  };

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(tick);
  }, { passive: true });

  // Hover states
  const setHover = (on) => document.body.classList.toggle('cursor-hover', on);
  const setActive = (on) => document.body.classList.toggle('cursor-active', on);

  document.addEventListener('mouseover', e => {
    const target = e.target.closest('a, button, [role="button"], .tilt-card, .skill-pill, .contact-card, .about-card-inner');
    setHover(!!target);
  }, { passive: true });

  document.addEventListener('mousedown', () => setActive(true), { passive: true });
  document.addEventListener('mouseup',   () => setActive(false), { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  }, { passive: true });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  }, { passive: true });
})();

/* ─── 3. Navigation Controller ────────────────────────────────── */
(function initNav() {
  const nav    = $('.nav');
  const burger = $('.nav-hamburger');
  const menu   = $('#nav-menu');
  if (!nav || !burger || !menu) return;

  let lastY = 0, ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 35);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  // Mobile menu toggle
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  $$('.nav-link', menu).forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Active section observer
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

/* ─── 4. Lightweight Particle Background ──────────────────────── */
(function initParticles() {
  const canvas = $('.hero-canvas');
  if (!canvas || prefersReducedMotion()) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let W, H, particles = [], raf;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };

  const rand = (lo, hi) => lo + Math.random() * (hi - lo);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = rand(0, W || 800);
      this.y  = rand(0, H || 600);
      this.r  = rand(0.7, 1.8);
      this.vx = rand(-0.25, 0.25);
      this.vy = rand(-0.4, -0.1);
      this.life = rand(0.3, 0.9);
      this.fade = rand(0.003, 0.007);
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.fade;
      if (this.life <= 0 || this.y < -5) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,90,0,${this.life * 0.45})`;
      ctx.fill();
    }
  }

  const init = () => {
    resize();
    particles = Array.from({ length: 55 }, () => new Particle());
  };

  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      particles[i].step();
      particles[i].draw();
    }
    raf = requestAnimationFrame(loop);
  };

  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) loop(); }
    else { cancelAnimationFrame(raf); raf = null; }
  });

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) loop();
  });

  init();
  io.observe(canvas);
  loop();
})();

/* ─── 5. Dynamic Typing Effect ────────────────────────────────── */
(function initTyping() {
  const el = $('#typed-role');
  if (!el) return;

  const roles = [
    'AI/ML Specialist',
    'HackGrid\'26 Winner',
    'Full-Stack Developer',
    'Team Leader',
    'Rapid Prototyper',
    'VIT Vellore Undergrad'
  ];

  let ri = 0, ci = 0, deleting = false;
  const typeSpeed   = 55;
  const deleteSpeed = 30;
  const pauseEnd    = 1900;
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
    setTimeout(tick, 800);
  }
})();

/* ─── 6. Performant Scroll Reveals ────────────────────────────── */
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
  }, { threshold: 0.1 });

  els.forEach(el => {
    if (prefersReducedMotion()) { el.classList.add('in'); return; }
    io.observe(el);
  });
})();

/* ─── 7. Stat Counter Animation ───────────────────────────────── */
(function initCounters() {
  const counters = $$('.stat-number[data-target]');
  if (!counters.length) return;

  const run = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const dur    = 1100;
    const start  = performance.now();

    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
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
  }, { threshold: 0.4 });

  counters.forEach(c => io.observe(c));
})();

/* ─── 8. High-Performance 3D Card Tilt (No Reflows) ───────────── */
(function initTilt() {
  if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;

  $$('.tilt-card').forEach(card => {
    const glow = card.querySelector('.project-card-glow');
    let rect = null;
    let tX = 0, tY = 0, cX = 0, cY = 0;
    let raf = null;

    const tick = () => {
      cX = lerp(cX, tX, 0.12);
      cY = lerp(cY, tY, 0.12);

      card.style.transform = `perspective(900px) rotateX(${cY}deg) rotateY(${cX}deg) translateZ(0)`;

      if (Math.abs(tX - cX) > 0.02 || Math.abs(tY - cY) > 0.02) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };

    // Cache rect on enter so we avoid getBoundingClientRect() forced reflow on mousemove
    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
    }, { passive: true });

    card.addEventListener('mousemove', e => {
      if (!rect) rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top)  / rect.height;

      tX =  (px - 0.5) * 10;
      tY = -(py - 0.5) * 8;

      if (glow) {
        glow.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        glow.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      }

      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      tX = 0; tY = 0;
      rect = null;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  });
})();

/* ─── 9. Parallax Depth (GPU Compositing) ─────────────────────── */
(function initParallax() {
  if (prefersReducedMotion()) return;

  const a1   = $('.hero-accent-1');
  const a2   = $('.hero-accent-2');
  const grid = $('.hero-grid');
  const hero = $('.hero');

  let lastY = -1;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    if (y !== lastY && y < window.innerHeight) {
      lastY = y;
      const p = y * 0.22;
      if (a1)   a1.style.transform   = `translate3d(0, ${p * 0.5}px, 0)`;
      if (a2)   a2.style.transform   = `translate3d(0, ${p * 0.35}px, 0)`;
      if (grid) grid.style.transform = `translate3d(0, ${p * 0.25}px, 0)`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();

/* ─── 10. Interactive Hold Moment ──────────────────────────────── */
(function initHoldMoment() {
  const btn      = $('#moment-btn');
  const reveal   = $('#moment-reveal');
  const ringFill = $('.moment-ring-fill');
  if (!btn || !reveal || !ringFill) return;

  const CIRCUMFERENCE = 213.6;
  const HOLD_MS       = 1100;

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
    if (p >= 1) complete();
    else raf = requestAnimationFrame(tick);
  };

  const release = () => {
    holdStart = null;
    cancelAnimationFrame(raf);
    raf = null;
    if (!completed) {
      const ease = () => {
        setProgress(progress - 0.05);
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
    const section = btn.closest('.interactive-moment');
    if (section) {
      section.style.borderColor = 'rgba(255,90,0,0.55)';
      section.style.boxShadow   = '0 0 50px rgba(255,90,0,0.18)';
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
    if (completed) return;
    holdStart = performance.now();
    raf = requestAnimationFrame(tick);
  }, { passive: true });
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
    success.textContent = `Thanks, ${name}! Your message is received. I'll get back to you soon.`;
    form.reset();
    setTimeout(() => { success.textContent = ''; }, 6000);
  });
})();

/* ─── 12. Instant Smooth Scroll for In-Page Anchor Links ───────── */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const targetId = a.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '74');
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
})();

/* ─── 13. Visibility Pause Handling ───────────────────────────── */
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('paused', document.hidden);
});

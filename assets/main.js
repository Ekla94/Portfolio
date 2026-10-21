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

  $$('a', menu).forEach(link => {
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

/* ─── 4. Neural Network / Data Constellation Engine ───────────── */
(function initNeuralConstellation() {
  const canvas = $('#neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let W = 0, H = 0;
  let dpr = 1;
  let nodes = [];
  let rafId = null;

  // Track smoothed scroll position for fluid parallax with no jarring steps
  let targetScrollY = window.scrollY;
  let currentScrollY = window.scrollY;

  // Mouse interaction state
  const mouse = {
    x: -9999,
    y: -9999,
    active: false,
    radius: 170
  };

  // Node Color Schemes (Refined professional solar amber palette)
  const COLOR_PALETTES = [
    { r: 249, g: 115, b: 22  }, // Refined Solar Amber (#f97316)
    { r: 251, g: 146, b: 60  }, // Warm Light Amber (#fb923c)
    { r: 245, g: 158, b: 11  }, // Warm Champagne Gold (#f59e0b)
    { r: 56,  g: 189, b: 248 }  // Soft Technical Sky Blue (#38bdf8)
  ];

  class Node {
    constructor(w, h, isInit = false) {
      this.reset(w, h, isInit);
    }

    reset(w, h, isInit = false) {
      this.x = Math.random() * w;
      this.baseY = isInit ? Math.random() * h : (Math.random() < 0.5 ? -15 : h + 15);

      // 3D Depth / Z-layer: 0.25 (distant, subtle, slow) to 1.15 (foreground, bright, fast)
      this.z = 0.25 + Math.random() * 0.9;

      // Radius scaled by depth
      this.r = (0.85 + Math.random() * 1.5) * this.z;

      // Natural Brownian velocity
      const speed = (0.2 + Math.random() * 0.35) * (0.8 + this.z * 0.4);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      // Color selection (balanced neon distribution)
      const randType = Math.random();
      if (randType < 0.52) {
        this.color = COLOR_PALETTES[0]; // Neon orange
      } else if (randType < 0.76) {
        this.color = COLOR_PALETTES[1]; // Electric blue
      } else if (randType < 0.92) {
        this.color = COLOR_PALETTES[2]; // Deep purple
      } else {
        this.color = COLOR_PALETTES[3]; // Amber
      }

      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.03;

      this.dispX = 0;
      this.dispY = 0;
      this.renderX = this.x;
      this.renderY = this.baseY;
    }

    update(w, h, scrollY) {
      this.x += this.vx;
      this.baseY += this.vy;

      // Horizontal edge wrap
      if (this.x < -30) this.x = w + 30;
      else if (this.x > w + 30) this.x = -30;

      // Scroll Parallax:
      // Deeper nodes move upwards faster when user scrolls down
      const parallaxFactor = 0.36;
      const rawY = this.baseY - (scrollY * this.z * parallaxFactor);

      // Modulo wrap vertically across screen height for infinite scrolling
      let py = rawY % h;
      if (py < 0) py += h;
      this.calcY = py;

      // Interactive mouse repulsion
      if (mouse.active) {
        const dx = (this.x + this.dispX) - mouse.x;
        const dy = (this.calcY + this.dispY) - mouse.y;
        const distSq = dx * dx + dy * dy;
        const maxDist = mouse.radius * (0.7 + this.z * 0.4);

        if (distSq < maxDist * maxDist && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / maxDist) * 34 * this.z;
          const targetX = (dx / dist) * force;
          const targetY = (dy / dist) * force;
          this.dispX += (targetX - this.dispX) * 0.14;
          this.dispY += (targetY - this.dispY) * 0.14;
        } else {
          this.dispX *= 0.88;
          this.dispY *= 0.88;
        }
      } else {
        this.dispX *= 0.88;
        this.dispY *= 0.88;
      }

      this.renderX = this.x + this.dispX;
      this.renderY = this.calcY + this.dispY;

      this.pulsePhase += this.pulseSpeed;
    }

    draw(ctx) {
      const pulse = 0.82 + 0.18 * Math.sin(this.pulsePhase);
      const alpha = (0.35 + 0.55 * (this.z / 1.15)) * pulse;
      const c = this.color;

      // Core glowing node
      ctx.beginPath();
      ctx.arc(this.renderX, this.renderY, this.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
      ctx.fill();

      // Atmospheric halo on prominent foreground nodes
      if (this.z > 0.72) {
        ctx.beginPath();
        ctx.arc(this.renderX, this.renderY, this.r * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha * 0.16})`;
        ctx.fill();
      }
    }
  }

  const resize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Dynamic node count scaled to viewport size (balanced for 60fps)
    const targetCount = Math.min(170, Math.max(65, Math.floor((W * H) / 9500)));

    if (nodes.length !== targetCount) {
      nodes = Array.from({ length: targetCount }, () => new Node(W, H, true));
    }
  };

  // Passive event listeners for fluid responsiveness
  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  }, { passive: true });

  // Touch support for phone/tablet interaction
  const onTouch = (e) => {
    if (e.touches && e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  };
  window.addEventListener('touchstart', onTouch, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('touchend', () => {
    setTimeout(() => { mouse.active = false; }, 600);
  }, { passive: true });

  window.addEventListener('resize', resize, { passive: true });

  // Main Render Loop
  const render = () => {
    currentScrollY = lerp(currentScrollY, targetScrollY, 0.12);

    ctx.clearRect(0, 0, W, H);

    // 1. Update positions with parallax & physics
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].update(W, H, currentScrollY);
    }

    // 2. Draw Neural Network connections
    const maxDist = Math.min(135, Math.max(90, W * 0.088));
    const maxDistSq = maxDist * maxDist;

    ctx.lineWidth = 0.85;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.renderX - b.renderX;
        const dy = a.renderY - b.renderY;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const proximity = 1 - dist / maxDist;
          const depthFactor = (a.z + b.z) * 0.5;
          const alpha = proximity * 0.35 * depthFactor;

          if (alpha > 0.015) {
            ctx.beginPath();
            ctx.moveTo(a.renderX, a.renderY);
            ctx.lineTo(b.renderX, b.renderY);

            const mr = Math.round((a.color.r + b.color.r) * 0.5);
            const mg = Math.round((a.color.g + b.color.g) * 0.5);
            const mb = Math.round((a.color.b + b.color.b) * 0.5);

            ctx.strokeStyle = `rgba(${mr}, ${mg}, ${mb}, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // Synapse connection to user mouse cursor
      if (mouse.active) {
        const mdx = a.renderX - mouse.x;
        const mdy = a.renderY - mouse.y;
        const mDistSq = mdx * mdx + mdy * mdy;
        const mMax = mouse.radius * 0.95;
        if (mDistSq < mMax * mMax) {
          const mDist = Math.sqrt(mDistSq);
          const mAlpha = (1 - mDist / mMax) * 0.45 * a.z;
          ctx.beginPath();
          ctx.moveTo(a.renderX, a.renderY);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${a.color.r}, ${a.color.g}, ${a.color.b}, ${mAlpha})`;
          ctx.stroke();
        }
      }
    }

    // 3. Render all nodes
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].draw(ctx);
    }

    rafId = requestAnimationFrame(render);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else {
      if (!rafId && !prefersReducedMotion()) {
        targetScrollY = currentScrollY = window.scrollY;
        rafId = requestAnimationFrame(render);
      }
    }
  });

  resize();

  if (!prefersReducedMotion()) {
    rafId = requestAnimationFrame(render);
  } else {
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].update(W, H, 0);
      nodes[i].draw(ctx);
    }
  }
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
  }, { threshold: 0.02, rootMargin: '0px 0px 60px 0px' });

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

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scroll Reveal ── */
  // Hero .reveal elements are handled by CSS (always above the fold — no observer needed)
  const revealElements = document.querySelectorAll('.reveal:not(.hero .reveal)');

  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('in-view'));
  }

  /* ── Animated Counters ── */
  const counters = document.querySelectorAll('[data-counter]');

  const animateCounter = (el) => {
    const target = Number(el.dataset.counter);
    const duration = 1500;
    const start = performance.now();

    const step = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * ease);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.8 });

  counters.forEach((counter) => counterObserver.observe(counter));

  /* ── Testimonial Slider ── */
  const track = document.getElementById('testimonialTrack');
  const nextBtn = document.getElementById('nextTestimonial');
  const prevBtn = document.getElementById('prevTestimonial');
  let testimonialIndex = 0;
  const testimonialCount = track ? track.children.length : 0;
  let autoRotate;

  function updateTestimonials() {
    if (!track) return;
    const offset = testimonialIndex * track.parentElement.clientWidth;
    track.style.transform = `translate3d(-${offset}px, 0, 0)`;
  }

  function nextTestimonial() {
    if (!testimonialCount) return;
    testimonialIndex = (testimonialIndex + 1) % testimonialCount;
    updateTestimonials();
  }

  function prevTestimonial() {
    if (!testimonialCount) return;
    testimonialIndex = (testimonialIndex - 1 + testimonialCount) % testimonialCount;
    updateTestimonials();
  }

  function startAutoRotate() {
    if (prefersReducedMotion || !track || testimonialCount < 2) return;
    clearInterval(autoRotate);
    autoRotate = setInterval(nextTestimonial, 5200);
  }

  if (nextBtn && prevBtn && track) {
    nextBtn.setAttribute('type', 'button');
    prevBtn.setAttribute('type', 'button');

    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      nextTestimonial();
      startAutoRotate();
    });

    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      prevTestimonial();
      startAutoRotate();
    });

    window.addEventListener('resize', updateTestimonials);
    updateTestimonials();
    startAutoRotate();
  }

  /* ── Mobile Navigation ── */
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const open = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', String(open));
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Cursor Glow ── */
  const cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow && !prefersReducedMotion && window.innerWidth > 768) {
    window.addEventListener('pointermove', (e) => {
      cursorGlow.style.transform = `translate(${e.clientX - 140}px, ${e.clientY - 140}px)`;
    });
  }

  /* ── 3D Tilt Card ── */
  const tiltCard = document.getElementById('tiltCard');
  if (tiltCard && !prefersReducedMotion && window.innerWidth > 900) {
    tiltCard.addEventListener('mousemove', (e) => {
      const card = tiltCard.querySelector('.phone-card');
      const rect = tiltCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -10;
      const ry = ((x / rect.width) - 0.5) * 12;
      card.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg)`;
    });

    tiltCard.addEventListener('mouseleave', () => {
      const card = tiltCard.querySelector('.phone-card');
      card.style.transform = 'rotateY(-15deg) rotateX(9deg)';
    });
  }

  /* ── Form Toast ── */
  window.showToast = function showToast() {
    let toast = document.getElementById('fakeToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'fakeToast';
      Object.assign(toast.style, {
        position: 'fixed',
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%) translateY(20px)',
        padding: '14px 18px',
        borderRadius: '16px',
        background: 'rgba(8,13,24,0.92)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        color: 'white',
        zIndex: '50',
        backdropFilter: 'blur(14px)',
        opacity: '0',
        transition: 'opacity .25s ease, transform .25s ease',
        fontFamily: 'inherit',
        fontSize: '.95rem',
      });
      document.body.appendChild(toast);
    }

    toast.textContent = 'Demo form submitted. In a live build, this would trigger your CRM and automations.';

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  };

  /* ── Hero Parallax ── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && !prefersReducedMotion && window.innerWidth > 768) {
    const heroSection = heroBg.closest('.hero');
    const handleParallax = () => {
      const scrollY = window.pageYOffset;
      if (!heroSection || scrollY > heroSection.offsetHeight + 120) return;
      // Subtle 0.22 rate — barely perceptible, just adds depth
      heroBg.style.transform = `translateY(${scrollY * 0.22}px) scale(1.1)`;
    };
    window.addEventListener('scroll', handleParallax, { passive: true });
  }

  /* ── Smooth Scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - 84;
      window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
})();

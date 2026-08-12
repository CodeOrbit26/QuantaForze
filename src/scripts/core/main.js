document.addEventListener('DOMContentLoaded', () => {

  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ================================================================
  // 1. FLUID CANVAS INITIALIZATION
  // ================================================================
  const heroCanvas = document.querySelector('.s-hero .b-fluid__canvas');
  if (heroCanvas && window.initFluidCanvas) {
    window.initFluidCanvas(heroCanvas);
  }

  const workCanvas = document.querySelector('.b-execution .b__canvas');
  if (workCanvas && window.initFluidCanvas) {
    window.initFluidCanvas(workCanvas);
  }

  const ctaCanvas = document.getElementById('ctaCanvas');
  if (ctaCanvas && window.initFluidCanvas) {
    window.initFluidCanvas(ctaCanvas);
  }

  // ================================================================
  // 2. HERO PARALLAX (exact incredibles.dev GSAP)
  // ================================================================
  const heroEl = document.querySelector('.s-hero');
  const heroContainer = heroEl ? heroEl.querySelector('.u-container') : null;
  const heroFluid = heroEl ? heroEl.querySelector('.s__fluid') : null;

  if (heroEl && heroContainer && typeof gsap !== 'undefined') {
    gsap.timeline({
      scrollTrigger: {
        trigger: heroEl,
        start: 'top top',
        end: 'bottom top',
        scrub: 0
      }
    })
    .fromTo(heroContainer, { y: 0 }, { y: () => window.innerHeight * 0.5, ease: 'none' }, 0)
    .fromTo(heroFluid, { y: 0 }, { y: () => window.innerHeight * 0.5, ease: 'none' }, 0);
  }

  // ================================================================
  // 3. USPs CARD STACK (exact incredibles.dev GSAP ScrollTrigger)
  // ================================================================
  const uspsEl = document.querySelector('.s-usps');
  const uspsHeader = uspsEl ? uspsEl.querySelector('.s__header') : null;
  const uspsList = uspsEl ? uspsEl.querySelector('.s__list') : null;
  const uspsCards = uspsEl ? Array.from(uspsEl.querySelectorAll('.b-usp-card')) : [];
  const cardCount = uspsCards.length;

  if (uspsEl && uspsHeader && uspsList && cardCount > 0 && typeof gsap !== 'undefined') {
    // 3a. Header entrance & shrink timeline
    const headerTl = gsap.timeline({
      scrollTrigger: {
        trigger: uspsEl,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 0
      }
    });

    headerTl.fromTo(uspsHeader, { y: () => window.innerHeight * 0.25 }, { y: 0, ease: 'power4.out', duration: 2 }, 0);
    headerTl.fromTo(uspsHeader, { scale: 1 }, { scale: 0.85, ease: 'none', duration: cardCount }, 1);

    // 3b. Cards entry, 3D flip (rotateX: 90 -> 0, z: 750 -> 0), and stacking scale + overlay fade
    const cardHeight = uspsCards[0].clientHeight || (window.innerWidth <= 1080 ? 400 : 450);
    const initialY = window.innerHeight * 0.5 + cardHeight;
    gsap.set(uspsCards, { y: initialY });

    const cardsTl = gsap.timeline({
      scrollTrigger: {
        trigger: uspsList,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 0
      }
    });

    uspsCards.forEach((card, index) => {
      // Entry translate & 3D rotation
      cardsTl.fromTo(card, { y: initialY }, { y: 0, ease: 'power2.inOut', duration: 1.5 }, index);
      cardsTl.fromTo(card, { rotateX: 90, z: 750 }, { rotateX: 0, z: 0, ease: 'power2.inOut', duration: 1.2 }, index);

      // Stack previous cards: scale down by 0.125 step and fade dark `--fade` by 0.1 step
      for (let prev = 0; prev < index; prev++) {
        const prevCard = uspsCards[prev];
        const distBefore = index - prev - 1;
        const distAfter = index - prev;
        const scaleStep = 0.125;

        cardsTl.fromTo(prevCard,
          { scale: 1 - distBefore * scaleStep },
          { scale: 1 - distAfter * scaleStep, ease: 'none', duration: 1, immediateRender: false },
          index
        );

        cardsTl.fromTo(prevCard,
          { '--fade': distBefore * 0.1 },
          { '--fade': distAfter * 0.1, ease: 'none', duration: 0.5, immediateRender: false },
          index + 0.75
        );
      }
    });

    // 3c. Exit timeline: header & cards exit up when section scrolls away
    const exitTl = gsap.timeline({
      scrollTrigger: {
        trigger: uspsEl,
        start: 'bottom 150%',
        end: 'bottom -100%',
        scrub: 0
      }
    });

    exitTl.to(uspsHeader, { y: () => -window.innerHeight * 0.5 - uspsHeader.clientHeight * 0.5, ease: 'power2.in', duration: 1.35 }, 0);
    exitTl.to(uspsHeader, { scale: 0, ease: 'power1.in', duration: 1 }, 0.25);
    exitTl.to(uspsCards, { y: -initialY, ease: 'power1.in', duration: 1, stagger: 0.075 }, 0);
    exitTl.to(uspsEl, { opacity: 0, ease: 'power1.in', duration: 0.75 }, 0.15);
  }

  // ================================================================
  // 4. CATCHPHRASE SCROLL ANIMATION (exact incredibles.dev GSAP)
  // ================================================================
  const catchphraseEl = document.querySelector('.s-catchphrase');
  const catchphraseTitle = catchphraseEl ? catchphraseEl.querySelector('.s__title') : null;

  if (catchphraseEl && catchphraseTitle && typeof gsap !== 'undefined') {
    const catchphraseTl = gsap.timeline({
      scrollTrigger: {
        trigger: catchphraseEl,
        start: 'top -25%',
        end: 'bottom 50%',
        scrub: 0,
        invalidateOnRefresh: true
      }
    });

    catchphraseTl.fromTo(catchphraseTitle, { y: '-50%' }, { y: '0%', duration: 1, ease: 'expo.out' }, 0);

    // Scale up from 0.75 and fade in
    catchphraseTl.fromTo(catchphraseTitle,
      { scale: 0.75, opacity: 0 },
      { scale: 1, opacity: 1, ease: 'power4.out', duration: 0.7 },
      0
    );
  }

  // ================================================================
  // 5. FINAL CTA PARALLAX (exact incredibles.dev GSAP)
  // ================================================================
  const ctaEl = document.querySelector('.s-final-cta');
  const ctaContainer = ctaEl ? ctaEl.querySelector('.s__inner') : null;
  const ctaBg = ctaEl ? ctaEl.querySelector('.s__background-wrapper') : null;

  if (ctaEl && ctaContainer && typeof gsap !== 'undefined') {
    const ctaTl = gsap.timeline({
      scrollTrigger: {
        trigger: ctaEl,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 0,
        invalidateOnRefresh: true
      }
    });

    ctaTl.fromTo(ctaContainer, { y: () => window.innerHeight * -0.25 }, { y: 0, duration: 1, ease: 'none' }, 0);
    if (ctaBg) {
      ctaTl.fromTo(ctaBg, { y: () => window.innerHeight * -0.25 }, { y: 0, duration: 1, ease: 'none' }, 0);
    }
  }

  // ================================================================
  // 6. SCROLL REVEAL OBSERVER FOR STATIC ELEMENTS
  // ================================================================
  const revealElements = document.querySelectorAll('.js-reveal');
  const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -60px 0px' };
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-revealed');
    });
  }, observerOptions);
  revealElements.forEach(el => revealObserver.observe(el));

  // ================================================================
  // 7. CUSTOM CURSOR
  // ================================================================
  const cursor = document.createElement('div');
  cursor.className = 'b-cursor';
  document.body.appendChild(cursor);
  let cursorVisible = false, mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (!cursorVisible) { cursorVisible = true; cursor.classList.add('is-visible'); }
  });
  document.addEventListener('mouseleave', () => {
    cursorVisible = false; cursor.classList.remove('is-visible');
  });
  function updateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // ================================================================
  // 8. FAQ ACCORDION
  // ================================================================
  const faqItems = document.querySelectorAll('.b-faq');
  faqItems.forEach(item => {
    const toggle = item.querySelector('.b__toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      faqItems.forEach(other => {
        other.classList.remove('is-open');
        const ot = other.querySelector('.b__toggle');
        if (ot) ot.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ================================================================
  // 9. PRICING TOGGLE (Single / Recurring)
  // ================================================================
  const pricingOptions = document.querySelectorAll('.b-pricing-toggle .b__option');
  const pill = document.querySelector('.b-pricing-toggle .b__pill');
  const singlePanel = document.querySelector('.s-pricing__panel--single');
  const recurringPanel = document.querySelector('.s-pricing__panel--recurring');

  function setPricingMode(mode, targetBtn) {
    pricingOptions.forEach(opt => {
      opt.classList.remove('is-active');
      opt.setAttribute('aria-selected', 'false');
    });
    targetBtn.classList.add('is-active');
    targetBtn.setAttribute('aria-selected', 'true');

    if (pill && targetBtn) {
      const parentRect = targetBtn.parentElement.getBoundingClientRect();
      const btnRect = targetBtn.getBoundingClientRect();
      pill.style.width = `${btnRect.width}px`;
      pill.style.transform = `translate3d(${btnRect.left - parentRect.left}px, 0, 0)`;
      pill.style.opacity = '1';
    }

    if (mode === 'single') {
      singlePanel && singlePanel.classList.add('is-active');
      recurringPanel && recurringPanel.classList.remove('is-active');
    } else {
      singlePanel && singlePanel.classList.remove('is-active');
      recurringPanel && recurringPanel.classList.add('is-active');
    }
  }

  if (pricingOptions.length >= 2) {
    requestAnimationFrame(() => {
      const activeOpt = document.querySelector('.b-pricing-toggle .b__option.is-active');
      if (activeOpt) setPricingMode('single', activeOpt);
    });

    pricingOptions[0].addEventListener('click', (e) => setPricingMode('single', e.currentTarget));
    pricingOptions[1].addEventListener('click', (e) => setPricingMode('recurring', e.currentTarget));
  }

  // ================================================================
  // 10. CONTACT MODAL SHEET
  // ================================================================
  const modal = document.querySelector('.s-modal');
  const modalTriggers = document.querySelectorAll('.s__menu-link--cta, .s__btn, [href="#triggerSiteContact"], [href="#contact"], .b__cta');
  const modalClose = document.querySelector('.s-modal .s__close');
  const modalOverlay = document.querySelector('.s-modal .s__overlay');

  window.openContactModal = function() {
    if (!modal) return;
    modal.classList.add('is-open', 'is-visible');
    document.body.style.overflow = 'hidden';
  };

  window.closeContactModal = function() {
    if (!modal) return;
    modal.classList.remove('is-open');
    setTimeout(() => {
      modal.classList.remove('is-visible');
      document.body.style.overflow = '';
    }, 400);
  };

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => { e.preventDefault(); window.openContactModal(); });
  });

  if (modalClose) modalClose.addEventListener('click', window.closeContactModal);
  if (modalOverlay) modalOverlay.addEventListener('click', window.closeContactModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.closeContactModal(); });

  // ================================================================
  // 11. INTERACTIVE PRICING FORM STEPS
  // ================================================================
  const formSteps = document.querySelectorAll('.b-form-step');
  const projectTypeSelect = document.getElementById('projectType');
  const projectSizeSelect = document.getElementById('projectSize');
  const projectComplexitySelect = document.getElementById('projectComplexity');

  function activateStep(index) {
    if (formSteps[index]) {
      formSteps[index].classList.remove('is-inactive');
      formSteps[index].removeAttribute('inert');
    }
  }

  if (projectTypeSelect) {
    projectTypeSelect.addEventListener('change', (e) => {
      const type = e.target.value;
      if (!projectSizeSelect) return;
      projectSizeSelect.innerHTML = '<option value="" disabled selected>Select project size*</option>';
      if (type === 'landing') {
        projectSizeSelect.innerHTML += `
          <option value="small">Small — 1 to 2 sections</option>
          <option value="medium">Medium — 3 to 5 sections</option>
          <option value="large">Large — 6+ sections</option>`;
      } else if (type === 'website') {
        projectSizeSelect.innerHTML += `
          <option value="small">Small — 1 to 3 pages</option>
          <option value="medium">Medium — 4 to 8 pages</option>
          <option value="large">Large — 9+ pages</option>`;
      } else {
        projectSizeSelect.innerHTML += `
          <option value="small">Single Concept</option>
          <option value="medium">Full Brand Experience</option>`;
      }
      activateStep(1);
    });
  }

  if (projectSizeSelect) {
    projectSizeSelect.addEventListener('change', () => activateStep(2));
  }
  if (projectComplexitySelect) {
    projectComplexitySelect.addEventListener('change', () => activateStep(3));
  }

  // Navbar Glassmorphism Scroll & Idle Listener
  const quantaNavbar = document.querySelector('.quanta-navbar');
  if (quantaNavbar) {
    let idleTimer = null;
    let isHovered = false;

    quantaNavbar.addEventListener('mouseenter', () => {
      isHovered = true;
      quantaNavbar.classList.remove('is-idle');
    });

    quantaNavbar.addEventListener('mouseleave', () => {
      isHovered = false;
      resetIdleTimer();
    });

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      quantaNavbar.classList.remove('is-idle');

      if (window.scrollY > 100 && !isHovered) {
        idleTimer = setTimeout(() => {
          if (!isHovered && window.scrollY > 100) {
            quantaNavbar.classList.add('is-idle');
          }
        }, 1800);
      }
    };

    const onScrollNavbar = () => {
      if (window.scrollY > 35) {
        quantaNavbar.classList.add('is-scrolled');
      } else {
        quantaNavbar.classList.remove('is-scrolled');
      }
      resetIdleTimer();
    };

    window.addEventListener('scroll', onScrollNavbar, { passive: true });
    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    onScrollNavbar();
  }

  // Light Mode Enforcer (Dark Mode Completely Removed)
  try {
    localStorage.removeItem('quanta-theme');
    document.documentElement.classList.remove('theme-dark');
    document.body.classList.remove('theme-dark');
    document.documentElement.classList.add('theme-light');
    document.body.classList.add('theme-light');
  } catch (e) {}

});

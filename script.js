/* ============================================================
   FEEL GUZEL — script.js
   Pure Vanilla JS. No dependencies.
   ============================================================ */

'use strict';

/* ============================================================
   1. FOOTER YEAR
   ============================================================ */
(function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ============================================================
   2. STICKY HEADER — add .scrolled class on scroll
   ============================================================ */
(function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load in case page is pre-scrolled
})();

/* ============================================================
   3. MOBILE NAV TOGGLE
   ============================================================ */
(function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  function openNav() {
    navLinks.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });

  // Close when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeNav();
      toggle.focus();
    }
  });
})();

/* ============================================================
   4. SCROLL REVEAL
   Adds .reveal to eligible elements, then uses IntersectionObserver
   to toggle .visible when they enter the viewport.
   ============================================================ */
(function initScrollReveal() {
  // Respect reduced-motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const selectors = [
    '.service-card',
    '.associated-card',
    '.contact-info',
    '.contact-form',
    '.section-header',
  ];

  const elements = document.querySelectorAll(selectors.join(', '));
  if (!elements.length) return;

  elements.forEach(function (el, i) {
    el.classList.add('reveal');

    // Stagger cards within the same grid
    const isCard = el.classList.contains('service-card') || el.classList.contains('associated-card');
    if (isCard) {
      // Get index within its parent to stagger siblings
      const siblings = Array.from(el.parentElement.children);
      const siblingIndex = siblings.indexOf(el);
      el.style.transitionDelay = (siblingIndex * 80) + 'ms';
    }
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // fire once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ============================================================
   5. SMOOTH ACTIVE NAV LINK HIGHLIGHT
   Highlights the nav link whose section is currently in view.
   ============================================================ */
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.4,
  });

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();

/* ============================================================
   6. CONTACT FORM — client-side validation + submission
   No backend. Sends via Formspree if action attribute is set,
   otherwise shows a success message for static/demo use.
   ============================================================ */
(function initContactForm() {
  const form = document.querySelector('.contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  function setStatus(message, isError) {
    status.textContent = message;
    status.style.color = isError ? '#c0392b' : 'var(--color-gold)';
  }

  function clearStatus() {
    status.textContent = '';
  }

  function validateField(field) {
    const value = field.value.trim();

    if (field.required && !value) {
      return field.labels[0]
        ? field.labels[0].textContent + ' is required.'
        : 'This field is required.';
    }

    if (field.type === 'tel' && value) {
      const digits = value.replace(/[\s\-\+\(\)]/g, '');
      if (!/^\d{7,15}$/.test(digits)) {
        return 'Enter a valid phone number.';
      }
    }

    return null;
  }

  // Inline validation on blur
  form.querySelectorAll('.form-input').forEach(function (field) {
    field.addEventListener('blur', function () {
      const error = validateField(field);
      if (error) {
        field.style.borderColor = '#c0392b';
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.style.borderColor = '';
        field.removeAttribute('aria-invalid');
      }
    });

    field.addEventListener('input', function () {
      field.style.borderColor = '';
      field.removeAttribute('aria-invalid');
      clearStatus();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearStatus();

    // Validate all fields
    const fields = form.querySelectorAll('.form-input');
    let firstError = null;

    fields.forEach(function (field) {
      const error = validateField(field);
      if (error && !firstError) {
        firstError = { field: field, message: error };
        field.style.borderColor = '#c0392b';
        field.setAttribute('aria-invalid', 'true');
      }
    });

    if (firstError) {
      setStatus(firstError.message, true);
      firstError.field.focus();
      return;
    }

    // If a Formspree action is present on the form, submit via fetch
    const action = form.getAttribute('action');
    if (action && action.includes('formspree')) {
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      fetch(action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      })
        .then(function (response) {
          if (response.ok) {
            setStatus('Message sent. We will be in touch soon.', false);
            form.reset();
          } else {
            return response.json().then(function (data) {
              const msg = data.errors
                ? data.errors.map(function (err) { return err.message; }).join(', ')
                : 'Something went wrong. Please try WhatsApp instead.';
              setStatus(msg, true);
            });
          }
        })
        .catch(function () {
          setStatus('Could not send. Please contact us via WhatsApp.', true);
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });

    } else {
      // Static / demo fallback — no backend configured
      setStatus('Thank you. We will reach out to you shortly.', false);
      form.reset();
    }
  });
})();

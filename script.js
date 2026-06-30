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
    '.portfolio-item',
    '.contact-info',
    '.contact-form',
    '.section-header',
  ];

  const elements = document.querySelectorAll(selectors.join(', '));
  if (!elements.length) return;

  elements.forEach(function (el, i) {
    el.classList.add('reveal');

    // Stagger cards within the same grid
    const isCard = el.classList.contains('service-card')
      || el.classList.contains('associated-card')
      || el.classList.contains('portfolio-item');
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
   6. CONTACT FORM — client-side validation + WhatsApp submission
   No backend exists on GitHub Pages, so the form composes a
   WhatsApp message and opens a chat with the studio directly.
   ============================================================ */
(function initContactForm() {
  const form = document.querySelector('.contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.remove('is-success', 'is-error');
    status.classList.add(isError ? 'is-error' : 'is-success');
  }

  function clearStatus() {
    status.textContent = '';
    status.classList.remove('is-success', 'is-error');
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
        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.classList.remove('is-invalid');
        field.removeAttribute('aria-invalid');
      }
    });

    field.addEventListener('input', function () {
      field.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
      clearStatus();
    });
  });
})();

//Form submit on Web3Forms gets email in swoyujbajracharya@gmail.com
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", async function(e) {

  e.preventDefault(); // stops URL change

  status.innerHTML = "Sending...";


  const formData = new FormData(form);


  try {

    const response = await fetch(
      "https://api.web3forms.com/submit",
      {
        method: "POST",
        body: formData
      }
    );


    const result = await response.json();


    if(result.success) {

      status.innerHTML = "✓ Message has been sent successfully.";

      form.reset();

    } else {

      status.innerHTML = "Something went wrong. Please try again.";

    }


  } catch(error) {

    status.innerHTML = "Unable to send message. Please try again.";

  }

});

/* ============================================================
   7. PORTFOLIO FILTER
   Toggles visibility of portfolio items by category using
   the .is-hidden class. No layout library involved.
   ============================================================ */
(function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll('.portfolio-filter');
  const items = document.querySelectorAll('.portfolio-item');
  if (!filterButtons.length || !items.length) return;

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const filter = button.getAttribute('data-filter');

      filterButtons.forEach(function (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      items.forEach(function (item) {
        const category = item.getAttribute('data-category');
        const matches = filter === 'all' || category === filter;
        item.classList.toggle('is-hidden', !matches);
      });
    });
  });
})();

/* ============================================================
   8. LIGHTBOX GALLERY
   Click a portfolio image to view it full size. Closes via
   the close button, an outside click, or the Escape key.
   ============================================================ */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const closeBtn = document.getElementById('lightboxClose');
  const items = document.querySelectorAll('.portfolio-item img');
  if (!lightbox || !lightboxImage || !closeBtn || !items.length) return;

  let lastFocused = null;

  function openLightbox(src, alt) {
    lastFocused = document.activeElement;
    lightboxImage.src = src;
    lightboxImage.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImage.src = '';
    if (lastFocused) lastFocused.focus();
  }

  items.forEach(function (img) {
    img.addEventListener('click', function () {
      openLightbox(img.getAttribute('src'), img.getAttribute('alt'));
    });
  });

  closeBtn.addEventListener('click', closeLightbox);

  // Click outside the image (on the dark backdrop) closes it
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Escape key closes it
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
})();

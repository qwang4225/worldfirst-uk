/**
 * WorldFirst UK — Main JavaScript
 * Handles: header scroll, mobile nav, FAQ accordion, smooth scroll, animations
 */

(function () {
  'use strict';

  // ========== Header Scroll Effect ==========
  const header = document.getElementById('header');
  if (header) {
    let lastScrollY = 0;
    window.addEventListener('scroll', function () {
      const scrollY = window.scrollY;
      if (scrollY > 20) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
      lastScrollY = scrollY;
    }, { passive: true });
  }

  // ========== Mobile Navigation Toggle ==========
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('mobile-nav--open');
      mobileToggle.setAttribute('aria-expanded', isOpen);

      // Animate hamburger to X
      const spans = mobileToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        document.body.style.overflow = 'hidden';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
        document.body.style.overflow = '';
      }
    });

    // Close mobile nav on link click
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('mobile-nav--open');
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
        document.body.style.overflow = '';
      });
    });
  }

  // ========== FAQ Accordion ==========
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    const question = item.querySelector('.faq-item__question');
    if (question) {
      question.addEventListener('click', function () {
        const isOpen = item.classList.contains('faq-item--open');

        // Close all other FAQ items
        faqItems.forEach(function (other) {
          other.classList.remove('faq-item--open');
        });

        // Toggle current
        if (!isOpen) {
          item.classList.add('faq-item--open');
        }
      });
    }
  });

  // ========== Smooth Scroll for Anchor Links ==========
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ========== Scroll-triggered Animations ==========
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const animateOnScroll = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        animateOnScroll.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Apply to feature cards, biz cards, steps, testimonials
  const animateElements = document.querySelectorAll(
    '.feature-card, .biz-card, .step, .testimonial, .pricing-card'
  );

  animateElements.forEach(function (el, index) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease ' + (index % 3) * 0.1 + 's, transform 0.5s ease ' + (index % 3) * 0.1 + 's';
    animateOnScroll.observe(el);
  });

  // ========== Stats Counter Animation ==========
  const statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const numbers = entry.target.querySelectorAll('.stats-bar__number');
        numbers.forEach(function (numEl) {
          animateNumber(numEl);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsBars = document.querySelectorAll('.stats-bar');
  statsBars.forEach(function (bar) {
    statsObserver.observe(bar);
  });

  function animateNumber(el) {
    const text = el.textContent;
    const match = text.match(/[\d,.]+/);
    if (!match) return;

    const numStr = match[0];
    const target = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(target)) return;

    const prefix = text.substring(0, text.indexOf(numStr));
    const suffix = text.substring(text.indexOf(numStr) + numStr.length);
    const hasCommas = numStr.includes(',');
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;

    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      let formatted;
      if (decimals > 0) {
        formatted = current.toFixed(decimals);
      } else {
        formatted = Math.round(current).toString();
      }

      if (hasCommas) {
        formatted = Number(formatted).toLocaleString('en-GB', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
      }

      el.textContent = prefix + formatted + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Restore original text to preserve exact formatting
        el.textContent = text;
      }
    }

    requestAnimationFrame(update);
  }

  // ========== Hero Stats Animation ==========
  const heroStats = document.querySelectorAll('.hero__stat-value');
  const heroObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        heroObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  heroStats.forEach(function (stat) {
    heroObserver.observe(stat);
  });

})();

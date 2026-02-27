// WorldFirst UK - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Header scroll effect
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('open');
      mainNav.classList.toggle('open');
      document.body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
    });
  }

  // Mobile dropdown toggle
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    if (link && item.querySelector('.mega-dropdown')) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          item.classList.toggle('mobile-open');
          // Close other dropdowns
          navItems.forEach(other => {
            if (other !== item) other.classList.remove('mobile-open');
          });
        }
      });
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        mainNav.classList.remove('open');
        mobileToggle.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Animate stats on scroll
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.trust-item .number, .hero-stat .number');
    elements.forEach(el => {
      if (el.dataset.animated) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 50) {
        el.dataset.animated = 'true';
        animateNumber(el);
      }
    });
  };

  const animateNumber = (el) => {
    const text = el.textContent;
    const match = text.match(/([\d.]+)/);
    if (!match) return;

    const target = parseFloat(match[1]);
    const suffix = text.replace(match[1], '');
    const prefix = text.substring(0, text.indexOf(match[1]));
    const duration = 1500;
    const start = performance.now();

    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = (target * eased).toFixed(target % 1 !== 0 ? 1 : 0);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll();

  // Region selector dropdown (simple toggle)
  const regionSelector = document.querySelector('.region-selector');
  if (regionSelector) {
    regionSelector.addEventListener('click', () => {
      // Placeholder - could open a region modal
    });
  }
});

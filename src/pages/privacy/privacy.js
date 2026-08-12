import '../../scripts/core/main.js';

document.addEventListener('DOMContentLoaded', () => {
  const tocLinks = document.querySelectorAll('.privacy-toc-link');
  const sections = document.querySelectorAll('.privacy-section, .privacy-section h3');

  if (!tocLinks.length || !sections.length) return;

  // IntersectionObserver for Scroll Spy
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (id) {
          tocLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('is-active');
            } else {
              link.classList.remove('is-active');
            }
          });
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Smooth Scrolling for TOC Links
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        history.pushState(null, null, `#${targetId}`);
      }
    });
  });
});

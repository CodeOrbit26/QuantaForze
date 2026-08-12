import '../../scripts/core/main.js';

// Interactive Docs Search & Keyboard Shortcuts
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('docsSearchInput');

  // Keyboard shortcut (⌘K or Ctrl+K)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  // Filter docs topics on search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const articles = document.querySelectorAll('.gc-article h2, .gc-article h3, .gc-article p, .gc-nav-item');

      articles.forEach(el => {
        if (!query) {
          el.style.opacity = '1';
        } else {
          const text = el.textContent.toLowerCase();
          if (text.includes(query)) {
            el.style.opacity = '1';
          } else {
            el.style.opacity = '0.4';
          }
        }
      });
    });
  }

  // Active TOC Scroll Highlight
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60% 0px',
    threshold: 0
  };

  const tocItems = document.querySelectorAll('.gc-toc-item');
  const sections = document.querySelectorAll('.gc-article h2[id]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        tocItems.forEach(item => {
          const link = item.querySelector('a');
          if (link && link.getAttribute('href') === `#${id}`) {
            tocItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
});

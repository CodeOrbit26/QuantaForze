/**
 * QuantaForze - Documentation Page Interactive Logic
 * Handles code copying, search modal (⌘K), active sidebar highlighting, and feedback.
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Copy Code Functionality
  window.copyCode = function(button) {
    const container = button.closest('.code-block-container');
    const code = container.querySelector('code')?.innerText || '';
    
    navigator.clipboard.writeText(code).then(() => {
      const originalText = button.innerText;
      button.innerText = 'Copied!';
      button.style.color = '#4ade80';
      button.style.borderColor = '#4ade80';

      setTimeout(() => {
        button.innerText = originalText;
        button.style.color = '';
        button.style.borderColor = '';
      }, 2000);
    });
  };

  // 2. Command Search (⌘K / Ctrl+K)
  const modal = document.getElementById('search-modal');
  const searchInput = document.getElementById('docs-search-input');

  window.openDocsSearch = function() {
    modal?.classList.add('active');
    setTimeout(() => searchInput?.focus(), 50);
  };

  window.closeDocsSearch = function() {
    modal?.classList.remove('active');
  };

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openDocsSearch();
    }
    if (e.key === 'Escape') {
      closeDocsSearch();
    }
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeDocsSearch();
    }
  });

  // 3. Search Filter Logic
  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const items = document.querySelectorAll('.search-item');

    items.forEach((item) => {
      const text = item.innerText.toLowerCase();
      if (text.includes(query)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });

  // 4. Feedback Submission
  window.submitFeedback = function(type) {
    const card = document.querySelector('.doc-feedback-card');
    if (card) {
      card.innerHTML = `
        <h4 style="color: #4ade80;">Thank you for your feedback! ❤️</h4>
        <p style="color: #94a3b8; font-size: 0.9rem; margin: 0;">We appreciate your help in improving the QuantaForze docs.</p>
      `;
    }
  };

  // 5. Active Sidebar Section Highlighting on Scroll
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const sections = document.querySelectorAll('.doc-section, .doc-title');

  window.addEventListener('scroll', () => {
    let currentId = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) {
        currentId = sec.getAttribute('id') || '';
      }
    });

    if (currentId) {
      sidebarLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });
});

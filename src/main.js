import { initParticles } from './particles.js';
import { initAnthropicNodes } from './anthropic-nodes.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Canvas Particles & Anthropic Nodes
  initParticles();
  initAnthropicNodes();

  // 1. Sticky Header Scroll Effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // 2. Feature Explorer Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanes.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(`tab-${target}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // 3. Harness Step Switcher (Interactive Terminal Demo)
  const harnessSteps = document.querySelectorAll('.step-item');
  const terminalView = document.getElementById('terminal-content');

  const stepContents = {
    'step-1': `
<div class="terminal-line"><span class="prompt-symbol">$</span> <span class="cmd-text">quantaforze-quantaforze plan "Build a distributed cache server with zero-allocation memory"</span></div>
<div class="output-block">
  ✔ Analyzing codebase repository (42 files scanned)<br/>
  ✔ Formulated architecture strategy: Memory pool allocator & Lock-free queue<br/>
  ✔ Generated plan artifact: <span style="color: var(--accent-cyan);">implementation_plan.md</span>
</div>
<div class="terminal-line"><span class="prompt-symbol">agent &gt;</span> <span class="cmd-text">Requesting feedback on storage pool design. Proceed to execution? [Y/n] Y</span></div>
    `,
    'step-2': `
<div class="terminal-line"><span class="prompt-symbol">$</span> <span class="cmd-text">quantaforze-quantaforze exec --parallel 4</span></div>
<div class="output-block">
  <span class="diff-add">+ [NEW] src/cache/pool.rs (340 lines added)</span><br/>
  <span class="diff-add">+ [NEW] src/cache/ring_buffer.rs (210 lines added)</span><br/>
  <span class="diff-del">- [DELETE] src/legacy_allocator.rs</span><br/>
  ✔ Modified 3 components across workspace simultaneously.
</div>
    `,
    'step-3': `
<div class="terminal-line"><span class="prompt-symbol">$</span> <span class="cmd-text">quantaforze-quantaforze test --coverage</span></div>
<div class="output-block">
  running 24 tests...<br/>
  test cache::pool::tests::test_allocation_bounds ... <span style="color:#4ade80;">ok</span><br/>
  test cache::ring_buffer::tests::test_concurrent_push_pop ... <span style="color:#4ade80;">ok</span><br/>
  test result: <span style="color:#4ade80;">ok</span>. 24 passed; 0 failed; 0 ignored; finished in 0.42s
</div>
    `,
    'step-4': `
<div class="terminal-line"><span class="prompt-symbol">$</span> <span class="cmd-text">quantaforze-quantaforze deploy --target staging</span></div>
<div class="output-block">
  ✔ Verified build integrity (0 warnings, 0 lint errors)<br/>
  ✔ Pushed release bundle to staging cluster<br/>
  <span style="color: var(--accent-green);">🚀 Liftoff achieved! Server running at https://staging-cache.quantaforze.internal</span>
</div>
    `
  };

  harnessSteps.forEach((step) => {
    step.addEventListener('click', () => {
      harnessSteps.forEach((s) => s.classList.remove('active'));
      step.classList.add('active');
      const stepId = step.getAttribute('data-step');
      if (terminalView && stepContents[stepId]) {
        terminalView.innerHTML = stepContents[stepId];
      }
    });
  });

  // 4. Video Preview Modal Trigger
  const videoTriggers = document.querySelectorAll('[data-video-modal]');
  const modalOverlay = document.getElementById('video-modal');
  const modalClose = document.getElementById('modal-close');
  const videoIframe = document.getElementById('modal-video-iframe');

  videoTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const videoSrc = trigger.getAttribute('data-video-src') || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
      if (videoIframe) {
        videoIframe.src = videoSrc;
      }
      modalOverlay?.classList.add('active');
    });
  });

  modalClose?.addEventListener('click', () => {
    modalOverlay?.classList.remove('active');
    if (videoIframe) {
      videoIframe.src = '';
    }
  });

  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
      if (videoIframe) {
        videoIframe.src = '';
      }
    }
  });

  // 5. OS Auto Detection for Download Button
  const mainDownloadBtn = document.getElementById('primary-download-btn');
  if (mainDownloadBtn) {
    const userAgent = navigator.userAgent.toLowerCase();
    let osLabel = 'Download for macOS';
    if (userAgent.includes('mac')) {
      osLabel = 'Download for macOS (Universal)';
    } else if (userAgent.includes('win')) {
      osLabel = 'Download for Windows (.exe)';
    } else if (userAgent.includes('linux')) {
      osLabel = 'Download for Linux (.deb)';
    }
    const btnText = mainDownloadBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = osLabel;
  }

  // 6. Blog Filtering
  const blogTags = document.querySelectorAll('.blog-filter-btn');
  const blogCards = document.querySelectorAll('.blog-card');

  blogTags.forEach((tagBtn) => {
    tagBtn.addEventListener('click', () => {
      const filter = tagBtn.getAttribute('data-filter');
      blogTags.forEach((t) => t.classList.remove('active'));
      tagBtn.classList.add('active');

      blogCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 7. Toast Notification Handler
  window.showToast = function (message) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: rgba(15, 22, 35, 0.95);
        border: 1px solid var(--accent-blue);
        color: #fff;
        padding: 0.85rem 1.4rem;
        border-radius: var(--radius-md);
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 3000;
        backdrop-filter: blur(12px);
        transition: transform 0.3s ease, opacity 0.3s ease;
        transform: translateY(20px);
        opacity: 0;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
    }, 3000);
  };
});

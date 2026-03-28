/* ============================================
   GITHUB PORTFOLIO — MAIN JS
   ============================================ */

'use strict';

// ── Active Nav Link ──────────────────────────
(function setActiveNav() {
  const links = document.querySelectorAll('.nav-links a');
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ── Hamburger Menu ───────────────────────────
const hamburger = document.querySelector('.nav-hamburger');
const navLinks  = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
}

// ── Typewriter Effect ────────────────────────
class Typewriter {
  constructor(el, options = {}) {
    this.el        = el;
    this.strings   = options.strings || [];
    this.speed     = options.speed   || 60;
    this.pause     = options.pause   || 2000;
    this.index     = 0;
    this.charIdx   = 0;
    this.deleting  = false;
    this.tick();
  }
  tick() {
    const current = this.strings[this.index % this.strings.length];
    if (this.deleting) {
      this.el.textContent = current.slice(0, --this.charIdx);
    } else {
      this.el.textContent = current.slice(0, ++this.charIdx);
    }
    let delay = this.deleting ? this.speed / 2 : this.speed;
    if (!this.deleting && this.charIdx === current.length) {
      delay = this.pause;
      this.deleting = true;
    } else if (this.deleting && this.charIdx === 0) {
      this.deleting = false;
      this.index++;
      delay = 400;
    }
    setTimeout(() => this.tick(), delay);
  }
}

// Init typewriter if element exists
const twEl = document.querySelector('[data-typewriter]');
if (twEl) {
  const strings = twEl.dataset.typewriter.split('|');
  new Typewriter(twEl, { strings, speed: 55, pause: 2200 });
}

// ── Scroll-reveal (IntersectionObserver) ─────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Progress bars animate on view ────────────
const progressObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.progress-fill').forEach(fill => {
        fill.style.animationPlayState = 'running';
      });
      progressObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.progress-wrap').forEach(el => {
  el.querySelectorAll('.progress-fill').forEach(f => {
    f.style.animationPlayState = 'paused';
  });
  progressObserver.observe(el);
});

// ── Smooth counter animation ──────────────────
function animateCounter(el, target, duration = 1500) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.count);
      if (!isNaN(target)) animateCounter(entry.target, target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ── Contact form handler ─────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.innerHTML;

    btn.innerHTML = '<span class="glow-dot"></span> Sending...';
    btn.disabled = true;

    // Simulate send (replace with real API)
    await new Promise(r => setTimeout(r, 1800));

    btn.innerHTML = '✓ Message sent!';
    btn.style.background = 'var(--green)';
    btn.style.color = '#000';
    contactForm.reset();

    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      btn.style.background = '';
      btn.style.color = '';
    }, 3000);
  });
}

// ── GitHub API fetch (for projects page) ─────
async function fetchGitHubRepos(username) {
  const container = document.getElementById('github-repos');
  if (!container) return;

  try {
    const res  = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`);
    const repos = await res.json();

    if (!Array.isArray(repos)) throw new Error('No repos');

    container.innerHTML = repos.map(repo => `
      <div class="card reveal">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
          <h3 style="font-family:var(--font-mono); font-size:14px; color:#fff;">${repo.name}</h3>
          <div style="display:flex; gap:8px; align-items:center;">
            <span style="font-size:11px; color:var(--text-dim);">★ ${repo.stargazers_count}</span>
            ${repo.fork ? '<span class="badge badge-amber">fork</span>' : ''}
          </div>
        </div>
        <p style="color:var(--text-muted); font-size:12px; margin-bottom:16px; min-height:36px;">
          ${repo.description || 'No description provided.'}
        </p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          ${repo.language ? `<span class="badge badge-cyan">${repo.language}</span>` : '<span></span>'}
          <a href="${repo.html_url}" target="_blank" class="btn btn-ghost" style="padding:6px 12px; font-size:11px;">
            View repo →
          </a>
        </div>
      </div>
    `).join('');

    // Re-observe new cards
    container.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  } catch (err) {
    container.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1;">
      Could not load repos. Check your username or <a href="https://github.com/${username}" target="_blank">view directly on GitHub →</a>
    </p>`;
  }
}

// Auto-fetch if data-github attr present on body
const gh = document.body.dataset.github;
if (gh) fetchGitHubRepos(gh);

// ── Cursor glow ───────────────────────────────
const cursor = document.createElement('div');
cursor.style.cssText = `
  position: fixed; width: 300px; height: 300px;
  border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  z-index: 0; transition: opacity 0.3s;
`;
document.body.appendChild(cursor);

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});
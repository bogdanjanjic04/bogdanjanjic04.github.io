const links = document.querySelectorAll('.nav-links a:not(.nav-cta)');
const indicator = document.querySelector('.nav-indicator');
let insideNav = false;

links.forEach(link => {
  link.addEventListener('mouseenter', (e) => {
    const { offsetWidth, offsetLeft } = e.target;

    if (!insideNav) {
      indicator.style.transition = 'none';
      indicator.style.left = `${offsetLeft}px`;
      indicator.style.width = `${offsetWidth}px`;
      indicator.getBoundingClientRect();
      indicator.style.transition = '';
      indicator.style.opacity = '1';
    } else {
      indicator.style.left = `${offsetLeft}px`;
      indicator.style.width = `${offsetWidth}px`;
    }

    insideNav = true;
  });
});

document.querySelector('.nav-links').addEventListener('mouseleave', () => {
  indicator.style.opacity = '0';
  insideNav = false;
});

const GH_USER = 'bogdanjanjic04';
const TOOL_REPOS = ['system-monitor', 'log-analyzer', 'health-checker'];
const BTC_ADDR = 'bc1qm6at6tp322vex3ht6kkmjwm3jm7y99ucccvkmt';

const LANG_COLORS = {
  Python: '#3776AB',
  Kotlin: '#A97BFF',
  Java: '#B07219',
  JavaScript: '#F1E05A',
  'C#': '#178600',
  'C++': '#F34B7D',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#DEA584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138'
};

const FALLBACK_TOOLS = [
  {
    name: 'system-monitor',
    description: 'CLI tool that reads CPU, memory, and disk metrics directly from /proc and /sys on Linux and logs them to a structured JSON file at configurable intervals.',
    language: 'Python',
    pushed_at: '2025-01-01T00:00:00Z',
    html_url: 'https://github.com/bogdanjanjic04/system-monitor'
  },
  {
    name: 'log-analyzer',
    description: 'Parses log files, counts event frequency by type, extracts error lines, and generates a structured report.',
    language: 'Python',
    pushed_at: '2025-01-01T00:00:00Z',
    html_url: 'https://github.com/bogdanjanjic04/log-analyzer'
  },
  {
    name: 'health-checker',
    description: 'HTTP endpoint monitor that pings a list of URLs every 30 seconds, records response time and status codes, maintains a history file, and alerts on failures.',
    language: 'Python',
    pushed_at: '2025-01-01T00:00:00Z',
    html_url: 'https://github.com/bogdanjanjic04/health-checker'
  }
];

function calcLinuxYears() {
  const raw = new Date().getFullYear() - 2019;
  return Math.floor(raw / 5) * 5;
}

function fmtDate(iso) {
  const d = new Date(iso);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[d.getMonth()] + ' ' + d.getFullYear();
}

function fmtName(slug) {
  return slug.split('-').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
}

async function ghFetch(path) {
  const r = await fetch('https://api.github.com/' + path, {
    headers: { Accept: 'application/vnd.github.v3+json' }
  });
  if (!r.ok) throw new Error('GitHub API error: ' + r.status);
  return r.json();
}

function buildToolCard(data) {
  const lang = data.language || 'Unknown';
  const color = LANG_COLORS[lang] || '#888';
  const a = document.createElement('a');
  a.href = data.html_url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'tool-card reveal';
  a.innerHTML =
    '<div class="tool-card-top">' +
      '<div class="tool-name">' + fmtName(data.name) + '</div>' +
      '<span class="tool-arrow">&#8599;</span>' +
    '</div>' +
    '<div class="tool-desc">' + (data.description || 'A ' + lang + ' utility.') + '</div>' +
    '<div class="tool-foot">' +
      '<div class="tool-lang">' +
        '<div class="lang-dot" style="background:' + color + ';"></div>' +
        '<span>' + lang + '</span>' +
      '</div>' +
      '<div class="tool-updated">' + fmtDate(data.pushed_at) + '</div>' +
    '</div>';
  return a;
}

function setLinuxYears() {
  const years = calcLinuxYears();
  const el = document.getElementById('stat-linux-years');
  if (el) el.innerHTML = years + '<sup>+</sup>';
}

async function loadProjectCount() {
  try {
    const user = await ghFetch('users/' + GH_USER);
    const el = document.getElementById('stat-projects');
    if (el && typeof user.public_repos === 'number') {
      el.textContent = user.public_repos - 1;
    }
  } catch (_) {}
}

async function loadScreenWatcher() {
  try {
    const data = await ghFetch('repos/' + GH_USER + '/ScreenWatcher');
    if (data.description) {
      const el = document.getElementById('sw-desc');
      if (el) el.textContent = data.description;
    }
    const stars = document.getElementById('sw-stars');
    if (stars) stars.textContent = data.stargazers_count + ' stars';
    const upd = document.getElementById('sw-updated');
    if (upd) upd.textContent = 'Updated ' + fmtDate(data.pushed_at);
    const lang = document.getElementById('sw-lang');
    if (lang && data.language) lang.textContent = data.language;
  } catch (_) {}
}

async function loadTools() {
  const grid = document.getElementById('tools-grid');
  let toolData;
  try {
    toolData = await Promise.all(TOOL_REPOS.map(function(r) { return ghFetch('repos/' + GH_USER + '/' + r); }));
  } catch (_) {
    toolData = FALLBACK_TOOLS;
  }
  grid.innerHTML = '';
  toolData.forEach(function(repo) {
    grid.appendChild(buildToolCard(repo));
  });
  observeReveal();
}

function observeReveal() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  const io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function(el) { io.observe(el); });
}

document.getElementById('sw-scroll-btn').addEventListener('click', function(e) {
  e.preventDefault();
  const target = document.getElementById('screenwatcher');
  const top = target.getBoundingClientRect().top + window.scrollY - 120;
  window.scrollTo({ top: top, behavior: 'smooth' });
});

document.getElementById('copy-btc-btn').addEventListener('click', function() {
  const btn = this;
  navigator.clipboard.writeText(BTC_ADDR).then(function() {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = 'Copy address';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(function() {
    btn.textContent = 'Copy manually above';
    setTimeout(function() { btn.textContent = 'Copy address'; }, 2500);
  });
});

setLinuxYears();
loadProjectCount();
loadScreenWatcher();
loadTools();
observeReveal();

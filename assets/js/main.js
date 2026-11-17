// ============================================================
// Running Text Banner — Typewriter effect
// ============================================================
const greetings = [
  "Hello",        // English
  "Xin chào",     // Vietnamese
  "你好",          // Chinese (Mandarin)
  "哈囉",          // Cantonese
  "こんにちは",     // Japanese
  "안녕하세요",     // Korean
  "Ciao",         // Italian
  "नमस्ते",        // Hindi
  "สวัสดี",        // Thai
  "Привет",       // Russian
  "سلام",         // Persian
  "Hallo",        // German
  "Cześć",        // Polish
  "Hola",         // Spanish
  "Bonjour",      // French
  "Olá",          // Portuguese
  "مرحبا",         // Arabic
  "שלום",          // Hebrew
  "Merhaba",      // Turkish
  "Kumusta",      // Tagalog (Philippines)
  "Привіт"        // Ukrainian
];
// Repeat the list so the line is long enough to fill wide screens
const bannerText = " " + Array(3).fill(greetings.join("  ·  ")).join("  ·  ") + " ";

const banner = document.getElementById('running-banner');
let charIndex = 0;

// Array.from keeps multi-codepoint characters (Hindi, Thai) intact
const bannerChars = Array.from(bannerText);

function typeBanner() {
  banner.textContent = bannerChars.slice(0, charIndex).join("");
  if (charIndex < bannerChars.length) {
    charIndex++;
    setTimeout(typeBanner, 90);
  }
  // otherwise stop: the full text stays static
}

typeBanner();

// ============================================================
// Sketchy Circle Hover Effect (for .circle-me elements)
// ============================================================
(function initSketchyCircle() {
  const DPR = window.devicePixelRatio || 1;

  function createCanvasFor(el) {
    const rect = el.getBoundingClientRect();
    const pad = 10;
    const elemW = Math.max(16, Math.round(rect.width + 35));
    const elemH = Math.max(16, Math.round(rect.height + 25));
    const canvasW = Math.round(elemW + pad * 2);
    const canvasH = Math.round(elemH + pad * 2);
    const canvas = document.createElement('canvas');
    canvas.className = 'circle-overlay';
    const left = rect.left + window.scrollX - pad - 15;
    const top = rect.top + window.scrollY - pad - 15;
    canvas.style.left = left + 'px';
    canvas.style.top = top + 'px';
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    canvas.width = Math.round(canvasW * DPR);
    canvas.height = Math.round(canvasH * DPR);
    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);
    return { canvas, ctx, w: canvasW, h: canvasH, pad, elemW, elemH };
  }

  function drawSketch(ctx, w, h, opts, elemW, elemH, progress, rotationRad) {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const rx = Math.max(3, elemW / 2 - opts.pad);
    const ry = Math.max(3, elemH / 2 - opts.pad);
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(38, 124, 185, 0.5)';

    const startAngle = -Math.PI / 2;
    const total = 2 * Math.PI;
    const endAngle = startAngle + total * Math.max(0, Math.min(1, progress));

    ctx.beginPath();
    if (ctx.ellipse) ctx.ellipse(cx, cy, rx, ry, rotationRad, startAngle, endAngle, false);
    else ctx.arc(cx, cy, Math.max(1, (rx + ry) / 2), startAngle, endAngle, false);
    ctx.stroke();

    if (progress >= 1) {
      const jitter = opts.jitter || 1.2;
      ctx.beginPath();
      const ox = (Math.random() - 0.5) * jitter;
      const oy = (Math.random() - 0.5) * jitter;
      const orx = rx + (Math.random() - 0.5) * (jitter * 0.6);
      const ory = ry + (Math.random() - 0.5) * (jitter * 0.6);
      const rot = rotationRad + (Math.random() - 0.5) * 0.03;
      if (ctx.ellipse) ctx.ellipse(cx + ox, cy + oy, orx, ory, rot, 0, Math.PI * 2);
      else ctx.arc(cx + ox, cy + oy, Math.max(1, (orx + ory) / 2), 0, Math.PI * 2);
      ctx.globalAlpha = 0.95;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  const active = new WeakMap();

  function start(el) {
    if (active.has(el)) return;
    const { canvas, ctx, w, h, pad, elemW, elemH } = createCanvasFor(el);
    document.body.appendChild(canvas);
    const opts = { pad: pad, lineWidth: 2, jitter: 1.2 };
    const rotationRad = -6 * Math.PI / 180;
    const startTime = performance.now();
    const duration = 360;
    let rafId = null;

    function frame(now) {
      const t = now || performance.now();
      const progress = Math.min(1, (t - startTime) / duration);
      drawSketch(ctx, w, h, opts, elemW, elemH, progress, rotationRad);
      rafId = requestAnimationFrame(frame);
    }
    frame();
    active.set(el, { canvas, rafId });
  }

  function stop(el) {
    const v = active.get(el);
    if (!v) return;
    cancelAnimationFrame(v.rafId);
    if (v.canvas && v.canvas.parentNode) v.canvas.parentNode.removeChild(v.canvas);
    active.delete(el);
  }

  document.addEventListener('mouseover', function (e) {
    const el = e.target.closest && e.target.closest('.circle-me');
    if (el) start(el);
  });
  document.addEventListener('mouseout', function (e) {
    const el = e.target.closest && e.target.closest('.circle-me');
    if (el) stop(el);
  });
})();

// ============================================================
// Papers Loading from CSV
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

  // Helper: highlight own name
  function highlightMe(authors) {
    if (!authors) return '';
    return authors
      .replace(/Kien Nguyen/g, '<span class="me">Kien Nguyen</span>');
  }

  // Build a featured card (for Recent Work)
  function buildCard(d) {
    const card = document.createElement('div');
    card.className = 'work-card ' + (d.class || '');

    let imgHtml = '';
    if (d.icon) {
      imgHtml = `<img class="work-card-img" src="${d.icon}" alt="${d.title || ''}">`;
    }

    let badgeClass = '';
    if (d.class) {
      const firstClass = d.class.trim().split(/\s+/)[0];
      if (firstClass) badgeClass = ' ' + firstClass;
    }

    let links = '';
    if (d.demo_link) {
      links += `<a href="${d.demo_link}" target="_blank">Project</a>&nbsp;|&nbsp;`;
    }
    if (d.paper_link) {
      links += `<a href="${d.paper_link}" target="_blank">Paper</a>`;
    }

    card.innerHTML = `
      ${imgHtml}
      <div class="work-card-body">
        <span class="conf-badge${badgeClass}">${d.conference || ''}</span>
        <div class="work-card-title">${d.title || ''}</div>
        <div class="work-card-authors">${highlightMe(d.authors)}</div>
        <div class="work-card-tldr">${d.tldr || ''}</div>
        <div class="work-card-links">${links}</div>
      </div>
    `;
    return card;
  }

  // Build a publication row (for All Publications)
  function buildPubRow(d) {
    const row = document.createElement('div');
    row.className = 'pub-row ' + (d.class || '');

    let badgeClass = '';
    if (d.class) {
      const firstClass = d.class.trim().split(/\s+/)[0];
      if (firstClass) badgeClass = ' ' + firstClass;
    }

    // Links: Demo | Presentation | Kaggle | Source code (| Paper if provided). Empty ones are skipped.
    const linkDefs = [
      ['Demo', d.demo_link],
      ['Presentation', d.presentation_link],
      ['Kaggle', d.kaggle_link],
      ['Source code', d.code_link],
      ['Paper', d.paper_link]
    ];
    const links = linkDefs
      .filter(([, url]) => url && url.trim())
      .map(([label, url]) => `<a href="${url.trim()}" target="_blank" rel="noopener">${label}</a>`)
      .join('&nbsp;|&nbsp;');

    let thumbHtml = '';
    if (d.icon) {
      thumbHtml = `<img class="pub-thumb" src="${d.icon}" alt="${d.title || ''}">`;
    }

    const authorsHtml = d.authors ? `<div class="pub-authors">${highlightMe(d.authors)}</div>` : '';

    row.innerHTML = `
      ${thumbHtml}
      <div class="pub-info">
        <span class="conf-badge${badgeClass}">${d.conference || ''}</span>
        <div class="pub-title">${d.title || ''}</div>
        ${authorsHtml}
        <div class="pub-tldr">${d.tldr || ''}</div>
        <div class="pub-links">${links}</div>
      </div>
    `;
    return row;
  }

  // Load papers from CSV
  Papa.parse('papers.csv', {
    download: true,
    header: true,
    complete: function (result) {
      const data = result.data.filter(d => d.title && d.title.trim() !== '');
      data.sort((a, b) => Number(a.id) - Number(b.id));

      const featuredContainer = document.getElementById('featured-research'); // optional
      const allContainer = document.getElementById('all-research');
      if (!allContainer) return;

      // Populate featured research (only if that container exists on the page)
      if (featuredContainer) {
        data.forEach(function (d) {
          if (d.feature && String(d.feature).toUpperCase() === 'TRUE') {
            featuredContainer.appendChild(buildCard(d));
          }
        });

        if (featuredContainer.children.length === 0) {
          featuredContainer.innerHTML = '<p class="pub-empty">Projects coming soon — stay tuned!</p>';
        }
      }

      // Render all publications
      function renderPapers(filterClasses) {
        // Remove existing paper rows
        allContainer.querySelectorAll('.pub-row').forEach(el => el.remove());

        let count = 0;
        data.forEach(function (d) {
          if (!d.title) return;
          if (!filterClasses) {
            allContainer.appendChild(buildPubRow(d));
            count++;
          } else {
            filterClasses.forEach(fc => {
              if (d.class && d.class.includes(fc)) {
                allContainer.appendChild(buildPubRow(d));
                count++;
              }
            });
          }
        });

        if (count === 0) {
          const empty = document.createElement('p');
          empty.className = 'pub-empty pub-row';
          empty.textContent = 'No publications yet — check back soon!';
          allContainer.appendChild(empty);
        }
      }

      renderPapers();

      // Filter button handlers
      document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('selected'));
          this.classList.add('selected');

          if (this.id === 'filter-all') renderPapers();
          else if (this.id === 'filter-ml') renderPapers(['ml']);
          else if (this.id === 'filter-stats') renderPapers(['stats']);
          else if (this.id === 'filter-vis') renderPapers(['vis']);
        });
      });
    }
  });
});

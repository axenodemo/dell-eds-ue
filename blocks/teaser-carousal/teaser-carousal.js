import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// ── CTA link builder ──────────────────────────────────────────────────────
function buildCtaLink(label, href) {
  const a = document.createElement('a');
  a.className = 'dc-cta-link';
  a.href = href;

  const span = document.createElement('span');
  span.textContent = label;
  a.appendChild(span);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'dc-cta-icon');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = '<path d="M9.29 6.71a1 1 0 000 1.41L13.17 12l-3.88 3.88a1 1 0 001.41 1.41l4.59-4.59a1 1 0 000-1.41L10.7 6.7a1 1 0 00-1.41.01z"/>';
  a.appendChild(svg);
  return a;
}

// ── Build one slide ───────────────────────────────────────────────────────
function buildSlide(row, index, total) {
  // Fixed schema: image(reference) | eyebrow(text) | headline(text) | description(text+links)
  const [imageCell, eyebrowCell, headlineCell, descriptionCell] = [...row.children];

  const slide = document.createElement('div');
  slide.className = 'dc-slide';
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${index + 1} of ${total}`);
  slide.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
  if (index === 0) slide.classList.add('dc-slide--active');

  moveInstrumentation(row, slide);

  // Image
  const imgWrap = document.createElement('div');
  imgWrap.className = 'dc-slide__image';
  const picture = imageCell?.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      img.closest('picture').replaceWith(optimizedPic);
    }
    imgWrap.appendChild(picture);
  }
  slide.appendChild(imgWrap);

  // White card
  const card = document.createElement('div');
  card.className = 'dc-slide__card';

  // Eyebrow — text field, plain text
  const eyebrowText = eyebrowCell?.textContent?.trim();
  if (eyebrowText) {
    const ew = document.createElement('p');
    ew.className = 'dc-card__eyebrow';
    ew.textContent = eyebrowText;
    card.appendChild(ew);
  }

  // Headline — text field, plain text
  const headlineText = headlineCell?.textContent?.trim();
  if (headlineText) {
    const h = document.createElement('h3');
    h.className = 'dc-card__headline';
    h.textContent = headlineText;
    card.appendChild(h);
  }

  // Description cell: contains body text paragraphs AND possibly button-container anchors (CTAs)
  // After decorateButtons(), <a> links in this cell are wrapped in <p class="button-container">
  // We separate plain text paragraphs from button-container paragraphs
  if (descriptionCell) {
    const bodyParas = [...descriptionCell.querySelectorAll(':scope > p')].filter(
      (p) => !p.classList.contains('button-container'),
    );
    const ctaParas = [...descriptionCell.querySelectorAll('p.button-container > a, :scope > a')];

    if (bodyParas.length > 0) {
      const bodyText = bodyParas.map((p) => p.textContent.trim()).join(' ').trim();
      if (bodyText) {
        const p = document.createElement('p');
        p.className = 'dc-card__body';
        p.textContent = bodyText;
        card.appendChild(p);
      }
    }

    // CTAs — build from anchor elements found in description cell
    if (ctaParas.length > 0) {
      const ctaWrap = document.createElement('div');
      ctaWrap.className = 'dc-card__ctas';
      ctaParas.forEach((anchor) => {
        const label = anchor.textContent.trim();
        const href = anchor.getAttribute('href') || '#';
        if (label && href) {
          ctaWrap.appendChild(buildCtaLink(label, href));
        }
      });
      card.appendChild(ctaWrap);
    }
  }

  slide.appendChild(card);
  return slide;
}

// ── State transition ──────────────────────────────────────────────────────
const TRANSITION_MS = 450;

function goToSlide(index, track, slides, dotEls, state) {
  if (state.transitioning) return;
  state.index = index;
  state.transitioning = true;

  track.classList.add('dc-track--sliding');
  track.style.transform = `translateX(-${index * 100}%)`;

  dotEls.forEach((dot, i) => {
    const active = i === index;
    dot.classList.toggle('dc-dot--active', active);
    dot.setAttribute('aria-selected', String(active));
    dot.setAttribute('tabindex', active ? '0' : '-1');
  });

  setTimeout(() => {
    track.classList.remove('dc-track--sliding');
    slides.forEach((s, i) => {
      const active = i === index;
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
      s.classList.toggle('dc-slide--active', active);
    });
    state.transitioning = false;
  }, TRANSITION_MS);
}

// ── Auto-slide ────────────────────────────────────────────────────────────
function setPlayBtnState(btn, playing) {
  btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  btn.setAttribute('aria-pressed', String(playing));
  const labelEl = btn.querySelector('.dc-play__label');
  const pathEl = btn.querySelector('.dc-play__path');
  if (labelEl) labelEl.textContent = playing ? 'Pause' : 'Play';
  if (pathEl) {
    pathEl.setAttribute(
      'd',
      playing
        ? 'M9 16h2V8H9v8zm4-8v8h2V8h-2z' // pause bars
        : 'M8 5v14l11-7z', // play triangle
    );
  }
}

function stopAutoSlide(state, playBtn) {
  clearInterval(state.timer);
  state.playing = false;
  if (playBtn) setPlayBtnState(playBtn, false);
}

function startAutoSlide(state, slides, track, dotEls, playBtn) {
  stopAutoSlide(state, playBtn);
  state.playing = true;
  setPlayBtnState(playBtn, true);
  state.timer = setInterval(() => {
    goToSlide((state.index + 1) % slides.length, track, slides, dotEls, state);
  }, 8000);
}

// ── Main decorate ─────────────────────────────────────────────────────────
export default function decorate(block) {
  // The teaser-carousal model has a single "container" root field (slides).
  // All item rows (teaser-carousal-slide) are direct children of block.
  // Each item row has 4 cells: image | eyebrow | headline | description
  const itemRows = [...block.children].filter(
    (row) =>
      row.children.length > 0 &&
      [...row.children].some((c) => c.children.length > 0 || c.textContent.trim() !== ''),
  );

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  // Stage
  const stage = document.createElement('div');
  stage.className = 'dc-stage';
  stage.setAttribute('aria-live', 'polite');

  const track = document.createElement('div');
  track.className = 'dc-track';

  const slides = itemRows.map((row, i, arr) => {
    const slide = buildSlide(row, i, arr.length);
    track.appendChild(slide);
    return slide;
  });

  stage.appendChild(track);

  // Prev / Next arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'dc-nav dc-nav--prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.textContent = '‹';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'dc-nav dc-nav--next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.textContent = '›';

  stage.appendChild(prevBtn);
  stage.appendChild(nextBtn);

  // Footer: dots + play button
  const footer = document.createElement('div');
  footer.className = 'dc-footer';

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'dc-dots';
  dotsWrap.setAttribute('role', 'tablist');
  dotsWrap.setAttribute('aria-label', 'Slide Navigation');

  const dotEls = slides.map((_, i) => {
    const btn = document.createElement('button');
    btn.className = `dc-dot${i === 0 ? ' dc-dot--active' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', `Go to slide ${i + 1} of ${slides.length}`);
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
    dotsWrap.appendChild(btn);
    return btn;
  });

  const playBtn = document.createElement('button');
  playBtn.className = 'dc-play';
  playBtn.setAttribute('aria-label', 'Play');
  playBtn.setAttribute('aria-pressed', 'false');
  playBtn.innerHTML = `
    <span class="dc-play__label">Play</span>
    <svg class="dc-play__icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <path class="dc-play__path" d="M8 5v14l11-7z" fill="currentColor"/>
    </svg>`;

  footer.appendChild(dotsWrap);
  footer.appendChild(playBtn);

  // Atomic replace — preserves UE instrumentation (moveInstrumentation called per slide in buildSlide)
  block.replaceChildren(stage, footer);

  // Wire interactions
  const state = {
    index: 0,
    playing: false,
    timer: null,
    transitioning: false,
  };

  dotEls.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i, track, slides, dotEls, state);
      stopAutoSlide(state, playBtn);
    });
  });

  prevBtn.addEventListener('click', () => {
    goToSlide((state.index - 1 + slides.length) % slides.length, track, slides, dotEls, state);
    stopAutoSlide(state, playBtn);
  });

  nextBtn.addEventListener('click', () => {
    goToSlide((state.index + 1) % slides.length, track, slides, dotEls, state);
    stopAutoSlide(state, playBtn);
  });

  playBtn.addEventListener('click', () => {
    if (state.playing) stopAutoSlide(state, playBtn);
    else startAutoSlide(state, slides, track, dotEls, playBtn);
  });

  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevBtn.click();
    else if (e.key === 'ArrowRight') nextBtn.click();
  });

  // Start auto-play
  startAutoSlide(state, slides, track, dotEls, playBtn);
}

import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  block.classList.add('hero-cards-category-grid');

  const rows = [...block.querySelectorAll(':scope > div')];

  const grid = document.createElement('div');
  grid.classList.add('hero-cards-category-grid-grid');

  rows.forEach((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];

    const card = document.createElement('a');
    card.classList.add('hero-cards-category-grid-card');

    // Each row = one card. Cols are: [image col, label+link col]
    // Adjust indices if your doc column order is different
    const imageCol = cols[0];
    const contentCol = cols[1] || cols[0];

    // --- Image ---
    const picture = imageCol?.querySelector('picture, img');
    const imgWrap = document.createElement('div');
    imgWrap.classList.add('hero-cards-category-grid-img-wrap');
    if (picture) {
      imgWrap.append(picture.cloneNode(true));
    }

    // --- Link ---
    const link = contentCol?.querySelector('a');
    if (link) card.href = link.href;

    // --- Label ---
    let labelText = '';

    // 1. Try anchor text inside headings/paragraphs
    [...(contentCol?.querySelectorAll('p, h1, h2, h3, h4, h5, h6') || [])].some((el) => {
      const anchor = el.querySelector('a');
      if (anchor && anchor.textContent.trim()) {
        labelText = anchor.textContent.trim();
        return true;
      }
      const text = [...el.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent.trim())
        .filter(Boolean)
        .join('');
      if (text) {
        labelText = text;
        return true;
      }
      return false;
    });

    // 2. Fallback: bare text nodes in contentCol
    if (!labelText) {
      labelText = [...(contentCol?.childNodes || [])]
        .filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim())
        .map((n) => n.textContent.trim())
        .join('');
    }

    // 3. Fallback: UE renders label as bare text, grab firstElementChild text
    if (!labelText) {
      labelText = contentCol?.firstElementChild?.textContent?.trim() || '';
    }

    const label = document.createElement('span');
    label.classList.add('hero-cards-category-grid-label');
    label.textContent = labelText;

    card.append(label, imgWrap);

    // ✅ KEY FIX: move instrumentation from ROW (not col)
    // data-aue-model="hero-card-item" lives on the row div, not the cell
    moveInstrumentation(row, card);

    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  block.classList.add('hero-cards-category-grid');

  const rows = [...block.querySelectorAll(':scope > div')];

  const grid = document.createElement('div');
  grid.classList.add('hero-cards-category-grid-grid');

  rows.forEach((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];

    // UE model field order = col[0]: label, col[1]: link, col[2]: image
    const labelCol = cols[0];
    const linkCol  = cols[1];
    const imageCol = cols[2];

    const card = document.createElement('a');
    card.classList.add('hero-cards-category-grid-card');

    // --- Label: read plain text, NOT anchor href ---
    const labelText = labelCol?.textContent?.trim() || '';

    // --- Link: read href from anchor inside linkCol ---
    const linkAnchor = linkCol?.querySelector('a');
    const linkHref = linkAnchor?.href
      || linkCol?.textContent?.trim()
      || '#';
    card.href = linkHref;

    // --- Image: UE stores DAM path as text, build img manually ---
    let imgEl = imageCol?.querySelector('picture, img');

    if (!imgEl) {
      // UE media/aem-content field stores raw DAM path as text
      const damPath = imageCol?.textContent?.trim();
      if (damPath && damPath.startsWith('/content/dam')) {
        const picture = document.createElement('picture');
        const img = document.createElement('img');
        img.src = damPath;
        img.alt = labelText;
        img.loading = 'lazy';
        picture.append(img);
        imgEl = picture;
      }
    }

    // --- Build card ---
    const label = document.createElement('span');
    label.classList.add('hero-cards-category-grid-label');
    label.textContent = labelText;

    const imgWrap = document.createElement('div');
    imgWrap.classList.add('hero-cards-category-grid-img-wrap');
    if (imgEl) imgWrap.append(imgEl.cloneNode(true));

    card.append(imgWrap, label);

    moveInstrumentation(row, card);
    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}
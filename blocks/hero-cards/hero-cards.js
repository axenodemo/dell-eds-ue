import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  block.classList.add('hero-cards-category-grid');

  const rows = [...block.querySelectorAll(':scope > div')];

  const grid = document.createElement('div');
  grid.classList.add('hero-cards-category-grid__grid');

  rows.forEach((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];

    cols.forEach((col) => {
      const card = document.createElement('a');
      card.classList.add('hero-cards-category-grid__card');

      const picture = col.querySelector('picture, img');
      const link = col.querySelector('a');
      if (link) card.href = link.href;

      let labelText = '';
      [...col.querySelectorAll('p, h1, h2, h3, h4, h5, h6')].some((el) => {
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
      if (!labelText) {
        labelText = [...col.childNodes]
          .filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim())
          .map((n) => n.textContent.trim())
          .join('');
      }

      // FIX 1: UE label field renders as bare text node, not inside <p> or <a>
      // the existing hunting above finds nothing, so this catches it
      if (!labelText) {
        labelText = col.firstElementChild?.textContent?.trim() || '';
      }

      const label = document.createElement('span');
      label.classList.add('hero-cards-category-grid__label');
      label.textContent = labelText;

      const imgWrap = document.createElement('div');
      imgWrap.classList.add('hero-cards-category-grid__img-wrap');
      if (picture) {
        imgWrap.append(picture.cloneNode(true));
      }

      card.append(label, imgWrap);

      // FIX 2: move UE instrumentation attributes (data-aue-*) from original
      // col div to the new card <a> so UE canvas click-to-edit works
      moveInstrumentation(col, card);

      grid.append(card);
    });
  });

  block.textContent = '';
  block.append(grid);
}

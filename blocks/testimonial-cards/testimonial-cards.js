export default function decorate(block) {
  const rows = [...block.children];

  let renderedCount = 0;

  rows.forEach((row) => {
    const [pictureCell,titleCell,descCell, linkCell] = row.children;

    const picture = pictureCell?.querySelector('picture, img') || null;
    const titleText = titleCell?.querySelector('p')?.textContent.trim() || '';
    const descText = descCell?.querySelector('p')?.textContent.trim() || '';
    const href = linkCell?.querySelector('a')?.getAttribute('href') || '#';

    if (!picture && !titleText && !descText) return;

    const inner = document.createElement('div');
    inner.classList.add('testimonial-cards-inner');
    if (picture) inner.appendChild(picture);

    const overlay = document.createElement('div');
    overlay.classList.add('testimonial-cards-overlay');

    const titleLink = document.createElement('a');
    titleLink.classList.add('testimonial-cards-title');
    titleLink.href = href;
    titleLink.textContent = titleText;
    overlay.appendChild(titleLink);

    if (descText) {
      const descEl = document.createElement('span');
      descEl.classList.add('testimonial-cards-desc');
      descEl.textContent = descText;
      overlay.appendChild(descEl);
    }

    inner.appendChild(overlay);
    row.innerHTML = '';
    row.appendChild(inner);

    row.addEventListener('click', (e) => {
      if (!e.target.closest('a')) window.location.href = href;
    });

    renderedCount += 1;
  });

  block.dataset.cards = renderedCount;
}

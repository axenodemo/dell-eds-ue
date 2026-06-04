function createCard({ picture, titleText, link }) {
  const card = document.createElement('article');
  card.className = 'dell-cards-card';

  const body = document.createElement('div');
  body.className = 'dell-cards-card-body';

  if (titleText) {
    const title = document.createElement('h3');
    title.textContent = titleText;
    body.append(title);
  }

  const spacer = document.createElement('div');
  spacer.className = 'dell-cards-spacer';
  body.append(spacer);

  if (link) body.append(link);
  if (picture) card.append(picture);

  card.append(body);
  return card;
}

function decorateLegacyCards(rows, cardsWrapper) {
  const imageCols = [...(rows[2]?.children || [])];
  const titleCols = [...(rows[3]?.children || [])];
  const linkCols = [...(rows[4]?.children || [])];

  imageCols.forEach((imgCol, index) => {
    cardsWrapper.append(createCard({
      picture: imgCol.querySelector('picture'),
      titleText: titleCols[index]?.textContent.trim(),
      link: linkCols[index]?.querySelector('a'),
    }));
  });

  rows[2]?.remove();
  rows[3]?.remove();
  rows[4]?.remove();
}

function decorateGroupedCards(rows, cardsWrapper) {
  [...(rows[2]?.children || [])].forEach((cardCell) => {
    const link = cardCell.querySelector('a');
    const titleText = [...cardCell.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .find(Boolean) || cardCell.querySelector('h1, h2, h3, h4, h5, h6, p')?.textContent.trim();

    cardsWrapper.append(createCard({
      picture: cardCell.querySelector('picture'),
      titleText,
      link,
    }));
  });

  rows[2]?.remove();
}

export default function decorate(block) {
  const rows = [...block.children];

  rows[0]?.classList.add('eyebrow');

  const headingText = rows[1]?.textContent.trim();
  if (headingText) {
    const heading = document.createElement('h2');
    heading.textContent = headingText;
    rows[1].replaceWith(heading);
  }

  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'dell-cards-list';

  if (rows[3]?.querySelector('picture') || rows[4]?.querySelector('a')) {
    decorateLegacyCards(rows, cardsWrapper);
  } else {
    decorateGroupedCards(rows, cardsWrapper);
  }

  if (cardsWrapper.children.length) block.append(cardsWrapper);

  const footerRow = rows.find((row) => row.isConnected && row.querySelector('a'));
  const footerAnchors = [...(footerRow?.querySelectorAll('a') || [])];

  if (footerAnchors.length) {
    const footerLinks = document.createElement('div');
    footerLinks.className = 'footer-links';
    footerAnchors.forEach((anchor) => footerLinks.append(anchor));
    footerRow.remove();
    block.append(footerLinks);
  }
}

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

function getCellText(cell) {
  return [...(cell?.childNodes || [])]
    .filter((node) => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE)
    .map((node) => node.textContent.trim())
    .find(Boolean);
}

function getCardTitle(row) {
  return [...row.children]
    .filter((cell) => !cell.querySelector('picture') && !cell.querySelector('a'))
    .map((cell) => getCellText(cell))
    .find(Boolean);
}

function decorateHeader(row) {
  const cells = [...row.children];

  row.classList.add('eyebrow');
  row.textContent = getCellText(cells[0]) || '';

  const headingText = getCellText(cells[1]);
  if (!headingText) return;

  const heading = document.createElement('h2');
  heading.textContent = headingText;
  row.after(heading);
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

function decorateItemCards(rows, cardsWrapper, footerLinks) {
  rows.forEach((row) => {
    const picture = row.querySelector('picture');
    const link = row.querySelector('a');

    if (picture) {
      cardsWrapper.append(createCard({
        picture,
        titleText: getCardTitle(row),
        link,
      }));
      row.remove();
      return;
    }

    if (link) {
      footerLinks.append(link);
      row.remove();
    }
  });
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
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'dell-cards-list';
  const footerLinks = document.createElement('div');
  footerLinks.className = 'footer-links';

  if (rows[0]?.children.length > 1 && !rows[0].querySelector('picture, a')) {
    decorateHeader(rows[0]);
  } else {
    rows[0]?.classList.add('eyebrow');

    const headingText = rows[1]?.textContent.trim();
    if (headingText) {
      const heading = document.createElement('h2');
      heading.textContent = headingText;
      rows[1].replaceWith(heading);
    }
  }

  if (rows[3]?.querySelector('picture') || rows[4]?.querySelector('a')) {
    decorateLegacyCards(rows, cardsWrapper);
  } else if (rows.some((row) => row.querySelector('picture'))) {
    decorateItemCards(rows.filter((row) => row.isConnected), cardsWrapper, footerLinks);
  } else {
    decorateGroupedCards(rows, cardsWrapper);
  }

  if (cardsWrapper.children.length) block.append(cardsWrapper);

  if (!footerLinks.children.length) {
    const footerRow = rows.find((row) => row.isConnected && row.querySelector('a'));
    const footerAnchors = [...(footerRow?.querySelectorAll('a') || [])];

    footerAnchors.forEach((anchor) => footerLinks.append(anchor));
    footerRow?.remove();
  }

  if (footerLinks.children.length) block.append(footerLinks);
}

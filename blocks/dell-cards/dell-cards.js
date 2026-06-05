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
  if (!cell) return '';

  const clone = cell.cloneNode(true);
  clone.querySelectorAll('picture, img, source, a').forEach((element) => element.remove());

  return clone.textContent.trim();
}

function getCardTitle(element) {
  return getCellText(element)
    || element.querySelector('h1, h2, h3, h4, h5, h6, p')?.textContent.trim();
}

function getTextValues(element) {
  const clone = element.cloneNode(true);
  clone.querySelectorAll('picture, img, source, a').forEach((child) => child.remove());

  return clone.textContent
    .split('\n')
    .map((text) => text.trim())
    .filter(Boolean);
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

function decorateCardRows(rows, cardsWrapper, footerLinks) {
  rows.forEach((row) => {
    if (!row.isConnected) return;

    const cardCells = [...row.children].filter((cell) => cell.querySelector('picture'));

    if (cardCells.length) {
      cardCells.forEach((cardCell) => {
        const pictures = [...cardCell.querySelectorAll('picture')];
        const links = [...cardCell.querySelectorAll('a')];
        const titles = getTextValues(cardCell);

        pictures.forEach((picture, index) => {
          cardsWrapper.append(createCard({
            picture,
            titleText: titles[index] || getCardTitle(cardCell),
            link: links[index],
          }));
        });
      });
      row.remove();
      return;
    }

    const links = [...row.querySelectorAll('a')];
    if (links.length) {
      links.forEach((link) => footerLinks.append(link));
      row.remove();
    }
  });
}

export default function decorate(block) {
  const rows = [...block.children];

  // HEADER
  const eyebrowRow = rows[0];
  const headingRow = rows[1];

  if (eyebrowRow) {
    eyebrowRow.classList.add('eyebrow');
  }

  if (headingRow) {
    const heading = document.createElement('h2');
    heading.textContent = headingRow.textContent.trim();
    headingRow.replaceWith(heading);
  }

  // CREATE CARD WRAPPER
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'dell-cards-list';

  // CARD ROWS
  const cardRows = rows.slice(2, 6);

  cardRows.forEach((row) => {
    const cols = [...row.children];

    if (cols.length < 3) return;

    const picture = cols[0].querySelector('picture');

    const titleText = cols[1].textContent.trim();

    const link = cols[2].querySelector('a');

    const article = document.createElement('article');
    article.className = 'dell-cards-card';

    // IMAGE
    if (picture) {
      article.append(picture.cloneNode(true));
    }

    // BODY
    const body = document.createElement('div');
    body.className = 'dell-cards-card-body';

    // TITLE
    const title = document.createElement('h3');
    title.textContent = titleText;

    body.append(title);

    // SPACER
    const spacer = document.createElement('div');
    spacer.className = 'dell-cards-spacer';

    body.append(spacer);

    // LINK
    if (link) {
      body.append(link.cloneNode(true));
    }

    article.append(body);

    cardsWrapper.append(article);
  });

  block.append(cardsWrapper);

  // FOOTER LINKS
  const footerLinks = document.createElement('div');
  footerLinks.className = 'footer-links';

  const footerRows = rows.slice(6);

  footerRows.forEach((row) => {
    const link = row.querySelector('a');

    if (link) {
      footerLinks.append(link.cloneNode(true));
    }
  });

  block.append(footerLinks);
}

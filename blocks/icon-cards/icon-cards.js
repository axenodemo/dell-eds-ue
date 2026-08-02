import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getAueProp(cell) {
  if (!cell) return null;
  if (cell.getAttribute('data-aue-prop')) return cell.getAttribute('data-aue-prop');
  if (cell.getAttribute('data-richtext-prop')) return cell.getAttribute('data-richtext-prop');
  const childWithProp = cell.querySelector('[data-aue-prop], [data-richtext-prop]');
  if (childWithProp) {
    return childWithProp.getAttribute('data-aue-prop') || childWithProp.getAttribute('data-richtext-prop');
  }
  return null;
}

export default function decorate(block) {
  const rows = [...block.children];

  const headerRows = [];
  const cardRows = [];

  rows.forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;

    const model = row.getAttribute('data-aue-model') || cell.getAttribute('data-aue-model');
    const prop = getAueProp(cell);

    if (model === 'iconcard') {
      cardRows.push(row);
    } else if (prop === 'eyebrow' || prop === 'title' || prop === 'description') {
      headerRows.push(row);
    } else if (cell.querySelector('.icon') || cell.querySelector('picture') || cell.querySelector('img')) {
      cardRows.push(row);
    } else {
      headerRows.push(row);
    }
  });

  let eyebrowRow = null;
  let titleRow = null;
  let descriptionRow = null;

  headerRows.forEach((row) => {
    const cell = row.firstElementChild;
    const prop = getAueProp(cell);
    if (prop === 'eyebrow') {
      eyebrowRow = row;
    } else if (prop === 'title') {
      titleRow = row;
    } else if (prop === 'description') {
      descriptionRow = row;
    }
  });

  const unassignedHeaderRows = headerRows.filter(
    (row) => row !== eyebrowRow && row !== titleRow && row !== descriptionRow,
  );

  unassignedHeaderRows.forEach((row) => {
    const cell = row.firstElementChild;
    if (cell.querySelector('h1, h2, h3, h4, h5, h6')) {
      if (!titleRow) {
        titleRow = row;
      }
    }
  });

  const remainingUnassigned = unassignedHeaderRows.filter((row) => row !== titleRow);
  if (remainingUnassigned.length > 0) {
    if (!eyebrowRow && remainingUnassigned.length >= 2) {
      eyebrowRow = remainingUnassigned.shift();
    }
    if (!titleRow && remainingUnassigned.length > 0) {
      titleRow = remainingUnassigned.shift();
    }
    if (!descriptionRow && remainingUnassigned.length > 0) {
      descriptionRow = remainingUnassigned.shift();
    }
  }

  const container = document.createElement('div');
  container.className = 'icon-cards-inner';

  const headerContainer = document.createElement('div');
  headerContainer.className = 'icon-cards-header';

  if (eyebrowRow) {
    const eyebrowDiv = document.createElement('div');
    eyebrowDiv.className = 'icon-cards-eyebrow';
    moveInstrumentation(eyebrowRow.firstElementChild, eyebrowDiv);
    eyebrowDiv.textContent = eyebrowRow.textContent.trim();
    headerContainer.append(eyebrowDiv);
  }

  if (titleRow) {
    const titleCell = titleRow.firstElementChild;
    const existingHeading = titleCell.querySelector('h1, h2, h3, h4, h5, h6');
    let titleEl;
    if (existingHeading) {
      titleEl = document.createElement(existingHeading.tagName.toLowerCase());
      titleEl.textContent = existingHeading.textContent.trim();
    } else {
      titleEl = document.createElement('h2');
      titleEl.textContent = titleRow.textContent.trim();
    }
    titleEl.className = 'icon-cards-title';
    moveInstrumentation(titleCell, titleEl);
    headerContainer.append(titleEl);
  }

  if (descriptionRow) {
    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'icon-cards-description';
    moveInstrumentation(descriptionRow.firstElementChild, descriptionDiv);
    descriptionDiv.innerHTML = descriptionRow.firstElementChild.innerHTML;
    headerContainer.append(descriptionDiv);
  }

  if (headerContainer.children.length > 0) {
    container.append(headerContainer);
  }

  const ul = document.createElement('ul');
  ul.className = 'icon-cards-list';

  cardRows.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'icon-cards-item';
    moveInstrumentation(row, li);

    const cell = row.firstElementChild;
    const cardImage = document.createElement('div');
    cardImage.className = 'icon-cards-card-image';

    const cardBody = document.createElement('div');
    cardBody.className = 'icon-cards-card-body';

    if (cell) {
      moveInstrumentation(cell, cardBody);

      const picture = cell.querySelector('picture');
      const icon = cell.querySelector('.icon');
      const img = cell.querySelector('img');

      let mediaNode = null;

      if (picture) {
        mediaNode = picture;
      } else if (icon) {
        mediaNode = icon;
      } else if (img) {
        mediaNode = img;
      }

      if (mediaNode) {
        const parent = mediaNode.parentNode;
        if (parent) {
          parent.removeChild(mediaNode);
        }

        if (mediaNode.tagName === 'PICTURE') {
          const innerImg = mediaNode.querySelector('img');
          if (innerImg) {
            const optimizedPic = createOptimizedPicture(innerImg.src, innerImg.alt || '', false, [{ width: '750' }]);
            moveInstrumentation(innerImg, optimizedPic.querySelector('img'));
            cardImage.append(optimizedPic);
          } else {
            cardImage.append(mediaNode);
          }
        } else if (mediaNode.tagName === 'IMG') {
          const optimizedPic = createOptimizedPicture(mediaNode.src, mediaNode.alt || '', false, [{ width: '750' }]);
          cardImage.append(optimizedPic);
        } else {
          cardImage.append(mediaNode);
        }
      }

      cardBody.innerHTML = cell.innerHTML;

      cardBody.querySelectorAll('p').forEach((p) => {
        if (!p.textContent.trim() && !p.querySelector('a, img, svg, span')) {
          p.remove();
        }
      });
    }

    li.append(cardImage, cardBody);
    ul.append(li);
  });

  if (ul.children.length > 0) {
    container.append(ul);
  }

  block.replaceChildren(container);
  decorateIcons(block);
}

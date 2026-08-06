import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  const container = document.createElement('div');
  container.className = 'feature-card-inner';

  const content = document.createElement('div');
  content.className = 'feature-card-content';

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'feature-card-image';

  const buttonsWrapper = document.createElement('div');
  buttonsWrapper.className = 'feature-card-buttons';

  const iconsWrapper = document.createElement('div');
  iconsWrapper.className = 'feature-card-icons';

  let title = null;
  let description = null;
  const buttons = [];
  const iconsData = [];
  let image = null;

  let imageCell = null;
  let titleCell = null;
  let descriptionCell = null;

  const remainingRows = [];
  rows.forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;

    if (cell.querySelector('picture')) {
      image = cell.querySelector('picture');
      imageCell = cell;
      return;
    }

    if (cell.querySelector('h1, h2, h3, h4, h5, h6')) {
      title = cell.querySelector('h1, h2, h3, h4, h5, h6');
      titleCell = cell;
      return;
    }

    const link = cell.querySelector('a');
    if (link && cell.textContent.trim() === link.textContent.trim()) {
      const isPrimary = cell.querySelector('strong');
      const isSecondary = cell.querySelector('em');

      const text = link.textContent.trim();
      const hasTextArrow = text.includes('→') || text.includes('->') || text.includes('>');
      const hasIconArrow = cell.querySelector('.icon') !== null;

      let type = 'link';

      if (hasTextArrow || hasIconArrow) {
        type = 'link';
      } else if (isPrimary) {
        type = 'primary';
      } else if (isSecondary) {
        type = 'secondary';
      } else {
        type = buttons.length === 0 ? 'primary' : 'secondary';
      }

      buttons.push({ link, type, cell });
      return;
    }

    remainingRows.push(row);
  });

  const textRows = [];
  remainingRows.forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell.querySelector('.icon')) {
      textRows.push(row);
    }
  });

  if (!title && textRows.length > 0) {
    const titleRow = textRows.shift();
    title = document.createElement('h3');
    title.textContent = titleRow.textContent.trim();
    titleCell = titleRow.firstElementChild;
  }

  if (!description && textRows.length > 0) {
    const descRow = textRows.shift();
    description = document.createElement('p');
    description.textContent = descRow.textContent.trim();
    descriptionCell = descRow.firstElementChild;
  }

  remainingRows.forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell || !cell.querySelector('.icon')) return;

    const iconSpans = [...cell.querySelectorAll('.icon')];
    if (iconSpans.length > 0) {
      iconSpans.forEach((iconSpan) => {
        const item = iconSpan.closest('p, div');
        if (!item || item === cell) return;

        let label = item.textContent.trim();
        if (!label) {
          const childItems = [...cell.querySelectorAll('p, div')].filter(
            (el) => el.parentElement === cell || el.parentElement.parentElement === cell,
          );
          const idx = childItems.indexOf(item);
          const prevItem = childItems[idx - 1];
          if (prevItem && !prevItem.querySelector('.icon')) {
            label = prevItem.textContent.trim();
          }
        }
        iconsData.push({ iconSpan, label, cell: item });
      });
    } else {
      const iconSpan = cell.querySelector('.icon');
      let label = cell.textContent.trim();
      if (!label) {
        const originalIndex = rows.indexOf(row);
        if (originalIndex > 0) {
          const prevRow = rows[originalIndex - 1];
          const prevCell = prevRow ? prevRow.firstElementChild : null;
          if (prevCell && !prevCell.querySelector('picture, a, h1, h2, h3, h4, h5, h6, .icon')) {
            label = prevCell.textContent.trim();
          }
        }
      }
      iconsData.push({ iconSpan, label, cell });
    }
  });

  if (title) {
    title.className = 'feature-card-title';
    if (titleCell) moveInstrumentation(titleCell, title);
    content.append(title);
  }

  if (description) {
    description.className = 'feature-card-description';
    if (descriptionCell) moveInstrumentation(descriptionCell, description);
    content.append(description);
  }

  buttons.forEach(({ link, type, cell }) => {
    if (type === 'primary') {
      link.className = 'feature-card-btn primary';
    } else if (type === 'secondary') {
      link.className = 'feature-card-btn secondary';
    } else {
      link.className = 'feature-card-link';
    }
    if (cell) moveInstrumentation(cell, link);
    buttonsWrapper.append(link);
  });
  if (buttonsWrapper.children.length > 0) {
    content.append(buttonsWrapper);
  }

  iconsData.forEach(({ iconSpan, label, cell }) => {
    const iconItem = document.createElement('div');
    iconItem.className = 'feature-card-icon-item';
    if (cell) moveInstrumentation(cell, iconItem);

    if (iconSpan) {
      iconItem.append(iconSpan);
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'feature-card-icon-label';
    labelSpan.textContent = label;
    iconItem.append(labelSpan);

    iconsWrapper.append(iconItem);
  });
  if (iconsWrapper.children.length > 0) {
    content.append(iconsWrapper);
  }

  if (image) {
    const img = image.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]);
      if (imageCell) {
        moveInstrumentation(imageCell, optimizedPic.querySelector('img'));
      }
      imageWrapper.append(optimizedPic);
    }
  }

  container.append(imageWrapper, content);
  block.replaceChildren(container);

  decorateIcons(block);
}

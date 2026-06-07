export default function decorate(block) {
  const textCells = block.children;
  const eyebrowText = textCells.length > 0 ? textCells[0] : null;
  const titleText = textCells.length > 1 ? textCells[1] : null;

  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'ts-container';

  const row = document.createElement('div');
  row.className = 'ts-row';

  if (eyebrowText) {
    const eyebrow = document.createElement('h3');
    eyebrow.className = 'ts-eyebrow';
    eyebrow.textContent = eyebrowText.textContent;
    row.append(eyebrow);
  }

  if (titleText) {
    const title = document.createElement('h1');
    title.className = 'ts-title';
    title.textContent = titleText.textContent;
    row.append(title);
  }

  container.append(row);
  block.append(container);
}

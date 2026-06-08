export default function decorate(block) {
  const rows = [...block.children];

  const headerWrap = document.createElement('div');
  headerWrap.className = 'counter-header';

  const itemsWrap = document.createElement('div');
  itemsWrap.className = 'counter-items';

  rows.forEach((row) => {
    if (row.children.length >= 2) {
      // Counter item row — cells are [label, value, footnote]
      const valueCell = row.children[1];
      if (valueCell) {
        const text = valueCell.textContent.trim();
        if (text) {
          const h2 = document.createElement('h2');
          h2.textContent = text;
          h2.classList.add('animate-here');
          valueCell.replaceChildren(h2);
          observeCounter(h2);
        }
      }
      itemsWrap.appendChild(row);
    } else {
      // Header row — title or description (single cell)
      headerWrap.appendChild(row);
    }
  });

  block.replaceChildren();
  if (headerWrap.children.length > 0) block.appendChild(headerWrap);
  block.appendChild(itemsWrap);
}

function observeCounter(el) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(el);
        obs.unobserve(el);
      }
    });
  }, {
    threshold: 0.4,
  });

  observer.observe(el);
}

function animateCounter(el, duration = 1500) {
  if (!el) return;

  const text = el.textContent.trim();
  const match = text.match(/^(\D*)([\d,.]+)(.*)$/);
  if (!match) return;

  const prefix = match[1];
  const numberPart = match[2];
  const suffix = match[3];

  const endValue = Number.parseFloat(numberPart.replaceAll(',', ''));
  const hasDecimal = numberPart.includes('.');

  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;

    const progress = timestamp - startTime;
    const progressRatio = Math.min(progress / duration, 1);
    const eased = 1 - Math.pow(1 - progressRatio, 3);
    const currentValue = endValue * eased;

    el.textContent = prefix + formatNumber(currentValue, hasDecimal) + suffix;

    if (progress < duration) {
      requestAnimationFrame(animate);
    } else {
      el.textContent = prefix + formatNumber(endValue, hasDecimal) + suffix;
    }
  }

  requestAnimationFrame(animate);
}

function formatNumber(value, hasDecimal) {
  return hasDecimal
    ? value.toFixed(1)
    : Math.floor(value).toLocaleString();
}

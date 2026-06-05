export default function decorate(block) {
  // Expected block structure (from UE model fields, each field = one row):
  // Row 0: video (reference — link to .mp4)
  // Row 1: eyebrow (text)
  // Row 2: heading (text)
  // Row 3: text (richtext)
  // Row 4: ctaLabel (text)
  // Row 5: ctaUrl (text)
  // Row 6: link1Label (text)
  // Row 7: link1Url (text)
  // Row 8: link2Label (text)
  // Row 9: link2Url (text)

  const rows = [...block.children];

  // Helper: get plain text content from a row
  const getText = (row) => row?.querySelector('div')?.textContent?.trim() || row?.textContent?.trim();

  // --- Video ---
  const videoLink = rows[0]?.querySelector('a')?.href;
  const video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.className = 'video-hero__video';
  if (videoLink) {
    const source = document.createElement('source');
    source.src = videoLink;
    source.type = 'video/mp4';
    video.appendChild(source);
  }

  // --- Overlay content wrapper ---
  const overlay = document.createElement('div');
  overlay.className = 'video-hero__overlay';

  // Eyebrow (row 1)
  const eyebrowText = getText(rows[1]);
  if (eyebrowText) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'video-hero__eyebrow';
    eyebrow.textContent = eyebrowText;
    overlay.appendChild(eyebrow);
  }

  // Heading (row 2)
  const headingEl = rows[2]?.querySelector('h1, h2, h3, p');
  if (headingEl) {
    headingEl.className = 'video-hero__heading';
    overlay.appendChild(headingEl);
  }

  // Body text (row 3)
  const bodyEl = rows[3];
  if (bodyEl) {
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'video-hero__body';
    [...bodyEl.querySelectorAll('p')].forEach((p) => bodyDiv.appendChild(p));
    overlay.appendChild(bodyDiv);
  }

  // --- CTAs wrapper ---
  const ctasDiv = document.createElement('div');
  ctasDiv.className = 'video-hero__ctas';

  // Primary CTA — label (row 4) + url (row 5) are separate text fields
  const ctaLabel = getText(rows[4]);
  const ctaUrl = getText(rows[5]);
  if (ctaLabel && ctaUrl) {
    const primaryAnchor = document.createElement('a');
    primaryAnchor.href = ctaUrl;
    primaryAnchor.className = 'video-hero__btn-primary button';
    const icon = document.createElement('span');
    icon.className = 'video-hero__play-icon';
    icon.setAttribute('aria-hidden', 'true');
    primaryAnchor.appendChild(icon);
    primaryAnchor.appendChild(document.createTextNode(ctaLabel));
    ctasDiv.appendChild(primaryAnchor);
  }

  // Secondary links — each is a label+url pair
  const secLinksDiv = document.createElement('div');
  secLinksDiv.className = 'video-hero__secondary-links';

  [[rows[6], rows[7]], [rows[8], rows[9]]].forEach(([labelRow, urlRow]) => {
    const label = getText(labelRow);
    const url = getText(urlRow);
    if (label && url) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.className = 'video-hero__link-secondary';
      anchor.textContent = label;
      secLinksDiv.appendChild(anchor);
    }
  });

  if (secLinksDiv.children.length) ctasDiv.appendChild(secLinksDiv);
  overlay.appendChild(ctasDiv);

  // --- Assemble ---
  block.innerHTML = '';
  block.appendChild(video);
  block.appendChild(overlay);
}

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
  video.className = 'video-hero-video';
  if (videoLink) {
    const source = document.createElement('source');
    source.src = videoLink;
    source.type = 'video/mp4';
    video.appendChild(source);
  }

  // --- Overlay content wrapper ---
  const overlay = document.createElement('div');
  overlay.className = 'video-hero-overlay';

  // Eyebrow (row 1)
  const eyebrowText = getText(rows[1]);
  if (eyebrowText) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'video-hero-eyebrow';
    eyebrow.textContent = eyebrowText;
    overlay.appendChild(eyebrow);
  }

  // Heading (row 2)
  const headingEl = rows[2]?.querySelector('h1, h2, h3, p');
  if (headingEl) {
    headingEl.className = 'video-hero-heading';
    overlay.appendChild(headingEl);
  }

  // Body text (row 3)
  const bodyEl = rows[3];
  if (bodyEl) {
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'video-hero-body';
    [...bodyEl.querySelectorAll('p')].forEach((p) => bodyDiv.appendChild(p));
    overlay.appendChild(bodyDiv);
  }

  // --- CTAs wrapper ---
  const ctasDiv = document.createElement('div');
  ctasDiv.className = 'video-hero-ctas';

  // Primary CTA — label (row 4) + url (row 5) are separate text fields
  const ctaLabel = getText(rows[4]);
  const ctaUrl = getText(rows[5]);
  if (ctaLabel && ctaUrl) {
    const primaryAnchor = document.createElement('a');
    primaryAnchor.href = ctaUrl;
    primaryAnchor.className = 'video-hero-btn-primary button';
    primaryAnchor.setAttribute('aria-label', ctaLabel);
    const icon = document.createElement('span');
    icon.className = 'video-hero-play-icon';
    icon.setAttribute('aria-hidden', 'true');
    primaryAnchor.appendChild(icon);
    primaryAnchor.appendChild(document.createTextNode(ctaLabel));
    ctasDiv.appendChild(primaryAnchor);

    // Open video in a modal on click
    primaryAnchor.addEventListener('click', (e) => {
      e.preventDefault();

      const modal = document.createElement('div');
      modal.className = 'video-hero-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Video player');

      const modalInner = document.createElement('div');
      modalInner.className = 'video-hero-modal-inner';

      const modalVideo = document.createElement('video');
      modalVideo.controls = true;
      modalVideo.autoplay = true;
      modalVideo.className = 'video-hero-modal-video';
      const src = document.createElement('source');
      src.src = ctaUrl;
      src.type = 'video/mp4';
      modalVideo.appendChild(src);

      const closeBtn = document.createElement('button');
      closeBtn.className = 'video-hero-modal-close';
      closeBtn.setAttribute('aria-label', 'Close video');
      closeBtn.textContent = '✕';

      const close = () => {
        modalVideo.pause();
        modal.remove();
      };

      const onKeyDown = (ev) => { if (ev.key === 'Escape') close(); };

      closeBtn.addEventListener('click', close);
      modal.addEventListener('click', (ev) => { if (ev.target === modal) close(); });
      document.addEventListener('keydown', onKeyDown);

      modalInner.appendChild(closeBtn);
      modalInner.appendChild(modalVideo);
      modal.appendChild(modalInner);
      document.body.appendChild(modal);
      modalVideo.focus();
    });
  }

  // Secondary links — each is a label+url pair
  const secLinksDiv = document.createElement('div');
  secLinksDiv.className = 'video-hero-secondary-links';

  [[rows[6], rows[7]], [rows[8], rows[9]]].forEach(([labelRow, urlRow]) => {
    const label = getText(labelRow);
    const url = getText(urlRow);
    if (label && url) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.className = 'video-hero-link-secondary';
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

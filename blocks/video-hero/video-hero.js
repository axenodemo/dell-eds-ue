export default function decorate(block) {
  // Block structure (4 cells):
  // Row 0: video    — reference to .mp4
  // Row 1: eyebrow  — short text
  // Row 2: heading  — heading or paragraph
  // Row 3: text     — richtext: body paragraphs + links
  //                   First link → primary CTA button (opens video in modal)
  //                   Remaining links → secondary text links

  const rows = [...block.children];
  const getText = (row) => row?.querySelector('div')?.textContent?.trim() || row?.textContent?.trim();

  // --- Background video ---
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

  // --- Overlay ---
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

  // Body + links (row 3 richtext)
  const textEl = rows[3];
  if (textEl) {
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'video-hero-body';
    const links = [...(textEl.querySelectorAll('a') || [])];

    // Paragraphs without links → body copy
    [...textEl.querySelectorAll('p')].forEach((p) => {
      if (!p.querySelector('a')) bodyDiv.appendChild(p);
    });
    if (bodyDiv.children.length) overlay.appendChild(bodyDiv);

    const ctasDiv = document.createElement('div');
    ctasDiv.className = 'video-hero-ctas';

    // First link → primary CTA button
    const [primaryLink, ...secondaryLinks] = links;
    if (primaryLink) {
      const primaryAnchor = document.createElement('a');
      primaryAnchor.href = primaryLink.href;
      primaryAnchor.className = 'video-hero-btn-primary button';
      primaryAnchor.setAttribute('aria-label', primaryLink.textContent.trim());
      const icon = document.createElement('span');
      icon.className = 'video-hero-play-icon';
      icon.setAttribute('aria-hidden', 'true');
      primaryAnchor.appendChild(icon);
      primaryAnchor.appendChild(document.createTextNode(primaryLink.textContent.trim()));
      ctasDiv.appendChild(primaryAnchor);

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
        src.src = primaryAnchor.href;
        src.type = 'video/mp4';
        modalVideo.appendChild(src);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'video-hero-modal-close';
        closeBtn.setAttribute('aria-label', 'Close video');
        closeBtn.textContent = '✕';

        const close = () => {
          modalVideo.pause();
          modal.remove();
          document.removeEventListener('keydown', onKeyDown);
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

    // Remaining links → secondary text links
    if (secondaryLinks.length) {
      const secLinksDiv = document.createElement('div');
      secLinksDiv.className = 'video-hero-secondary-links';
      secondaryLinks.forEach((link) => {
        const anchor = document.createElement('a');
        anchor.href = link.href;
        anchor.className = 'video-hero-link-secondary';
        anchor.textContent = link.textContent.trim();
        secLinksDiv.appendChild(anchor);
      });
      ctasDiv.appendChild(secLinksDiv);
    }

    overlay.appendChild(ctasDiv);
  }

  block.innerHTML = '';
  block.appendChild(video);
  block.appendChild(overlay);
}

export default function decorate(block) {
  // Expected block structure (from Google Doc / UE):
  // Row 1: video (link to .mp4)
  // Row 2: eyebrow label
  // Row 3: heading
  // Row 4: body text
  // Row 5: primary CTA button
  // Row 6: secondary link 1
  // Row 7: secondary link 2

  const rows = [...block.children];

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

  // Eyebrow (row 2)
  const eyebrowText = rows[1]?.textContent?.trim();
  if (eyebrowText) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'video-hero__eyebrow';
    eyebrow.textContent = eyebrowText;
    overlay.appendChild(eyebrow);
  }

  // Heading (row 3)
  const headingEl = rows[2]?.querySelector('h1, h2, h3, p');
  if (headingEl) {
    headingEl.className = 'video-hero__heading';
    overlay.appendChild(headingEl);
  }

  // Body text (row 4)
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

  // Primary CTA button (row 5)
  const primaryAnchor = rows[4]?.querySelector('a');
  if (primaryAnchor) {
    primaryAnchor.className = 'video-hero__btn-primary button';
    const icon = document.createElement('span');
    icon.className = 'video-hero__play-icon';
    icon.setAttribute('aria-hidden', 'true');
    primaryAnchor.prepend(icon);
    ctasDiv.appendChild(primaryAnchor);
  }

  // Secondary links wrapper
  const secLinksDiv = document.createElement('div');
  secLinksDiv.className = 'video-hero__secondary-links';

  [rows[5], rows[6]].forEach((row) => {
    const anchor = row?.querySelector('a');
    if (anchor) {
      anchor.className = 'video-hero__link-secondary';
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

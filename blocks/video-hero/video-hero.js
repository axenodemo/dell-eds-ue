export default function decorate(block) {
  // Expected block structure (from Google Doc / UE):
  // Row 1: video (link to .mp4)
  // Row 2: heading
  // Row 3: text + button

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

  // Heading (row 2)
  const headingEl = rows[1]?.querySelector('h1, h2, h3, p');
  if (headingEl) {
    headingEl.className = 'video-hero__heading';
    overlay.appendChild(headingEl);
  }

  // Text + button (row 3)
  const contentEl = rows[2];
  if (contentEl) {
    const textDiv = document.createElement('div');
    textDiv.className = 'video-hero__content';
    [...contentEl.querySelectorAll('p')].forEach((p) => {
      // Wrap any <a> as a button
      const anchor = p.querySelector('a');
      if (anchor) {
        anchor.className = 'video-hero__cta button';
      }
      textDiv.appendChild(p);
    });
    overlay.appendChild(textDiv);
  }

  // --- Assemble ---
  block.innerHTML = '';
  block.appendChild(video);
  block.appendChild(overlay);
}
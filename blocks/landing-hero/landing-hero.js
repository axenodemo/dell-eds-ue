export default function decorate(block) {
  const slideRows = [...block.children];

  block.innerHTML = "";

  const carousel = document.createElement("section");
  carousel.className = "hero-carousel-dell-hero-block";

  const slides = slideRows.map((row, index) => {
    const allRows = [...row.querySelectorAll(":scope > div")];

    // ── Extract images ────────────────────────────────────────────────
    const pictures = [...row.querySelectorAll("picture")];
    const desktopImg = pictures[0]?.querySelector("img")?.src || "";
    const mobileImg = pictures[1]?.querySelector("img")?.src || "";

    // ── Extract text-only rows (no picture inside) ────────────────────
    const textRows = allRows.filter((r) => {
      return !r.querySelector("picture") && r.textContent.trim().length > 0;
    });

    const getText = (r) => r?.textContent?.trim() || "";

    // ── Extract anchor tags for URL only (not label) ──────────────────
    // aem-content fields render as <a href="...">url-path</a>
    // We use text fields for labels and anchor href for URLs
    const anchors = [...row.querySelectorAll("a")];
    const primaryLink = anchors[0]?.getAttribute("href") || "#";
    const secondaryLink = anchors[1]?.getAttribute("href") || "#";

    // ── Map text rows to fields ───────────────────────────────────────
    // Order matches component-models.json field order:
    // imageAlt(0) → skipped if blank, eyebrow(1), title(2), description(3),
    // primaryButtonText(4), secondaryButtonText(5)
    // Filter out rows that look like URLs (aem-content renders URL as text too)
    const isUrl = (text) => text.startsWith("/") || text.startsWith("http");
    const cleanTextRows = textRows.filter((r) => !isUrl(getText(r)));

    const eyebrow = getText(cleanTextRows[0]);
    const title = getText(cleanTextRows[1]);
    const description = getText(cleanTextRows[2]);
    const primaryButtonText = getText(cleanTextRows[3]);
    const secondaryButtonText = getText(cleanTextRows[4]);

    // ── Theme ─────────────────────────────────────────────────────────
    const theme =
      index % 2 === 0
        ? "dark-theme-dell-hero-block"
        : "light-theme-dell-hero-block";

    // ── Build slide ───────────────────────────────────────────────────
    const slideEl = document.createElement("div");
    slideEl.className = `hero-slide-dell-hero-block ${index === 0 ? "active" : ""} ${theme}`;

    slideEl.innerHTML = `
      <div class="hero-content-dell-hero-block">
        ${eyebrow ? `<p class="eyebrow-dell-hero-block">${eyebrow}</p>` : ""}
        ${title ? `<h1 class="title-dell-hero-block">${title}</h1>` : ""}
        ${description ? `<p class="desc-dell-hero-block">${description}</p>` : ""}
        <div class="btn-wrap-dell-hero-block">
          ${primaryButtonText ? `<a href="${primaryLink}"   class="primary-btn-dell-hero-block">${primaryButtonText}</a>` : ""}
          ${secondaryButtonText ? `<a href="${secondaryLink}" class="outline-btn-dell-hero-block">${secondaryButtonText}</a>` : ""}
        </div>
      </div>
      <div class="hero-image-dell-hero-block">
        <picture>
          ${mobileImg ? `<source media="(max-width: 1023px)" srcset="${mobileImg}" />` : ""}
          <img
            src="${desktopImg}"
            alt="${title || "Hero Banner"}"
            loading="${index === 0 ? "eager" : "lazy"}"
          />
        </picture>
      </div>
    `;

    carousel.appendChild(slideEl);
    return slideEl;
  });

  // ── Controls ──────────────────────────────────────────────────────────
  const controls = document.createElement("div");
  controls.className = "carousel-controls-dell-hero-block";
  controls.innerHTML = `
    <div class="controls-group-dell-hero-block">
      <button class="nav-btn-dell-hero-block prev-dell-hero-block" aria-label="Previous slide">&#8592;</button>
      <div class="slide-count-dell-hero-block">
        <span class="current-slide-dell-hero-block">1</span>/${slides.length}
      </div>
      <button class="nav-btn-dell-hero-block next-dell-hero-block" aria-label="Next slide">&#8594;</button>
    </div>
    <button class="pause-btn-dell-hero-block" aria-label="Pause autoplay">Pause ||</button>
  `;

  carousel.appendChild(controls);
  block.appendChild(carousel);

  // ── Interaction ───────────────────────────────────────────────────────
  const heroSlides = [...block.querySelectorAll(".hero-slide-dell-hero-block")];
  const nextBtn = block.querySelector(".next-dell-hero-block");
  const prevBtn = block.querySelector(".prev-dell-hero-block");
  const pauseBtn = block.querySelector(".pause-btn-dell-hero-block");
  const currentSlideEl = block.querySelector(".current-slide-dell-hero-block");

  let current = 0;
  let autoPlay = true;

  function showSlide(index) {
    heroSlides.forEach((s) => s.classList.remove("active"));
    heroSlides[index].classList.add("active");
    currentSlideEl.textContent = index + 1;
    current = index;
  }

  function next() {
    showSlide((current + 1) % heroSlides.length);
  }
  function prev() {
    showSlide((current - 1 + heroSlides.length) % heroSlides.length);
  }

  nextBtn.addEventListener("click", () => {
    next();
    autoPlay = false;
    pauseBtn.textContent = "Play ▶";
  });
  prevBtn.addEventListener("click", () => {
    prev();
    autoPlay = false;
    pauseBtn.textContent = "Play ▶";
  });

  setInterval(() => {
    if (autoPlay) next();
  }, 5000);

  pauseBtn.addEventListener("click", () => {
    autoPlay = !autoPlay;
    pauseBtn.textContent = autoPlay ? "Pause ||" : "Play ▶";
  });
}

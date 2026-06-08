export default function decorate(block) {
  const slideRows = [...block.children];

  block.innerHTML = "";

  const carousel = document.createElement("section");
  carousel.className = "hero-carousel-dell-hero-block";

  const slides = slideRows.map((row, index) => {
    const fields = [...row.querySelectorAll(":scope > div")];

    // Based on exact field order from UE:
    // Field 0: desktop image (picture)
    // Field 1: imageAlt (empty text)
    // Field 2: eyebrow
    // Field 3: title
    // Field 4: description
    // Field 5: mobile image (picture) or empty
    // Field 6: primaryButtonUrl (anchor)
    // Field 7: primaryButtonText
    // Field 8: secondaryButtonUrl (anchor)
    // Field 9: secondaryButtonText (if authored)

    const getText = (f) => f?.textContent?.trim() || "";
    const getAnchorHref = (f) =>
      f?.querySelector("a")?.getAttribute("href") || "#";

    // ── Images ──────────────────────────────────────────────────────
    const desktopImg = fields[0]?.querySelector("img")?.src || "";
    const mobileImg = fields[5]?.querySelector("img")?.src || "";

    // ── Text fields ──────────────────────────────────────────────────
    const eyebrow = getText(fields[2]);
    const title = getText(fields[3]);
    const description = getText(fields[4]);

    // ── CTAs — URL comes before Text in DOM ──────────────────────────
    const primaryLink = getAnchorHref(fields[6]);
    const primaryButtonText = getText(fields[7]);
    const secondaryLink = getAnchorHref(fields[8]);
    const secondaryButtonText = getText(fields[9]);

    // ── Theme ────────────────────────────────────────────────────────
    const theme =
      index % 2 === 0
        ? "dark-theme-dell-hero-block"
        : "light-theme-dell-hero-block";

    // ── Build slide ──────────────────────────────────────────────────
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

  // ── Controls ──────────────────────────────────────────────────────
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

  // ── Interaction ───────────────────────────────────────────────────
  const heroSlides = [...block.querySelectorAll(".hero-slide-dell-hero-block")];
  const nextBtn = block.querySelector(".next-dell-hero-block");
  const prevBtn = block.querySelector(".prev-dell-hero-block");
  const pauseBtn = block.querySelector(".pause-btn-dell-hero-block");
  const currentSlideEl = block.querySelector(".current-slide-dell-hero-block");

  let current = 0;
  let autoPlay = true;

  function showSlide(i) {
    heroSlides.forEach((s) => s.classList.remove("active"));
    heroSlides[i].classList.add("active");
    currentSlideEl.textContent = i + 1;
    current = i;
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

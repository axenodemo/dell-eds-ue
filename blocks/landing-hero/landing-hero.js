export default function decorate(block) {
  const slideRows = [...block.children];

  block.innerHTML = "";

  const carousel = document.createElement("section");
  carousel.className = "hero-carousel-dell-hero-block";

  const slides = slideRows.map((row, index) => {
    const fields = [...row.querySelectorAll(":scope > div")];

    // Exact field order from UE console:
    // Field 0: desktop image (picture)
    // Field 1: imageAlt (empty)
    // Field 2: eyebrow
    // Field 3: title
    // Field 4: description
    // Field 5: primaryButtonText  ← text BEFORE url
    // Field 6: primaryButtonUrl   ← has anchor
    // Field 7: secondaryButtonText
    // Field 8: secondaryButtonUrl ← has anchor

    const getText = (f) => f?.textContent?.trim() || "";
    const getHref = (f) => f?.querySelector("a")?.getAttribute("href") || "#";

    const desktopImg = fields[0]?.querySelector("img")?.src || "";
    const mobileImg = fields[1]?.querySelector("img")?.src || "";

    const eyebrow = getText(fields[2]);
    const title = getText(fields[3]);
    const description = getText(fields[4]);

    const cta1Text = getText(fields[5]);
    const cta1Url = getHref(fields[6]);
    const cta2Text = getText(fields[7]);
    const cta2Url = getHref(fields[8]);

    const theme =
      index % 2 === 0
        ? "dark-theme-dell-hero-block"
        : "light-theme-dell-hero-block";

    const slideEl = document.createElement("div");
    slideEl.className = `hero-slide-dell-hero-block ${index === 0 ? "active" : ""} ${theme}`;

    slideEl.innerHTML = `
      <div class="hero-content-dell-hero-block">
        ${eyebrow ? `<p class="eyebrow-dell-hero-block">${eyebrow}</p>` : ""}
        ${title ? `<h1 class="title-dell-hero-block">${title}</h1>` : ""}
        ${description ? `<p class="desc-dell-hero-block">${description}</p>` : ""}
        <div class="btn-wrap-dell-hero-block">
          ${cta1Text ? `<a href="${cta1Url}" class="primary-btn-dell-hero-block">${cta1Text}</a>` : ""}
          ${cta2Text ? `<a href="${cta2Url}" class="outline-btn-dell-hero-block">${cta2Text}</a>` : ""}
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
      <button class="nav-btn-dell-hero-block prev-dell-hero-block" aria-label="Previous">&#8592;</button>
      <div class="slide-count-dell-hero-block">
        <span class="current-slide-dell-hero-block">1</span>/${slides.length}
      </div>
      <button class="nav-btn-dell-hero-block next-dell-hero-block" aria-label="Next">&#8594;</button>
    </div>
    <button class="pause-btn-dell-hero-block" aria-label="Pause">Pause ||</button>
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

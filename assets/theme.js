document.addEventListener("DOMContentLoaded", () => {

  const reduceMotion = window.matchMedia(

    "(prefers-reduced-motion: reduce)"

  ).matches;

 

  /* =========================

     SCROLL REVEALS

  ========================= */

 

  const revealElements = document.querySelectorAll("[data-reveal]");

 

  if (reduceMotion || !("IntersectionObserver" in window)) {

    revealElements.forEach((element) => {

      element.classList.add("is-visible");

    });

  } else {

    const revealObserver = new IntersectionObserver(

      (entries, observer) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) return;

 

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);

        });

      },

      {

        threshold: 0.12,

        rootMargin: "0px 0px -40px 0px",

      }

    );

 

    revealElements.forEach((element) => {

      revealObserver.observe(element);

    });

  }

 

  /* =========================

     HERO ORB INTERACTION

  ========================= */

 

  const hero = document.querySelector(".orbitra-hero");

  const orb = document.querySelector("[data-orbitra-orb]");

 

  if (hero && orb && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {

    let targetX = 0;

    let targetY = 0;

    let currentX = 0;

    let currentY = 0;

    let animationFrame = null;

 

    const updateOrb = () => {

      currentX += (targetX - currentX) * 0.055;

      currentY += (targetY - currentY) * 0.055;

 

      orb.style.setProperty("--mouse-x", `${currentX}px`);

      orb.style.setProperty("--mouse-y", `${currentY}px`);

 

      animationFrame = requestAnimationFrame(updateOrb);

    };

 

    hero.addEventListener("pointermove", (event) => {

      const bounds = hero.getBoundingClientRect();

      const x = (event.clientX - bounds.left) / bounds.width - 0.5;

      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

 

      targetX = x * 24;

      targetY = y * 18;

    });

 

    hero.addEventListener("pointerleave", () => {

      targetX = 0;

      targetY = 0;

    });

 

    animationFrame = requestAnimationFrame(updateOrb);

 

    window.addEventListener("pagehide", () => {

      if (animationFrame) cancelAnimationFrame(animationFrame);

    });

  }

 

  /* =========================

     HERO SCROLL DEPTH

  ========================= */

 

  if (hero && !reduceMotion) {

    let ticking = false;

 

    const updateScrollDepth = () => {

      const heroRect = hero.getBoundingClientRect();

      const progress = Math.min(

        Math.max(-heroRect.top / heroRect.height, 0),

        1

      );

 

      hero.style.setProperty("--hero-scroll", progress.toFixed(3));

      ticking = false;

    };

 

    window.addEventListener(

      "scroll",

      () => {

        if (!ticking) {

          requestAnimationFrame(updateScrollDepth);

          ticking = true;

        }

      },

      { passive: true }

    );

 

    updateScrollDepth();

  }

 

  /* =========================

     PRODUCT MEDIA GALLERY

  ========================= */

 

  document.querySelectorAll("[data-orbitra-gallery]").forEach((gallery) => {

    const track = gallery.querySelector("[data-gallery-track]");

    const slides = Array.from(gallery.querySelectorAll("[data-gallery-slide]"));

    const thumbs = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));

    const prev = gallery.querySelector("[data-gallery-prev]");

    const next = gallery.querySelector("[data-gallery-next]");

    const currentLabel = gallery.querySelector("[data-gallery-current]");

 

    if (!track || slides.length === 0) return;

 

    let activeIndex = 0;

    let scrollTimer = null;

 

    const pauseInactiveVideos = () => {

      slides.forEach((slide, index) => {

        if (index === activeIndex) return;

 

        slide.querySelectorAll("video").forEach((video) => {

          video.pause();

        });

      });

    };

 

    const setActive = (index, shouldScroll = true) => {

      activeIndex = Math.max(0, Math.min(index, slides.length - 1));

 

      slides.forEach((slide, slideIndex) => {

        slide.classList.toggle("is-active", slideIndex === activeIndex);

      });

 

      thumbs.forEach((thumb, thumbIndex) => {

        const isActive = thumbIndex === activeIndex;

        thumb.classList.toggle("is-active", isActive);

        thumb.setAttribute("aria-current", isActive ? "true" : "false");

      });

 

      if (currentLabel) {

        currentLabel.textContent = String(activeIndex + 1);

      }

 

      if (shouldScroll) {

        slides[activeIndex].scrollIntoView({

          behavior: reduceMotion ? "auto" : "smooth",

          block: "nearest",

          inline: "start",

        });

 

        if (thumbs[activeIndex]) {

          thumbs[activeIndex].scrollIntoView({

            behavior: reduceMotion ? "auto" : "smooth",

            block: "nearest",

            inline: "center",

          });

        }

      }

 

      pauseInactiveVideos();

    };

 

    thumbs.forEach((thumb, index) => {

      thumb.addEventListener("click", () => setActive(index));

    });

 

    if (prev) {

      prev.addEventListener("click", () => {

        const nextIndex = activeIndex === 0 ? slides.length - 1 : activeIndex - 1;

        setActive(nextIndex);

      });

    }

 

    if (next) {

      next.addEventListener("click", () => {

        const nextIndex = activeIndex === slides.length - 1 ? 0 : activeIndex + 1;

        setActive(nextIndex);

      });

    }

 

    track.addEventListener(

      "scroll",

      () => {

        window.clearTimeout(scrollTimer);

 

        scrollTimer = window.setTimeout(() => {

          const trackRect = track.getBoundingClientRect();

 

          let closestIndex = 0;

          let closestDistance = Number.POSITIVE_INFINITY;

 

          slides.forEach((slide, index) => {

            const rect = slide.getBoundingClientRect();

            const distance = Math.abs(rect.left - trackRect.left);

 

            if (distance < closestDistance) {

              closestDistance = distance;

              closestIndex = index;

            }

          });

 

          setActive(closestIndex, false);

        }, 80);

      },

      { passive: true }

    );

 

    setActive(0, false);

  });

 

  /* =========================

     QUANTITY CONTROLS

  ========================= */

 

  document.querySelectorAll(".orbitra-quantity").forEach((control) => {

    const input = control.querySelector("[data-quantity-input]");

    const minus = control.querySelector("[data-quantity-minus]");

    const plus = control.querySelector("[data-quantity-plus]");

 

    if (!input || !minus || !plus) return;

 

    minus.addEventListener("click", () => {

      const current = Number.parseInt(input.value, 10) || 1;

      input.value = Math.max(1, current - 1);

    });

 

    plus.addEventListener("click", () => {

      const current = Number.parseInt(input.value, 10) || 1;

      input.value = current + 1;

    });

  });

});

 

/* =========================================================

   ORBITRA CUSTOM PRODUCT GALLERY

   ========================================================= */

 

document.querySelectorAll('[data-product-gallery]').forEach((gallery) => {

  const slides = Array.from(gallery.querySelectorAll('[data-gallery-slide]'));

  const thumbnails = Array.from(gallery.querySelectorAll('[data-gallery-thumbnail]'));

  const previousButton = gallery.querySelector('[data-gallery-previous]');

  const nextButton = gallery.querySelector('[data-gallery-next]');

  const currentCounter = gallery.querySelector('[data-gallery-current]');

 

  if (!slides.length) return;

 

  let currentIndex = 0;

  let touchStartX = 0;

  let touchEndX = 0;

 

  const showSlide = (index) => {

    if (index < 0) index = slides.length - 1;

    if (index >= slides.length) index = 0;

 

    currentIndex = index;

 

    slides.forEach((slide, slideIndex) => {

      slide.classList.toggle('is-active', slideIndex === currentIndex);

    });

 

    thumbnails.forEach((thumbnail, thumbnailIndex) => {

      const isActive = thumbnailIndex === currentIndex;

      thumbnail.classList.toggle('is-active', isActive);

 

      if (isActive) {

        thumbnail.setAttribute('aria-current', 'true');

        thumbnail.scrollIntoView({

          behavior: 'smooth',

          block: 'nearest',

          inline: 'nearest'

        });

      } else {

        thumbnail.removeAttribute('aria-current');

      }

    });

 

    if (currentCounter) currentCounter.textContent = currentIndex + 1;

  };

 

  previousButton?.addEventListener('click', () => showSlide(currentIndex - 1));

  nextButton?.addEventListener('click', () => showSlide(currentIndex + 1));

 

  thumbnails.forEach((thumbnail, index) => {

    thumbnail.addEventListener('click', () => showSlide(index));

  });

 

  gallery.addEventListener('keydown', (event) => {

    if (event.key === 'ArrowLeft') showSlide(currentIndex - 1);

    if (event.key === 'ArrowRight') showSlide(currentIndex + 1);

  });

 

  gallery.addEventListener('touchstart', (event) => {

    touchStartX = event.changedTouches[0].screenX;

  }, { passive: true });

 

  gallery.addEventListener('touchend', (event) => {

    touchEndX = event.changedTouches[0].screenX;

    const swipeDistance = touchEndX - touchStartX;

 

    if (Math.abs(swipeDistance) < 45) return;

    showSlide(swipeDistance < 0 ? currentIndex + 1 : currentIndex - 1);

  }, { passive: true });

 

  showSlide(0);

});
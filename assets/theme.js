(() => {

  "use strict";

 

  const reduceMotion = window.matchMedia(

    "(prefers-reduced-motion: reduce)"

  ).matches;

 

 

  /* =========================================================

     SCROLL REVEALS

     ========================================================= */

 

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

        rootMargin: "0px 0px -40px 0px"

      }

    );

 

    revealElements.forEach((element) => {

      revealObserver.observe(element);

    });

  }

 

 

  /* =========================================================

     HERO ORB INTERACTION

     ========================================================= */

 

  const hero = document.querySelector(".orbitra-hero");

  const orb = document.querySelector("[data-orbitra-orb]");

 

  if (

    hero &&

    orb &&

    !reduceMotion &&

    window.matchMedia("(pointer: fine)").matches

  ) {

    let animationFrame = null;

    let currentX = 0;

    let currentY = 0;

    let targetX = 0;

    let targetY = 0;

 

    const animateOrb = () => {

      currentX += (targetX - currentX) * 0.12;

      currentY += (targetY - currentY) * 0.12;

 

      orb.style.setProperty("--mouse-x", `${currentX.toFixed(2)}px`);

      orb.style.setProperty("--mouse-y", `${currentY.toFixed(2)}px`);

 

      const distance =

        Math.abs(targetX - currentX) +

        Math.abs(targetY - currentY);

 

      if (distance > 0.1) {

        animationFrame = requestAnimationFrame(animateOrb);

      } else {

        animationFrame = null;

      }

    };

 

    const requestOrbAnimation = () => {

      if (animationFrame === null) {

        animationFrame = requestAnimationFrame(animateOrb);

      }

    };

 

    hero.addEventListener(

      "pointermove",

      (event) => {

        const bounds = hero.getBoundingClientRect();

 

        const x =

          (event.clientX - bounds.left) /

            bounds.width -

          0.5;

 

        const y =

          (event.clientY - bounds.top) /

            bounds.height -

          0.5;

 

        targetX = x * 24;

        targetY = y * 18;

 

        requestOrbAnimation();

      },

      { passive: true }

    );

 

    hero.addEventListener(

      "pointerleave",

      () => {

        targetX = 0;

        targetY = 0;

        requestOrbAnimation();

      },

      { passive: true }

    );

 

    window.addEventListener(

      "pagehide",

      () => {

        if (animationFrame !== null) {

          cancelAnimationFrame(animationFrame);

        }

      },

      { once: true }

    );

  }

 

 

  /* =========================================================

     HERO SCROLL DEPTH

     ========================================================= */

 

  if (hero && !reduceMotion) {

    let ticking = false;

    let heroVisible = true;

 

    const updateScrollDepth = () => {

      if (!heroVisible) {

        ticking = false;

        return;

      }

 

      const heroRect = hero.getBoundingClientRect();

 

      const progress = Math.min(

        Math.max(-heroRect.top / heroRect.height, 0),

        1

      );

 

      hero.style.setProperty(

        "--hero-scroll",

        progress.toFixed(3)

      );

 

      ticking = false;

    };

 

    const requestScrollUpdate = () => {

      if (!ticking && heroVisible) {

        ticking = true;

        requestAnimationFrame(updateScrollDepth);

      }

    };

 

    if ("IntersectionObserver" in window) {

      const heroObserver = new IntersectionObserver(

        (entries) => {

          entries.forEach((entry) => {

            heroVisible = entry.isIntersecting;

 

            if (heroVisible) {

              requestScrollUpdate();

            }

          });

        },

        {

          rootMargin: "100px 0px"

        }

      );

 

      heroObserver.observe(hero);

    }

 

    window.addEventListener(

      "scroll",

      requestScrollUpdate,

      { passive: true }

    );

 

    requestScrollUpdate();

  }

 

 

  /* =========================================================

     ACTION VIDEO + SOUND TOGGLE

     ========================================================= */

  document.querySelectorAll("[data-orbitra-story-video]").forEach((video) => {
    const frame = video.closest("[data-orbitra-video-frame]") || video.closest(".orbitra-video-frame") || video.parentElement;
    const soundToggle = frame?.querySelector("[data-orbitra-sound-toggle]");
    const soundLabel = frame?.querySelector("[data-orbitra-sound-label]");
    let sourceLoaded = Boolean(video.querySelector("source[src]"));

    const loadVideoSource = () => {
      if (sourceLoaded) return;
      video.querySelectorAll("source[data-src]").forEach((source) => {
        source.src = source.dataset.src;
        source.removeAttribute("data-src");
      });
      video.load();
      sourceLoaded = true;
    };

    const tryPlay = () => {
      loadVideoSource();
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") playPromise.catch(() => {});
    };

    const updateSoundButton = () => {
      if (!soundToggle) return;
      const muted = video.muted;
      soundToggle.setAttribute("aria-pressed", muted ? "false" : "true");
      soundToggle.setAttribute("aria-label", muted ? "Turn video sound on" : "Turn video sound off");
      if (soundLabel) soundLabel.textContent = muted ? "Sound on" : "Sound off";
    };

    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        video.muted = !video.muted;
        tryPlay();
        updateSoundButton();
      });
      updateSoundButton();
    }

    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) tryPlay();
          else if (!video.paused) video.pause();
        });
      }, { threshold: 0.05, rootMargin: "600px 0px" });
      videoObserver.observe(video);
    } else {
      tryPlay();
    }
  });


  /* =========================================================

     CUSTOM PRODUCT GALLERY

     ========================================================= */

 

  document

    .querySelectorAll("[data-product-gallery]")

    .forEach((gallery) => {

 

      const slides = Array.from(

        gallery.querySelectorAll(

          "[data-gallery-slide]"

        )

      );

 

      const thumbnails = Array.from(

        gallery.querySelectorAll(

          "[data-gallery-thumbnail]"

        )

      );

 

      const previousButton =

        gallery.querySelector(

          "[data-gallery-previous]"

        );

 

      const nextButton =

        gallery.querySelector(

          "[data-gallery-next]"

        );

 

      const currentCounter =

        gallery.querySelector(

          "[data-gallery-current]"

        );

 

      if (!slides.length) return;

 

      let currentIndex = 0;

      let touchStartX = 0;

      let touchStartY = 0;

 

      const showSlide = (index) => {

        if (index < 0) {

          index = slides.length - 1;

        }

 

        if (index >= slides.length) {

          index = 0;

        }

 

        currentIndex = index;

 

        slides.forEach((slide, slideIndex) => {

          const isActive =

            slideIndex === currentIndex;

 

          slide.classList.toggle(

            "is-active",

            isActive

          );

 

          slide.setAttribute(

            "aria-hidden",

            isActive ? "false" : "true"

          );

        });

 

        thumbnails.forEach(

          (thumbnail, thumbnailIndex) => {

            const isActive =

              thumbnailIndex === currentIndex;

 

            thumbnail.classList.toggle(

              "is-active",

              isActive

            );

 

            if (isActive) {

              thumbnail.setAttribute(

                "aria-current",

                "true"

              );

 

              thumbnail.scrollIntoView({

                behavior:

                  reduceMotion

                    ? "auto"

                    : "smooth",

                block: "nearest",

                inline: "nearest"

              });

            } else {

              thumbnail.removeAttribute(

                "aria-current"

              );

            }

          }

        );

 

        if (currentCounter) {

          currentCounter.textContent =

            String(currentIndex + 1);

        }

      };

 

      if (previousButton) {

        previousButton.addEventListener(

          "click",

          () => {

            showSlide(currentIndex - 1);

          }

        );

      }

 

      if (nextButton) {

        nextButton.addEventListener(

          "click",

          () => {

            showSlide(currentIndex + 1);

          }

        );

      }

 

      thumbnails.forEach(

        (thumbnail, index) => {

          thumbnail.addEventListener(

            "click",

            () => {

              showSlide(index);

            }

          );

        }

      );

 

      gallery.addEventListener(

        "keydown",

        (event) => {

          if (event.key === "ArrowLeft") {

            event.preventDefault();

            showSlide(currentIndex - 1);

          }

 

          if (event.key === "ArrowRight") {

            event.preventDefault();

            showSlide(currentIndex + 1);

          }

        }

      );

 

      gallery.addEventListener(

        "touchstart",

        (event) => {

          const touch =

            event.changedTouches[0];

 

          touchStartX = touch.screenX;

          touchStartY = touch.screenY;

        },

        { passive: true }

      );

 

      gallery.addEventListener(

        "touchend",

        (event) => {

          const touch =

            event.changedTouches[0];

 

          const touchEndX = touch.screenX;

          const touchEndY = touch.screenY;

 

          const horizontalDistance =

            touchEndX - touchStartX;

 

          const verticalDistance =

            touchEndY - touchStartY;

 

          if (

            Math.abs(horizontalDistance) <=

            Math.abs(verticalDistance)

          ) {

            return;

          }

 

          if (

            Math.abs(horizontalDistance) < 45

          ) {

            return;

          }

 

          showSlide(

            horizontalDistance < 0

              ? currentIndex + 1

              : currentIndex - 1

          );

        },

        { passive: true }

      );

 

      showSlide(0);

    });

 

 

  /* =========================================================

     PRODUCT QUANTITY CONTROLS

     ========================================================= */

 

  document

    .querySelectorAll(".orbitra-quantity")

    .forEach((control) => {

 

      const input =

        control.querySelector(

          "[data-quantity-input]"

        );

 

      const minus =

        control.querySelector(

          "[data-quantity-minus]"

        );

 

      const plus =

        control.querySelector(

          "[data-quantity-plus]"

        );

 

      if (!input || !minus || !plus) {

        return;

      }

 

      minus.addEventListener(

        "click",

        () => {

          const current =

            Number.parseInt(

              input.value,

              10

            ) || 1;

 

          input.value =

            Math.max(

              1,

              current - 1

            );

        }

      );

 

      plus.addEventListener(

        "click",

        () => {

          const current =

            Number.parseInt(

              input.value,

              10

            ) || 1;

 

          input.value = current + 1;

        }

      );

    });

 

})();


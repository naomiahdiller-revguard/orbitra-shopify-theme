document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* =========================================
     SCROLL REVEALS
  ========================================= */

  const revealElements = document.querySelectorAll("[data-reveal]");

  if (reduceMotion) {
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
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  /* =========================================
     HERO ORB INTERACTION
  ========================================= */

  const hero = document.querySelector(".orbitra-hero");
  const orb = document.querySelector("[data-orbitra-orb]");

  if (!hero || !orb || reduceMotion) return;

  let targetX = 0;
  let targetY = 0;

  let currentX = 0;
  let currentY = 0;

  let animationFrame;

  const updateOrb = () => {
    currentX += (targetX - currentX) * 0.055;
    currentY += (targetY - currentY) * 0.055;

    orb.style.setProperty("--mouse-x", `${currentX}px`);
    orb.style.setProperty("--mouse-y", `${currentY}px`);

    animationFrame = requestAnimationFrame(updateOrb);
  };

  const handlePointerMove = (event) => {
    const bounds = hero.getBoundingClientRect();

    const x =
      (event.clientX - bounds.left) / bounds.width - 0.5;

    const y =
      (event.clientY - bounds.top) / bounds.height - 0.5;

    targetX = x * 28;
    targetY = y * 22;
  };

  const handlePointerLeave = () => {
    targetX = 0;
    targetY = 0;
  };

  if (window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", handlePointerMove);
    hero.addEventListener("pointerleave", handlePointerLeave);

    animationFrame = requestAnimationFrame(updateOrb);
  }

  /* =========================================
     SUBTLE SCROLL DEPTH
  ========================================= */

  let ticking = false;

  const updateScrollDepth = () => {
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

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateScrollDepth();

  /* =========================================
     CLEANUP
  ========================================= */

  window.addEventListener("pagehide", () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
});
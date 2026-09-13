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
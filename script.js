// ================================================================
// FUGITIF STUDIO — script.js
// ================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1) Lazy loading
  document
    .querySelectorAll('img:not([loading]), iframe:not([loading])')
    .forEach((el) => el.setAttribute("loading", "lazy"));

  // 2) Curseur personnalisé
  const cursor = document.getElementById("custom-cursor");
  if (cursor) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
    document.querySelectorAll("a").forEach((link) => {
      link.addEventListener("mouseenter", () =>
        cursor.classList.add("hover-link")
      );
      link.addEventListener("mouseleave", () =>
        cursor.classList.remove("hover-link")
      );
    });
  }

  // 3) Effet voile sur .projets — désactivé sur écrans tactiles
  const projetsContainer = document.querySelector(".projets-container");

  const isTouchDevice = () =>
    window.matchMedia("(hover: none), (pointer: coarse)").matches;

  if (projetsContainer && !isTouchDevice()) {
    projetsContainer.querySelectorAll(".projet").forEach((projet) => {
      projet.addEventListener("mouseenter", () =>
        projetsContainer.classList.add("hovering")
      );
      projet.addEventListener("mouseleave", () =>
        projetsContainer.classList.remove("hovering")
      );
    });
  }

  // 4) Parallax simple
  const parallaxElements = Array.from(
    document.querySelectorAll(".parallax-bg")
  );
  if (parallaxElements.length > 0) {
    const onScroll = () => {
      const offset = window.pageYOffset;
      window.requestAnimationFrame(() => {
        parallaxElements.forEach((el) => {
          el.style.transform = `translateY(${offset * 0.3}px)`;
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // 5) Horloge
  const timeEl = document.getElementById("current-time");
  if (timeEl) {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      timeEl.innerText = `${h}:${m}:${s}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // 6) Bouton burger — astérisque 5 branches → croix
  const btn = document.getElementById("burger-menu");
  const icon = document.getElementById("icon");
  const mobileNav = document.getElementById("mobile-nav");

  const ANIM_MS = 340;
  let isAnimating = false;
  let animTimer = null;

  function attachTransitionEndOnce() {
    if (!icon) return;
    const onEnd = (e) => {
      const ok =
        e.target === icon ||
        (e.target instanceof HTMLElement &&
          e.target.classList.contains("arm"));
      if (!ok) return;
      cleanupAnimation();
    };
    icon.addEventListener("transitionend", onEnd, { once: true });
  }

  function cleanupAnimation() {
    if (!icon) return;
    icon.classList.remove("morphing");
    icon.classList.remove("twist");
    isAnimating = false;
    if (animTimer) {
      clearTimeout(animTimer);
      animTimer = null;
    }
  }

  if (btn) {
    if (!btn.hasAttribute("aria-expanded")) {
      btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", () => {
      if (isAnimating) return;
      isAnimating = true;

      if (icon) {
        icon.classList.add("morphing");
      }

      requestAnimationFrame(() => {
        const open = btn.classList.toggle("active");
        btn.setAttribute("aria-expanded", open ? "true" : "false");

        if (mobileNav) mobileNav.classList.toggle("active", open);
        document.body.classList.toggle("no-scroll", open);

        if (icon) {
          icon.classList.remove("twist");
          void icon.offsetWidth;
          icon.classList.add("twist");
        }

        attachTransitionEndOnce();
        animTimer = setTimeout(cleanupAnimation, ANIM_MS + 80);
      });
    });

    // Fermer sur ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && btn.classList.contains("active")) {
        if (isAnimating) return;
        btn.classList.remove("active");
        btn.setAttribute("aria-expanded", "false");
        if (mobileNav) mobileNav.classList.remove("active");
        document.body.classList.remove("no-scroll");
      }
    });

    // Fermer si clic sur un lien du menu
    if (mobileNav) {
      mobileNav.addEventListener("click", (e) => {
        const link = e.target && e.target.closest ? e.target.closest("a") : null;
        if (link) {
          if (isAnimating) return;
          btn.classList.remove("active");
          btn.setAttribute("aria-expanded", "false");
          mobileNav.classList.remove("active");
          document.body.classList.remove("no-scroll");
        }
      });
    }
  }

  // 7) --vh pour 100dvh mobiles
  function setVhUnit() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  setVhUnit();
  window.addEventListener("resize", setVhUnit);
  window.addEventListener("orientationchange", setVhUnit);

  // 8) Ombre de sélection dynamique
  document.addEventListener("selectionchange", () => {
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const selected = range.cloneContents();
    const probe = document.createElement("span");
    probe.appendChild(selected);
    document.body.appendChild(probe);
    const computed = window.getComputedStyle(probe);
    const textSize = parseFloat(computed.fontSize);
    const textColor = computed.color;
    probe.remove();

    const comps = textColor.replace(/[^\d,]/g, "").split(",").map(Number);
    const intensity = Math.sqrt(
      0.299 * (comps[0] || 0) ** 2 +
        0.587 * (comps[1] || 0) ** 2 +
        0.114 * (comps[2] || 0) ** 2
    );
    const shadowColor =
      intensity > 1 ? "rgba(255,255,255,.5)" : "rgba(0,0,0)";
    const blurSize = textSize / 2;
    document.documentElement.style.setProperty(
      "--selection-shadow",
      `${blurSize}px ${shadowColor}`
    );
  });

  // 9) Numérotation auto des figures
  const figures = document.querySelectorAll("figure");
  if (figures.length) {
    let n = 1;
    figures.forEach((fig) => {
      const h4 = document.createElement("h4");
      h4.textContent = `${String(n).padStart(3, "0")}.`;
      const img = fig.querySelector("img");
      if (img) fig.insertBefore(h4, img);
      n++;
    });
  }
});

// ================================================================
// 10) Sélecteur générique : si data-* présents, on choisit l'image adaptée
// ================================================================
(function () {
  const els = document.querySelectorAll(
    ".parallax-bg[data-bg-desktop], .parallax-bg[data-bg-mobile]"
  );
  if (!els.length) return;

  function applyResponsiveBg() {
    const isMobile = window.innerWidth <= 768;
    els.forEach((el) => {
      const mobile = el.getAttribute("data-bg-mobile");
      const desktop = el.getAttribute("data-bg-desktop");
      const url = isMobile && mobile ? mobile : desktop || mobile;
      if (url) el.style.backgroundImage = `url('${url}')`;
    });
  }

  window.addEventListener("load", applyResponsiveBg);
  window.addEventListener("resize", applyResponsiveBg);
})();
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
      link.addEventListener("mouseenter", () => cursor.classList.add("hover-link"));
      link.addEventListener("mouseleave", () => cursor.classList.remove("hover-link"));
    });
  }

  // 3) Effet voile sur .projets
  const projetsContainer = document.querySelector(".projets-container");
  if (projetsContainer) {
    projetsContainer.querySelectorAll(".projet").forEach((projet) => {
      projet.addEventListener("mouseenter", () => projetsContainer.classList.add("hovering"));
      projet.addEventListener("mouseleave", () => projetsContainer.classList.remove("hovering"));
    });
  }

  // 4) Parallax simple
  const parallaxElements = Array.from(document.querySelectorAll(".parallax-bg"));
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

  // 6) Bouton burger — astérisque 5 branches → croix (animation robuste)
  const btn = document.getElementById("burger-menu");
  const icon = document.getElementById("icon");
  const mobileNav = document.getElementById("mobile-nav");

  // --- Nouvel orchestrateur d'animation ---
  const ANIM_MS = 340; // doit approx. matcher la durée CSS (transform/clip-path .30-.36s)
  let isAnimating = false;
  let animTimer = null;

  // écouteur transitionend (fin “réelle” d’anim, aller ET retour)
  function attachTransitionEndOnce() {
    if (!icon) return;
    const onEnd = (e) => {
      // on accepte l’évènement venant de l’icône OU d’un bras .arm
      const ok =
        e.target === icon ||
        (e.target instanceof HTMLElement && e.target.classList.contains("arm"));
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
      if (isAnimating) return; // anti double-clic durant l’anim
      isAnimating = true;

      if (icon) {
        // phase “morphing” (douce), appliquée avant le toggle
        icon.classList.add("morphing");
      }

      // Laisse le navigateur appliquer "morphing" (paint) avant de toggler l'état
      requestAnimationFrame(() => {
        const open = btn.classList.toggle("active");
        btn.setAttribute("aria-expanded", open ? "true" : "false");

        if (mobileNav) mobileNav.classList.toggle("active", open);
        document.body.classList.toggle("no-scroll", open);

        // micro “twist” (optionnel)
        if (icon) {
          icon.classList.remove("twist");
          void icon.offsetWidth; // reflow pour relancer l’anim si clic rapproché
          icon.classList.add("twist");
        }

        // écoute propre de fin d’anim + fallback timer
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

  // 8) Ombre de sélection dynamique (optionnel)
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
    const shadowColor = intensity > 1 ? "rgba(255,255,255,.5)" : "rgba(0,0,0)";
    const blurSize = textSize / 2;
    document.documentElement.style.setProperty("--selection-shadow", `${blurSize}px ${shadowColor}`);
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
// 10) Images mobile/desktop (HABIT) — gardé
// ================================================================
function updateImagesForMobile() {
  const isMobile = window.innerWidth <= 768;
  const swapSrc = (selectorFrom, toSrc) => {
    const el = document.querySelector(selectorFrom);
    if (el) el.src = toSrc;
  };
  const parallaxBg = document.querySelector(".parallax-bg");

  if (isMobile) {
    swapSrc(
      '.big-visual[src="IMAGES/Projets/habit/HABIT_font-specimen.jpg"]',
      "IMAGES/Projets/habit/HABIT_font-specimen-mobile.jpg"
    );
    if (parallaxBg)
      parallaxBg.style.backgroundImage =
        "url('IMAGES/Projets/habit/HABIT_COUV-double-affiche-mobile.jpg')";
    swapSrc(
      '.big-visual[src="IMAGES/Projets/habit/HABIT_signaletique-magasin.jpg"]',
      "IMAGES/Projets/habit/HABIT_signaletique-magasin-mobile.jpg"
    );
    swapSrc(
      '.big-visual[src="IMAGES/Projets/habit/HABIT_logotype-couleurs.jpg"]',
      "IMAGES/Projets/habit/HABIT_logotype-couleurs-mobile.jpg"
    );
  } else {
    swapSrc(
      '.big-visual[src="IMAGES/Projets/habit/HABIT_font-specimen-mobile.jpg"]',
      "IMAGES/Projets/habit/HABIT_font-specimen.jpg"
    );
    if (parallaxBg)
      parallaxBg.style.backgroundImage =
        "url('IMAGES/Projets/habit/HABIT_COUV-double-affiche.jpg')";
    swapSrc(
      '.big-visual[src="IMAGES/Projets/habit/HABIT_signaletique-magasin-mobile.jpg"]',
      "IMAGES/Projets/habit/HABIT_signaletique-magasin.jpg"
    );
    swapSrc(
      '.big-visual[src="IMAGES/Projets/habit/HABIT_logotype-couleurs-mobile.jpg"]',
      "IMAGES/Projets/habit/HABIT_logotype-couleurs.jpg"
    );
  }
}

window.addEventListener("load", updateImagesForMobile);
window.addEventListener("resize", updateImagesForMobile);
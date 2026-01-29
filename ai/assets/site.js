(function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  const PAGE_ANIM_MS = 260;
  let isNavigating = false;
  let currentUrl = window.location.href;
  let closeNavMenu = () => {};
  let revealObserver = null;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function setupNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) return;
    const body = document.body;

    const close = () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      body.classList.remove("nav-open");
    };

    closeNavMenu = close;

    toggle.addEventListener("click", () => {
      const open = !menu.classList.contains("open");
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      body.classList.toggle("nav-open", open);
    });

    menu.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (link) close();
    });

    document.addEventListener("click", (event) => {
      if (
        menu.classList.contains("open") &&
        !menu.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  function setupCreditsEstimator(scope) {
    const root = (scope || document).querySelector("[data-credits-calc]");
    if (!root) return;

    const device = root.querySelector("#device");
    const hours = root.querySelector("#hours");
    const hoursOut = root.querySelector("#hoursOut");
    const creditsOut = root.querySelector("#creditsOut");
    const tokensOut = root.querySelector("#tokensOut");
    const noteOut = root.querySelector("#noteOut");

    if (!device || !hours || !hoursOut || !creditsOut || !tokensOut || !noteOut)
      return;

    const profiles = {
      phone: { tps: 4, eff: 0.65, label: "Android phone" },
      laptop: { tps: 10, eff: 0.72, label: "Laptop CPU" },
      desktop: { tps: 60, eff: 0.78, label: "Desktop GPU" },
    };

    const fmt = (value) => {
      try {
        return new Intl.NumberFormat(undefined).format(value);
      } catch {
        return String(value);
      }
    };

    const update = () => {
      const h = Number(hours.value);
      const p = profiles[device.value] || profiles.laptop;

      hoursOut.textContent = h.toFixed(1);

      const tokensRaw = Math.max(0, Math.floor(p.tps * 3600 * h));
      const tokensNet = Math.max(0, Math.floor(tokensRaw * p.eff));

      const credits =
        tokensNet /
        1000; /* placeholder unit: 1 credit ≈ 1,000 verified tokens */

      tokensOut.textContent = fmt(tokensNet) + " tokens/day";
      creditsOut.textContent = credits.toFixed(1) + " credits/day";
      noteOut.textContent =
        "Conservative estimate for " +
        p.label +
        " contributing only while idle.";
    };

    device.addEventListener("change", update);
    hours.addEventListener("input", update);
    update();
  }

  function setRevealTarget(element, delayIndex) {
    if (!element || element.classList.contains("reveal")) return;
    element.classList.add("reveal");
    if (typeof delayIndex === "number") {
      element.style.setProperty("--reveal-delay", `${delayIndex * 80}ms`);
    }
  }

  function applyStagger(container, selector) {
    const items = container.querySelectorAll(selector);
    items.forEach((item, index) => {
      setRevealTarget(item, Math.min(index, 4));
    });
  }

  function initRevealTargets(scope) {
    const root = scope || document;

    const hero = root.querySelector(".hero");
    if (hero) {
      const heroItems = hero.querySelectorAll(
        ".hero-inner > div, .hero-inner > aside"
      );
      heroItems.forEach((item, index) => setRevealTarget(item, index));
    }

    root
      .querySelectorAll(
        ".section-head, .callout, .cta-strip, .calc, .output, .bullets, .hero-actions, .art-card"
      )
      .forEach((item) => setRevealTarget(item));

    root.querySelectorAll(".cards").forEach((group) => {
      applyStagger(group, ".card");
    });

    root.querySelectorAll(".steps").forEach((group) => {
      applyStagger(group, "li");
    });

    root.querySelectorAll(".flow").forEach((group) => {
      applyStagger(group, ".flow-box");
    });

    root.querySelectorAll(".timeline").forEach((group) => {
      applyStagger(group, ".milestone");
    });
  }

  function setupScrollReveal(scope) {
    const root = scope || document;
    const targets = Array.from(root.querySelectorAll(".reveal"));

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      targets.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
      );
    }

    revealObserver.disconnect();
    targets.forEach((item) => {
      if (!item.classList.contains("is-visible")) {
        revealObserver.observe(item);
      }
    });
  }

  function initPage(scope) {
    const root = scope || document;
    initRevealTargets(root);
    setupScrollReveal(root);
    setupCreditsEstimator(root);
  }

  function updateNavState(url) {
    const target = new URL(url, window.location.href);
    const path = target.pathname.endsWith("/")
      ? `${target.pathname}index.html`
      : target.pathname;
    const current = path.split("/").pop();

    document
      .querySelectorAll(".nav a:not(.btn)")
      .forEach((link) => {
        const linkUrl = new URL(link.getAttribute("href"), window.location.href);
        const linkPath = linkUrl.pathname.endsWith("/")
          ? `${linkUrl.pathname}index.html`
          : linkUrl.pathname;
        const linkPage = linkPath.split("/").pop();

        if (linkPage === current) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
  }

  function scrollToHash(hash) {
    if (!hash) return;
    const id = decodeURIComponent(hash.replace("#", ""));
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  }

  async function animateOut(main) {
    if (!main || prefersReducedMotion.matches) return;
    main.classList.remove("is-entered");
    main.classList.add("is-exiting");
    await sleep(PAGE_ANIM_MS);
  }

  async function animateIn(main) {
    if (!main) return;
    if (prefersReducedMotion.matches) {
      main.classList.remove("is-exiting", "is-entering");
      main.classList.add("is-entered");
      return;
    }
    main.classList.remove("is-exiting");
    main.classList.add("is-entering");
    requestAnimationFrame(() => {
      main.classList.add("is-entered");
    });
    await sleep(PAGE_ANIM_MS);
    main.classList.remove("is-entering");
  }

  async function navigateTo(url, options = {}) {
    if (isNavigating) return;
    isNavigating = true;

    closeNavMenu();

    const main = document.querySelector("#main");
    if (!main) {
      window.location.assign(url.href);
      return;
    }

    const current = new URL(currentUrl);
    const isSamePage =
      url.pathname === current.pathname && url.search === current.search;

    if (isSamePage && !url.hash) {
      updateNavState(url.href);
      currentUrl = url.href;
      isNavigating = false;
      return;
    }

    if (isSamePage && url.hash) {
      if (options.push !== false) {
        history.pushState({ url: url.href }, "", url.href);
      }
      updateNavState(url.href);
      scrollToHash(url.hash);
      currentUrl = url.href;
      isNavigating = false;
      return;
    }

    try {
      await animateOut(main);

      const response = await fetch(url.href, {
        headers: { "X-Requested-With": "pjax" },
      });

      if (!response.ok) throw new Error("Failed to load");

      const text = await response.text();
      const doc = new DOMParser().parseFromString(text, "text/html");
      const newMain = doc.querySelector("#main");
      if (!newMain) throw new Error("Missing main content");

      if (doc.title) {
        document.title = doc.title;
      }

      const newDescription = doc.querySelector('meta[name="description"]');
      if (newDescription && newDescription.getAttribute("content")) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = "description";
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", newDescription.getAttribute("content"));
      }

      main.innerHTML = newMain.innerHTML;
      main.className = "page";

      initPage(main);
      updateNavState(url.href);
      currentUrl = url.href;

      if (options.push !== false) {
        history.pushState({ url: url.href }, "", url.href);
      }

      if (!url.hash) {
        window.scrollTo({ top: 0, left: 0 });
      }

      await animateIn(main);

      if (url.hash) {
        scrollToHash(url.hash);
      }
    } catch (error) {
      window.location.assign(url.href);
    } finally {
      isNavigating = false;
    }
  }

  function setupPageTransitions() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;
      if (link.getAttribute("href")?.startsWith("#")) return;

      const url = new URL(link.href, window.location.href);

      if (url.origin !== window.location.origin) return;
      if (!url.pathname.endsWith(".html") && url.pathname !== "/") return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      ) {
        return;
      }

      event.preventDefault();
      navigateTo(url);
    });

    window.addEventListener("popstate", (event) => {
      const url = new URL(window.location.href);
      if (event.state && event.state.url) {
        navigateTo(new URL(event.state.url, window.location.href), {
          push: false,
        });
      } else {
        navigateTo(url, { push: false });
      }
    });

    window.addEventListener("hashchange", () => {
      currentUrl = window.location.href;
      updateNavState(currentUrl);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupNav();
    setupPageTransitions();

    const main = document.querySelector("#main");
    if (main) {
      main.classList.add("page", "is-entered");
    }

    initPage(main || document);
    updateNavState(window.location.href);
    currentUrl = window.location.href;
  });
})();

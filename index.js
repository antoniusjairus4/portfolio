function initReveal() {
  const revealEls = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  revealEls.forEach((el) => observer.observe(el));
}

function initProjectSpotlight() {
  document.querySelectorAll(".project-card, .image-card, .pursuit-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    }, { passive: true });
  });
}

function initPursuitScroll() {
  const section = document.querySelector(".pursuits-section");
  const track = document.getElementById("pursuit-track");
  const sticky = document.querySelector(".pursuits-sticky");

  if (!section || !track || !sticky) return;

  let distance = 0;

  function setup() {
    const shellWidth = sticky.getBoundingClientRect().width;
    distance = Math.max(0, track.scrollWidth - shellWidth);
    const scrollBuffer = window.innerWidth < 761 ? 96 : 144;
    section.style.height = `${window.innerHeight + distance + scrollBuffer}px`;
  }

  function update() {
    if (distance === 0) return;
    const rect = section.getBoundingClientRect();
    const progress = Math.min(distance, Math.max(0, -rect.top));
    track.style.transform = `translate3d(${-progress}px, 0, 0)`;
  }

  setup();
  update();
  window.addEventListener("resize", () => {
    setup();
    update();
  }, { passive: true });
  window.addEventListener("scroll", update, { passive: true });
}

function initActiveNav() {
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { threshold: 0.28, rootMargin: "-24% 0px -58% 0px" });

  sections.forEach((section) => observer.observe(section));
}

initReveal();
initProjectSpotlight();
initPursuitScroll();
initActiveNav();

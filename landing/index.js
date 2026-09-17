// Scroll Progress Bar Tracker
function initScrollProgress() {
  const progressBar = document.getElementById("scroll-progress");
  if (!progressBar) return;

  window.addEventListener("scroll", () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

// Scroll Reveal Intersection Observer
function initReveal() {
  const revealEls = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

  revealEls.forEach((el) => observer.observe(el));
}

// Active Nav Link Observer (Desktop + Mobile Bottom Nav)
function initActiveNav() {
  const navLinks = document.querySelectorAll(".nav-links a, .mobile-nav-item");
  const sections = document.querySelectorAll("section[id]");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const currentId = entry.target.id;
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === `#${currentId}`) {
          link.classList.add("is-active");
        } else {
          link.classList.remove("is-active");
        }
      });
    });
  }, { threshold: 0.25, rootMargin: "-10% 0px -40% 0px" });

  sections.forEach((section) => observer.observe(section));
}

// Project Screenshot Modal Drawer Logic
const projectGalleries = {
  palindrome: {
    title: "Palindrome — Financial Intelligence & AI Copilot",
    images: [
      { src: "images/neuro_landing.png", caption: "Live Platform Dashboard & Net Worth Analytics" },
      { src: "images/ne_samp_analysis.png", caption: "Real-Time Telemetry & Asset Breakdown" },
      { src: "images/dashboard.png", caption: "Maliketh AI Copilot & Subscription Analytics" },
      { src: "images/neuro_code.png", caption: "Enterprise Architecture & WebSocket Engine" }
    ]
  },
  kaiforge: {
    title: "KaiForge — Athletic Performance Analytics Platform",
    images: [
      { src: "images/match_analysis.png", caption: "Granular Match Analysis & Shot Tracking" },
      { src: "images/practice_analysis.png", caption: "Daily Practice Sessions & Progress Trends" },
      { src: "images/dashboard.png", caption: "Player Performance Dashboard" },
      { src: "images/tmt_leauge.png", caption: "Tournament & League Tracking Engine" }
    ]
  }
};

function initModalGallery() {
  const modal = document.getElementById("gallery-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalGrid = document.getElementById("modal-gallery-grid");
  const closeBtn = document.getElementById("modal-close");

  if (!modal || !modalTitle || !modalGrid) return;

  window.openProjectModal = function(projectKey) {
    const data = projectGalleries[projectKey];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalGrid.innerHTML = data.images.map(img => `
      <div class="modal-img-card">
        <img src="${img.src}" alt="${img.caption}" loading="lazy">
        <div class="modal-img-caption">${img.caption}</div>
      </div>
    `).join("");

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

// Order Plan Pre-selection Handler
function initOrderButtons() {
  window.selectPlan = function(planName) {
    const serviceSelect = document.getElementById("service-select");
    const contactSection = document.getElementById("contact");
    
    if (serviceSelect && planName) {
      serviceSelect.value = planName;
    }
    
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };
}

// Card Mouse/Touch Spotlight
function initSpotlight() {
  document.querySelectorAll(".pricing-card, .project-card-v2, .process-card, .discipline-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    }, { passive: true });
  });
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initScrollProgress();
  initReveal();
  initActiveNav();
  initModalGallery();
  initOrderButtons();
  initSpotlight();
});

import { ProjectData, ProjectGalleryItem } from './types';

// Project Case Study Data Store
const projectGalleries: Record<string, ProjectData> = {
  neuroshield: {
    id: "neuroshield",
    title: "NeuroShield AI — Multimodal Deep Learning for Early Alzheimer's Risk Prediction",
    category: "AI Research & Neuroimaging",
    description: "Novel multimodal deep learning system predicting MCI-to-AD conversion timelines using ADNI dataset. Fuses 3D structural MRI, PET neuroimaging, and plasma blood biomarkers with 3D CNN + ViT encoders and Cross-Modal Attention Fusion.",
    techStack: ["PyTorch", "3D CNN", "Vision Transformers", "FT-Transformer", "ADNI Dataset", "ANTs & HD-BET", "Survival Analysis"],
    images: [
      { src: "images/neuro_landing.png", caption: "NeuroShield AI Platform & Diagnosis Interface" },
      { src: "images/ne_samp_analysis.png", caption: "Sample Analysis Output & Biomarker Radar" },
      { src: "images/neuro_overview.png", caption: "Multimodal Fusion Architecture Diagram" },
      { src: "images/neuro_code.png", caption: "ADNI PyTorch EfficientNet Scanning Pipeline" }
    ]
  },
  palindrome: {
    id: "palindrome",
    title: "Palindrome — Sovereign Financial Intelligence Core & Autonomous Wealth Engine",
    category: "Financial Telemetry & AI (Featured @ EUREKA! 2026)",
    description: "Architected sub-500ms real-time net worth telemetry engine with Socket.io streaming (450ms updates). Features a two-stage local VLM vision pipeline (FastAPI + Ollama/Gemma 2) with defensive visual triage, client-side Tesseract.js OCR, Maliketh AI Copilot with BullMQ action queues, and HMAC-SHA256 household ledger verification.",
    techStack: ["React 18", "Vite", "Node.js", "Express", "Python / FastAPI", "WebSockets", "Ollama (Gemma 2 VLM)", "MongoDB Atlas", "Redis & BullMQ", "GSAP & Lenis"],
    liveUrl: "https://palindrome.antoniusjairus.in",
    images: [
      { src: "images/palindrome_landing.png", caption: "Sovereign Financial Intelligence Core Landing Page" },
      { src: "images/palindrome_dashboard.png", caption: "Financial Intelligence Core Real-Time Dashboard (₹29,49,619.47)" },
      { src: "images/palindrome_maliketh.png", caption: "Maliketh AI Copilot Natural Language Action Drawer" },
      { src: "images/palindrome_house.png", caption: "Cryptographically Shared Household Ledger (HMAC-SHA256)" },
      { src: "images/palindrome_pricing.png", caption: "Tiered Pricing & 45-Day Free Access Plan Matrix" }
    ]
  },
  kaiforge: {
    id: "kaiforge",
    title: "KaiForge — Full-Stack Athletic Performance Analytics Platform",
    category: "Sports Analytics & MERN",
    description: "Scalable full-stack web application designed for table tennis players and athletes to log practice sessions, match performances, and tournament structures into granular data visualization dashboards.",
    techStack: ["TypeScript", "React + Vite", "Tailwind CSS", "Supabase", "PostgreSQL", "MERN Architecture"],
    liveUrl: "https://kaiforge.antoniusjairus.in",
    images: [
      { src: "images/match_analysis.png", caption: "Granular Match Analysis & Shot Tracking" },
      { src: "images/practice_analysis.png", caption: "Daily Practice Sessions & Progress Trends" },
      { src: "images/dashboard.png", caption: "Player Performance Dashboard" },
      { src: "images/tmt_leauge.png", caption: "Tournament & League Tracking Engine" }
    ]
  }
};

// 1. Scroll Progress Bar
function initScrollProgress(): void {
  const progressBar = document.getElementById("scroll-progress");
  if (!progressBar) return;

  window.addEventListener("scroll", () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

// 2. Scroll Reveal Intersection Observer
function initScrollReveal(): void {
  const revealElements = document.querySelectorAll<HTMLElement>("[data-reveal]");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -4% 0px" });

  revealElements.forEach((el) => observer.observe(el));
}

// 3. Active Nav Tracker (Desktop Header + Mobile Bottom Sticky Nav)
function initActiveNavTracker(): void {
  const navLinks = document.querySelectorAll<HTMLAnchorElement>(".nav-links a, .mobile-nav-item");
  const sections = document.querySelectorAll<HTMLElement>("section[id]");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          if (href === `#${id}`) {
            link.classList.add("is-active");
          } else {
            link.classList.remove("is-active");
          }
        });
      }
    });
  }, { threshold: 0.25, rootMargin: "-10% 0px -40% 0px" });

  sections.forEach((sec) => observer.observe(sec));
}

// 4. Interactive Case Study Screenshot Modal
function initModalGallery(): void {
  const modal = document.getElementById("gallery-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalGrid = document.getElementById("modal-gallery-grid");
  const closeBtn = document.getElementById("modal-close");

  if (!modal || !modalTitle || !modalGrid) return;

  (window as unknown as Record<string, unknown>).openProjectModal = function(projectId: string): void {
    const data = projectGalleries[projectId];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalGrid.innerHTML = data.images.map((img: ProjectGalleryItem) => `
      <div class="modal-img-card">
        <img src="${img.src}" alt="${img.caption}" loading="lazy" />
        <div class="modal-img-caption">${img.caption}</div>
      </div>
    `).join("");

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  function closeModal(): void {
    if (modal) {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (e: MouseEvent) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

// 5. Freelance Service Pre-selection Handler
function initFreelanceSelect(): void {
  (window as unknown as Record<string, unknown>).selectPlan = function(planName: string): void {
    const serviceSelect = document.getElementById("service-select") as HTMLSelectElement | null;
    const contactSection = document.getElementById("contact");

    if (serviceSelect && planName) {
      serviceSelect.value = planName;
    }

    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initScrollProgress();
  initScrollReveal();
  initActiveNavTracker();
  initModalGallery();
  initFreelanceSelect();
});

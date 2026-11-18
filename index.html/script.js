document.addEventListener("DOMContentLoaded", () => {
  /* 1. Dark / Light Ledger Theme Toggle */
  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const themeMeta = document.getElementById("theme-meta");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("map-portfolio-theme", theme);
    if (themeIcon) themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#0b0f17" : "#f6f3ec");
  }

  const savedTheme = localStorage.getItem("map-portfolio-theme") || "dark";
  applyTheme(savedTheme);

  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    showToast(`Switched to ${next === "dark" ? "Midnight Bento" : "Ledger Paper"} mode`);
  });

  /* 2. Mobile Navigation Drawer */
  const menuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");

  menuBtn?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.textContent = isOpen ? "✕" : "☰";
  });

  navLinks?.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("click", () => {
      if (el.id === "mobile-qr-trigger") return;
      navLinks.classList.remove("is-open");
      menuBtn?.setAttribute("aria-expanded", "false");
      if (menuBtn) menuBtn.textContent = "☰";
    });
  });

  /* 3. Cursor-Tracking Spotlight Glow on Bento Cards */
  document.querySelectorAll(".spotlight-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
  });

  /* 4. Interactive Skills Matrix Filtering */
  const skillPills = document.querySelectorAll("#skill-matrix .skill-pill");
  const filterableCards = document.querySelectorAll("[data-tags]");
  let activeTag = null;

  skillPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const tag = pill.dataset.tag;
      if (activeTag === tag) {
        activeTag = null;
        skillPills.forEach((p) => p.classList.remove("is-active"));
        filterableCards.forEach((c) => {
          c.classList.remove("is-highlighted", "is-dimmed");
        });
        showToast("Cleared skill filter");
        return;
      }

      activeTag = tag;
      skillPills.forEach((p) => p.classList.toggle("is-active", p.dataset.tag === tag));

      filterableCards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(" ");
        const matches = tags.includes(tag);
        card.classList.toggle("is-highlighted", matches);
        card.classList.toggle("is-dimmed", !matches);
      });

      showToast(`Highlighting projects & experience related to "${pill.textContent}"`);
    });
  });

  /* 5. Interactive "How I Build Solutions" Step Selector */
  const steps = document.querySelectorAll(".process-step");
  steps.forEach((step) => {
    step.addEventListener("click", () => {
      steps.forEach((s) => s.classList.remove("is-active"));
      step.classList.add("is-active");
    });
  });

  /* 6. Live Quezon City (Asia/Manila) Clock */
  const clockEl = document.getElementById("ph-clock");
  function updateClock() {
    if (!clockEl) return;
    clockEl.textContent = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* 7. Toast Notification Helper */
  function showToast(text) {
    let toast = document.getElementById("bento-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "bento-toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = `✓ ${text}`;
    toast.classList.add("is-visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("is-visible"), 2500);
  }

  /* 8. Project Filtering & Live Search */
  const filterTabs = document.querySelectorAll(".filter-tab");
  const projectTiles = document.querySelectorAll(".project-tile");
  const searchInput = document.getElementById("project-search");
  let activeFilter = "all";

  function filterProjects() {
    const query = (searchInput?.value || "").toLowerCase().trim();
    projectTiles.forEach((tile) => {
      const statusOk = activeFilter === "all" || tile.dataset.status === activeFilter;
      const textOk = !query || tile.textContent.toLowerCase().includes(query);
      tile.classList.toggle("is-hidden", !(statusOk && textOk));
    });
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeFilter = tab.dataset.filter;
      filterTabs.forEach((t) => {
        const isCurrent = t === tab;
        t.classList.toggle("is-active", isCurrent);
        t.setAttribute("aria-pressed", String(isCurrent));
      });
      filterProjects();
    });
  });

  searchInput?.addEventListener("input", filterProjects);

  /* 9. Multi-Screenshot Gallery Lightbox */
  const lightbox = document.getElementById("lightbox");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const counterEl = document.getElementById("gallery-counter");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");

  let galleryImages = [];
  let galleryCaptions = [];
  let galleryIndex = 0;

  function renderGallerySlide() {
    if (!galleryImages.length) return;
    lightboxImg.src = galleryImages[galleryIndex];
    lightboxImg.alt = galleryCaptions[galleryIndex] || "Project screenshot";
    lightboxCaption.textContent = galleryCaptions[galleryIndex] || "";
    counterEl.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;

    const single = galleryImages.length <= 1;
    prevBtn.classList.toggle("is-hidden", single);
    nextBtn.classList.toggle("is-hidden", single);
  }

  document.querySelectorAll(".media-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      if (!img || img.dataset.missing === "true") return;

      galleryImages = (btn.dataset.gallery || img.src).split(",").map((s) => s.trim()).filter(Boolean);
      galleryCaptions = (btn.dataset.captions || "").split("|").map((s) => s.trim());
      galleryIndex = 0;
      lightboxTitle.textContent = (btn.dataset.title || "APP SCREENSHOT").toUpperCase();

      renderGallerySlide();
      lightbox.showModal();
    });
  });

  prevBtn?.addEventListener("click", () => {
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    renderGallerySlide();
  });

  nextBtn?.addEventListener("click", () => {
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    renderGallerySlide();
  });

  document.getElementById("lightbox-close")?.addEventListener("click", () => lightbox.close());
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  /* Graceful Error Alert if an Image Path Doesn't Match */
  document.querySelectorAll(".project-img").forEach((img) => {
    img.addEventListener("error", () => {
      img.dataset.missing = "true";
      const src = img.getAttribute("src") || "images/screenshot.png";
      const btn = img.closest(".mac-frame");
      if (!btn) return;
      btn.style.cursor = "default";
      btn.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:220px;padding:20px;background:var(--bg);color:var(--text-muted);font-family:'JetBrains Mono',monospace;font-size:0.76rem;text-align:center;">
          <strong style="color:var(--text);margin-bottom:6px;">Missing: ${src}</strong>
          <span>Check exact filename &amp; .png/.jpg extension in images/</span>
        </div>
      `;
    });
  });

  /* 10. Direct Message Modal & Web3Forms */
  const msgModal = document.getElementById("message-modal");
  document.getElementById("open-message-modal")?.addEventListener("click", () => msgModal.showModal());
  document.getElementById("contact-open-modal")?.addEventListener("click", () => msgModal.showModal());
  document.getElementById("msg-modal-close")?.addEventListener("click", () => msgModal.close());
  msgModal?.addEventListener("click", (e) => {
    if (e.target === msgModal) msgModal.close();
  });

  const msgForm = document.getElementById("quick-message-form");
  const submitBtn = document.getElementById("msg-submit-btn");

  msgForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const accessKey = document.getElementById("web3forms-key")?.value;
    const name = document.getElementById("sender-name").value;
    const email = document.getElementById("sender-email").value;
    const msg = document.getElementById("sender-msg").value;

    if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
      window.location.href = `mailto:michaelangelolatypascual@gmail.com?subject=Portfolio Inquiry from ${encodeURIComponent(name)} (${encodeURIComponent(email)})&body=${encodeURIComponent(msg)}`;
      msgModal.close();
      showToast("Opening email app...");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const formData = new FormData(msgForm);
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        msgForm.reset();
        msgModal.close();
        showToast("Message sent directly to Michael!");
      } else {
        throw new Error("Submission failed");
      }
    } catch {
      showToast("Could not send online — opening mail app");
      window.location.href = `mailto:michaelangelolatypascual@gmail.com?subject=Portfolio Inquiry from ${encodeURIComponent(name)}&body=${encodeURIComponent(msg)}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message →";
    }
  });

  /* 11. Real Scannable vCard & QR Code Modal */
  const qrModal = document.getElementById("qr-modal");
  const qrContainer = document.getElementById("qrcode-container");
  const openQrTriggers = [
    document.getElementById("qr-modal-trigger"),
    document.getElementById("qr-tile-trigger"),
    document.getElementById("mobile-qr-trigger"),
  ];

  const vcardData = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:Michael Angelo Pascual",
    "N:Pascual;Michael;Angelo;;",
    "TITLE:Administrative Officer & Finance Assistant",
    "ORG:INCITEGov Inc.",
    "EMAIL;TYPE=WORK:michaelangelolatypascual@gmail.com",
    "URL:https://mike-l22.github.io/",
    "ADR;TYPE=WORK:;;Quezon City;Metro Manila;;;Philippines",
    "END:VCARD",
  ].join("\r\n");

  if (qrContainer && typeof QRCode !== "undefined") {
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
      text: vcardData,
      width: 180,
      height: 180,
      colorDark: "#0b0f17",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
  }

  openQrTriggers.forEach((btn) => {
    btn?.addEventListener("click", () => {
      navLinks?.classList.remove("is-open");
      qrModal?.showModal();
    });
  });

  document.getElementById("qr-modal-close")?.addEventListener("click", () => qrModal?.close());
  qrModal?.addEventListener("click", (e) => {
    if (e.target === qrModal) qrModal.close();
  });

  const vcardBlob = new Blob([vcardData], { type: "text/vcard;charset=utf-8" });
  const vcardUrl = URL.createObjectURL(vcardBlob);
  const downloadVcardBtn = document.getElementById("download-vcard-btn");
  if (downloadVcardBtn) {
    downloadVcardBtn.href = vcardUrl;
    downloadVcardBtn.download = "Michael_Angelo_Pascual.vcf";
  }

  /* 12. Copy Email & Keyboard Shortcuts */
  const copyBtn = document.getElementById("copy-email");
  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email);
      showToast("Email copied to clipboard");
    } catch {
      showToast("Unable to copy automatically");
    }
  });

  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
      e.preventDefault();
      searchInput?.focus();
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    }
    if (lightbox?.open) {
      if (e.key === "ArrowRight") nextBtn?.click();
      if (e.key === "ArrowLeft") prevBtn?.click();
    }
  });
});
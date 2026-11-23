document.addEventListener("DOMContentLoaded", () => {
  /* 1. Light / Dark Theme Toggle */
  const root = document.documentElement;
  const themeBtns = [document.getElementById("theme-toggle"), document.getElementById("theme-toggle-desktop")];
  const themeMeta = document.getElementById("theme-meta");
  const themeLabel = document.getElementById("theme-label");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("map-portfolio-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#16161a" : "#faf8f3");
    if (themeLabel) themeLabel.textContent = theme === "dark" ? "Paper light mode" : "Dark ink mode";
  }

  applyTheme(localStorage.getItem("map-portfolio-theme") || "light");

  themeBtns.forEach((btn) => {
    btn?.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      showToast(`Switched to ${next === "dark" ? "Dark Ink" : "Archival Paper"} mode`);
    });
  });

  /* 2. Mobile Nav Toggle */
  const menuBtn = document.getElementById("menu-btn");
  const mobileNav = document.getElementById("mobile-nav");

  menuBtn?.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.textContent = isOpen ? "✕" : "☰";
  });

  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.textContent = "☰";
    });
  });

  /* 3. Live Quezon City (Asia/Manila) Clock */
  const clockEl = document.getElementById("mnl-clock");
  function updateClock() {
    if (!clockEl) return;
    clockEl.textContent = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  updateClock();
  setInterval(updateClock, 15000);

  /* 4. Reading Progress Bar */
  const progressBar = document.getElementById("progress");
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  /* 5. Scroll-Spy for Rail + Mobile Nav */
  const sections = document.querySelectorAll(".section[id]");
  const navLinks = document.querySelectorAll("[data-nav]");

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.nav === id);
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveNav(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
  }

  /* 6. "How I Build" Process Step Switcher */
  const stepDetails = {
    1: "Identify scattered notes, bottlenecks, and the fields that actually need to be tracked, before opening any tool.",
    2: "Design simple, related tables for costs, schedules, or records so every entry connects cleanly to the next.",
    3: "Ship a fast, focused screen that makes daily tracking obvious — nothing to learn, nothing extra to click through.",
  };
  const stepButtons = document.querySelectorAll(".process-step");
  const stepDetail = document.getElementById("process-detail");

  stepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      stepButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      if (stepDetail) stepDetail.textContent = stepDetails[btn.dataset.step] || "";
    });
  });

  /* 7. Project Status Filtering */
  const filterChips = document.querySelectorAll(".filter-chip");
  const projects = document.querySelectorAll(".project");

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const target = chip.dataset.filter;
      filterChips.forEach((c) => c.classList.toggle("is-active", c === chip));
      projects.forEach((proj) => {
        const show = target === "all" || proj.dataset.status === target;
        proj.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* 8. Toast Helper */
  function showToast(text) {
    let toast = document.getElementById("map-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "map-toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  /* 9. Lightbox Gallery */
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

  function renderSlide() {
    if (!galleryImages.length) return;
    lightboxImg.src = galleryImages[galleryIndex];
    lightboxImg.alt = galleryCaptions[galleryIndex] || "Project screenshot";
    lightboxCaption.textContent = galleryCaptions[galleryIndex] || "";
    counterEl.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
    const single = galleryImages.length <= 1;
    prevBtn.classList.toggle("is-hidden", single);
    nextBtn.classList.toggle("is-hidden", single);
  }

  document.querySelectorAll(".project-media-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      if (!img || img.dataset.missing === "true") return;

      galleryImages = (btn.dataset.gallery || img.src).split(",").map((s) => s.trim()).filter(Boolean);
      galleryCaptions = (btn.dataset.captions || "").split("|").map((s) => s.trim());
      galleryIndex = 0;
      lightboxTitle.textContent = btn.dataset.title || "Screenshot";

      renderSlide();
      lightbox.showModal();
    });
  });

  prevBtn?.addEventListener("click", () => {
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    renderSlide();
  });

  nextBtn?.addEventListener("click", () => {
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    renderSlide();
  });

  document.getElementById("lightbox-close")?.addEventListener("click", () => lightbox.close());
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  /* 10. Graceful Placeholder for Missing Screenshots */
  document.querySelectorAll(".project-media-btn img").forEach((img) => {
    img.addEventListener("error", () => {
      img.dataset.missing = "true";
      const src = img.getAttribute("src") || "images/screenshot.png";
      const btn = img.closest(".project-media-btn");
      if (!btn) return;
      btn.style.cursor = "default";
      btn.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;aspect-ratio:16/10;padding:20px;color:var(--muted);font-size:0.82rem;text-align:center;">
          <strong style="color:var(--ink);margin-bottom:6px;">${src}</strong>
          <span>Drop this screenshot into the images folder</span>
        </div>
      `;
    });
  });

  /* 11. Contact Modal */
  const msgModal = document.getElementById("message-modal");
  [document.getElementById("open-message-modal"), document.getElementById("contact-open-modal")]
    .forEach((btn) => btn?.addEventListener("click", () => msgModal.showModal()));

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
      window.location.href = `mailto:michaelangelolatypascual@gmail.com?subject=${encodeURIComponent(
        "Portfolio inquiry from " + name
      )}&body=${encodeURIComponent(msg + "\n\n— " + name + " (" + email + ")")}`;
      msgModal.close();
      showToast("Opening your email app…");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(msgForm),
      });
      const data = await res.json();
      if (data.success) {
        msgForm.reset();
        msgModal.close();
        showToast("Message sent.");
      } else {
        throw new Error("Submission failed");
      }
    } catch {
      showToast("Could not send online — opening mail app");
      window.location.href = `mailto:michaelangelolatypascual@gmail.com?subject=${encodeURIComponent(
        "Portfolio inquiry from " + name
      )}&body=${encodeURIComponent(msg)}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
    }
  });

  /* 12. Copy Email */
  const copyBtn = document.getElementById("copy-email");
  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email);
      showToast("Email copied");
    } catch {
      showToast("Couldn't copy automatically");
    }
  });

  /* 13. Business Card — dynamic vCard + QR */
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Pascual;Michael Angelo;;;",
    "FN:Michael Angelo Pascual",
    "ORG:INCITEGov Inc.",
    "TITLE:Administrative Officer & Finance Assistant",
    "EMAIL;TYPE=INTERNET:michaelangelolatypascual@gmail.com",
    "ADR;TYPE=WORK:;;Quezon City;;;Philippines",
    "URL;TYPE=Portfolio:https://mike-l22.github.io/",
    "URL;TYPE=LinkedIn:https://www.linkedin.com/in/michael-angelo-pascual-4b5041184/",
    "URL;TYPE=GitHub:https://github.com/mike-L22",
    "NOTE:From Michael's portfolio business card",
    "END:VCARD",
  ].join("\r\n");

  const vcardLink = document.getElementById("vcard-download");
  if (vcardLink) {
    const blob = new Blob([vcard], { type: "text/vcard" });
    vcardLink.href = URL.createObjectURL(blob);
    vcardLink.setAttribute("download", "michael-angelo-pascual.vcf");
  }

  const qrEl = document.getElementById("qr-code");
  if (qrEl) {
    if (typeof QRCode !== "undefined") {
      new QRCode(qrEl, {
        text: vcard,
        width: 112,
        height: 112,
        colorDark: "#19191d",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M,
      });
    } else {
      qrEl.innerHTML = '<span class="qr-fallback">QR unavailable offline — use the download link</span>';
    }
  }

  /* 14. Keyboard nav for lightbox */
  document.addEventListener("keydown", (e) => {
    if (lightbox?.open) {
      if (e.key === "ArrowRight") nextBtn?.click();
      if (e.key === "ArrowLeft") prevBtn?.click();
    }
  });
});

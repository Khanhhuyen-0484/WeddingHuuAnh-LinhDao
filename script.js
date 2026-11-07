/* 1. CHỈNH NGÀY CƯỚI */
const weddingDate = "2026-11-29T10:00:00";
const dateObject = new Date(weddingDate);

if (!Number.isNaN(dateObject.getTime())) {
  document.getElementById("heroDate").textContent =
    dateObject.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replaceAll("/", " . ");
}

/* 2. ĐẾM NGƯỢC */
function updateCountdown() {
  const now = new Date();
  const distance = dateObject.getTime() - now.getTime();

  if (Number.isNaN(distance)) return;

  if (distance <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach(id => {
      document.getElementById(id).textContent = "00";
    });
    document.getElementById("countdownMessage").textContent =
      "Ngày hạnh phúc đã đến. Chúc mừng Hữu Anh & Đào Linh!";
    return;
  }

  document.getElementById("days").textContent =
    Math.floor(distance / (1000 * 60 * 60 * 24));
  document.getElementById("hours").textContent =
    String(Math.floor((distance / (1000 * 60 * 60)) % 24)).padStart(2, "0");
  document.getElementById("minutes").textContent =
    String(Math.floor((distance / (1000 * 60)) % 60)).padStart(2, "0");
  document.getElementById("seconds").textContent =
    String(Math.floor((distance / 1000) % 60)).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* 3. PHÁT NHẠC */
const bgAudio = document.getElementById("bgAudio");
const musicBtn = document.getElementById("musicBtn");

function playAudio() {
  bgAudio.play().then(() => {
    musicBtn.classList.add("playing");
    musicBtn.textContent = "♫";
  }).catch(err => console.log(err));
}

function pauseAudio() {
  bgAudio.pause();
  musicBtn.classList.remove("playing");
  musicBtn.textContent = "♪";
}

musicBtn.addEventListener("click", () => {
  if (bgAudio.paused) playAudio();
  else pauseAudio();
});

document.getElementById("openBtn").addEventListener("click", () => {
  document.getElementById("cover").classList.add("hide");
  playAudio();
});

/* 4. HỘP MỪNG CƯỚI (MỞ MODAL & CHUYỂN TAB & SAO CHÉP STK) */
const giftModal = document.getElementById("giftModal");
const openGiftBtn = document.getElementById("openGiftBtn");
const closeGiftBtn = document.getElementById("closeGiftBtn");

if (openGiftBtn && giftModal) {
  openGiftBtn.addEventListener("click", () => {
    giftModal.classList.add("active");
    giftModal.setAttribute("aria-hidden", "false");
  });
}

if (closeGiftBtn && giftModal) {
  closeGiftBtn.addEventListener("click", () => {
    giftModal.classList.remove("active");
    giftModal.setAttribute("aria-hidden", "true");
  });
  giftModal.addEventListener("click", (e) => {
    if (e.target === giftModal) {
      giftModal.classList.remove("active");
      giftModal.setAttribute("aria-hidden", "true");
    }
  });
}

document.querySelectorAll(".gift-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".gift-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".gift-pane").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    const targetPane = document.getElementById(tab.dataset.target);
    if (targetPane) targetPane.classList.add("active");
  });
});

function copySTK(elementId) {
  const stkText = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(stkText).then(() => {
    showToastMessage("Đã sao chép số tài khoản!");
  });
}

/* 5. LƯU & HIỂN THỊ LỜI CHÚC (GOOGLE SHEETS + LOCALSTORAGE) */
const GOOGLE_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyFwuwAQdkV5hbSk9PqSKdh9i1Uyw8uzoMN8p5-0szECz3ktFqm8PlNJFUa2LALDO4qhA/exec";
const LOCAL_WISHES_KEY = "wedding_wishes_daolinh_huuanh";
const INITIAL_VISIBLE_WISHES = 4; // Chỉ hiện 4 lời chúc mới nhất cho gọn trang

const wishForm = document.getElementById("wishForm");
const wishesList = document.getElementById("wishesList");
const wishSubmitBtn = wishForm ? wishForm.querySelector(".wish-btn") : null;

let allWishesData = [
  {
    name: "Minh Trí & Ánh Nguyệt",
    wish: "Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương và bên nhau bền lâu nhé!",
    time: ""
  }
];
let showingAllWishes = false;

// Tạo nút Xem thêm / Thu gọn bên dưới danh sách lời chúc
const toggleWishesBtn = document.createElement("button");
toggleWishesBtn.type = "button";
toggleWishesBtn.className = "wishes-more-btn";
toggleWishesBtn.style.display = "none";
if (wishesList && wishesList.parentNode) {
  wishesList.parentNode.appendChild(toggleWishesBtn);
}

toggleWishesBtn.addEventListener("click", () => {
  showingAllWishes = !showingAllWishes;
  renderWishesList();
});

function createWishElement({ name, wish, time, attendance, count }) {
  const item = document.createElement("div");
  item.className = "wish-item";

  const header = document.createElement("div");
  header.className = "wish-header";

  const titleWrap = document.createElement("div");
  const title = document.createElement("h4");
  title.textContent = name;
  titleWrap.appendChild(title);

  if (attendance) {
    const badge = document.createElement("span");
    badge.className = "wish-badge";
    if (attendance === "Sẽ tham dự") {
      badge.classList.add("attending");
      badge.textContent = "✓ Sẽ tham dự" + (count ? (" · " + count) : "");
    } else if (attendance === "Gửi lời chúc từ xa") {
      badge.classList.add("not-attending");
      badge.textContent = "♡ Gửi lời chúc từ xa";
    } else {
      badge.textContent = "? Chưa chắc chắn";
    }
    titleWrap.appendChild(badge);
  }

  header.appendChild(titleWrap);

  if (time) {
    const timeEl = document.createElement("span");
    timeEl.className = "wish-time";
    timeEl.textContent = time;
    header.appendChild(timeEl);
  }

  const body = document.createElement("p");
  body.textContent = wish;

  item.appendChild(header);
  item.appendChild(body);
  return item;
}

function renderWishesList() {
  if (!wishesList) return;
  wishesList.innerHTML = "";

  const visibleItems = showingAllWishes
    ? allWishesData
    : allWishesData.slice(0, INITIAL_VISIBLE_WISHES);

  visibleItems.forEach(entry => {
    wishesList.appendChild(createWishElement(entry));
  });

  if (allWishesData.length > INITIAL_VISIBLE_WISHES) {
    toggleWishesBtn.style.display = "inline-block";
    const hiddenCount = allWishesData.length - INITIAL_VISIBLE_WISHES;
    toggleWishesBtn.textContent = showingAllWishes
      ? "Thu gọn lời chúc ↑"
      : "Xem thêm " + hiddenCount + " lời chúc ↓";
    wishesList.classList.toggle("expanded", showingAllWishes);
  } else {
    toggleWishesBtn.style.display = "none";
    wishesList.classList.remove("expanded");
  }
}

function showToastMessage(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function getLocalWishes() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_WISHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalWish(entry) {
  const current = getLocalWishes();
  current.unshift(entry);
  localStorage.setItem(LOCAL_WISHES_KEY, JSON.stringify(current.slice(0, 50)));
}

function initLocalWishes() {
  const localWishes = getLocalWishes();
  if (localWishes.length > 0) {
    allWishesData = [...localWishes, ...allWishesData];
  }
  renderWishesList();
}

async function fetchRemoteWishes() {
  if (!GOOGLE_SHEETS_WEBAPP_URL) return;
  try {
    const res = await fetch(GOOGLE_SHEETS_WEBAPP_URL);
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      allWishesData = data;
      renderWishesList();
    }
  } catch (err) {
    console.log("Không thể tải lời chúc từ Google Sheets:", err);
  }
}

initLocalWishes();
window.addEventListener("load", () => {
  setTimeout(fetchRemoteWishes, 800);
});

const attendanceSelect = document.getElementById("guestAttendance");
const guestCountSelect = document.getElementById("guestCount");
const guestCountCol = document.getElementById("guestCountCol");

if (attendanceSelect && guestCountCol) {
  attendanceSelect.addEventListener("change", () => {
    if (attendanceSelect.value === "Gửi lời chúc từ xa") {
      guestCountCol.style.opacity = "0.35";
      guestCountCol.style.pointerEvents = "none";
    } else {
      guestCountCol.style.opacity = "1";
      guestCountCol.style.pointerEvents = "auto";
    }
  });
}

wishForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("guestName");
  const wishInput = document.getElementById("guestWish");
  const name = nameInput.value.trim();
  const wish = wishInput.value.trim();

  if (!name || !wish) return;

  const attendance = attendanceSelect ? attendanceSelect.value : "Sẽ tham dự";
  const count = (attendance === "Gửi lời chúc từ xa") ? "" : (guestCountSelect ? guestCountSelect.value : "");

  const entry = {
    name,
    wish,
    attendance,
    count,
    time: new Date().toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  };

  allWishesData.unshift(entry);
  renderWishesList();
  saveLocalWish(entry);
  nameInput.value = "";
  wishInput.value = "";
  showToastMessage("💌 Đã gửi lời chúc thành công!");

  if (GOOGLE_SHEETS_WEBAPP_URL) {
    if (wishSubmitBtn) {
      wishSubmitBtn.disabled = true;
      wishSubmitBtn.textContent = "Đang gửi...";
    }
    try {
      await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(entry)
      });
    } catch (err) {
      console.log("Lỗi đồng bộ Google Sheets:", err);
    } finally {
      if (wishSubmitBtn) {
        wishSubmitBtn.disabled = false;
        wishSubmitBtn.textContent = "Gửi Lời Chúc 💌";
      }
    }
  }
});

/* 6. THƯỚC PHIM KỶ NIỆM (TỰ CHẠY MƯỢT TRÊN ĐIỆN THOẠI & KHÔNG TRÙNG ẢNH) */
const filmTrack = document.getElementById("filmstripTrack");

let isFilmPaused = false;
let resumeTimer = null;
let exactScrollPos = 0;
let filmDirection = 1; // 1: trượt sang phải, -1: trượt ngược lại khi tới cuối

function pauseFilmTemporarily(delay = 2800) {
  isFilmPaused = true;
  if (resumeTimer) clearTimeout(resumeTimer);
  resumeTimer = setTimeout(() => {
    if (filmTrack) exactScrollPos = filmTrack.scrollLeft;
    isFilmPaused = false;
  }, delay);
}

let isGalleryInView = false;
const gallerySection = document.querySelector(".gallery-section");
if (gallerySection && "IntersectionObserver" in window) {
  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isGalleryInView = entry.isIntersecting;
    });
  }, { rootMargin: "150px 0px" });
  galleryObserver.observe(gallerySection);
} else {
  isGalleryInView = true;
}

if (filmTrack) {
  let lastFrameTime = performance.now();
  const speedPxPerSec = 42; // Tốc độ trượt mượt trên cả màn hình 60Hz và 120Hz

  function stepFilm(now) {
    const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
    lastFrameTime = now;

    const maxScroll = filmTrack.scrollWidth - filmTrack.clientWidth;
    if (!isFilmPaused && isGalleryInView && maxScroll > 4) {
      // Giữ biến số thực để trình duyệt điện thoại không làm tròn về 0
      exactScrollPos += speedPxPerSec * dt * filmDirection;

      if (exactScrollPos >= maxScroll) {
        exactScrollPos = maxScroll;
        filmDirection = -1;
      } else if (exactScrollPos <= 0) {
        exactScrollPos = 0;
        filmDirection = 1;
      }

      filmTrack.scrollLeft = Math.round(exactScrollPos);
    }
    requestAnimationFrame(stepFilm);
  }
  requestAnimationFrame(stepFilm);

  filmTrack.addEventListener("touchstart", () => {
    isFilmPaused = true;
    if (resumeTimer) clearTimeout(resumeTimer);
  }, { passive: true });

  filmTrack.addEventListener("touchend", () => {
    pauseFilmTemporarily(2800);
  }, { passive: true });

  filmTrack.addEventListener("touchcancel", () => {
    pauseFilmTemporarily(2800);
  }, { passive: true });

  filmTrack.addEventListener("mouseenter", () => {
    isFilmPaused = true;
  });

  filmTrack.addEventListener("mouseleave", () => {
    exactScrollPos = filmTrack.scrollLeft;
    isFilmPaused = false;
  });
}

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

const albumSources = Array.from(document.querySelectorAll("#filmstripTrack .film-card img")).map(img => img.src);
let currentLightboxIdx = 0;

function openLightboxWithSrc(src) {
  const idx = albumSources.indexOf(src);
  currentLightboxIdx = idx !== -1 ? idx : 0;
  lightboxImg.src = src;
  lightbox.classList.add("active");
  isFilmPaused = true;
}

document.querySelectorAll(".film-card img, .person-img").forEach(img => {
  img.addEventListener("click", () => openLightboxWithSrc(img.src));
});

// Vuốt trái/phải trực tiếp trên màn hình trong Lightbox để chuyển ảnh
let touchStartX = 0;
lightbox.addEventListener("touchstart", (e) => {
  if (e.touches && e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
  }
}, { passive: true });

lightbox.addEventListener("touchend", (e) => {
  if (!e.changedTouches || e.changedTouches.length === 0 || albumSources.length === 0) return;
  const diffX = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diffX) > 45) {
    if (diffX < 0) {
      currentLightboxIdx = (currentLightboxIdx + 1) % albumSources.length;
    } else {
      currentLightboxIdx = (currentLightboxIdx - 1 + albumSources.length) % albumSources.length;
    }
    lightboxImg.src = albumSources[currentLightboxIdx];
  }
}, { passive: true });

lightboxClose.addEventListener("click", () => {
  lightbox.classList.remove("active");
  pauseFilmTemporarily(1500);
});
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove("active");
    pauseFilmTemporarily(1500);
  }
});

/* 7. CANVAS ĐỐM SÁNG XANH VÀNG PASTELL */
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
let width, height;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const particles = [];

const particleCount = window.innerWidth < 650 ? 16 : 30;
for (let i = 0; i < particleCount; i++) {
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 1,
    color: Math.random() > 0.5 ? "rgba(212, 175, 55, 0.35)" : "rgba(237, 244, 239, 0.35)",
    speedY: Math.random() * 0.6 + 0.2,
    speedX: Math.random() * 0.4 - 0.2,
    swing: Math.random() * 0.02
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach(p => {
    p.y += p.speedY;
    p.x += Math.sin(p.y * p.swing) * 0.5 + p.speedX;

    if (p.y > height) {
      p.y = -10;
      p.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });

  requestAnimationFrame(animateParticles);
}
animateParticles();

/* 8. REVEAL CUỘN */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

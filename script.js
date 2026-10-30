/* 1. CHỈNH NGÀY CƯỚI */
const weddingDate = "2026-11-29T11:00:00";
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
      "Ngày hạnh phúc đã đến. Chúc mừng Đào Linh & Hữu Anh!";
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
// Dán link Web App Google Apps Script của bạn vào giữa 2 dấu nháy dưới đây:
const GOOGLE_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyFwuwAQdkV5hbSk9PqSKdh9i1Uyw8uzoMN8p5-0szECz3ktFqm8PlNJFUa2LALDO4qhA/exec";
const LOCAL_WISHES_KEY = "wedding_wishes_daolinh_huuanh";

const wishForm = document.getElementById("wishForm");
const wishesList = document.getElementById("wishesList");
const wishSubmitBtn = wishForm ? wishForm.querySelector(".wish-btn") : null;

function createWishElement({ name, wish, time }) {
  const item = document.createElement("div");
  item.className = "wish-item";

  const header = document.createElement("div");
  header.className = "wish-header";

  const title = document.createElement("h4");
  title.textContent = name;
  header.appendChild(title);

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
  localStorage.setItem(LOCAL_WISHES_KEY, JSON.stringify(current.slice(0, 100)));
}

async function loadWishes() {
  // 1. Hiển thị lời chúc đã lưu trong localStorage trước để không có độ trễ
  const localWishes = getLocalWishes();
  localWishes.slice().reverse().forEach(entry => {
    wishesList.prepend(createWishElement(entry));
  });

  // 2. Nếu đã cấu hình Google Sheets URL thì tải toàn bộ lời chúc từ Google Sheets
  if (!GOOGLE_SHEETS_WEBAPP_URL) return;

  try {
    const res = await fetch(GOOGLE_SHEETS_WEBAPP_URL);
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      wishesList.innerHTML = "";
      data.forEach(entry => {
        wishesList.appendChild(createWishElement(entry));
      });
    }
  } catch (err) {
    console.log("Không thể tải lời chúc từ Google Sheets:", err);
  }
}

loadWishes();

wishForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("guestName");
  const wishInput = document.getElementById("guestWish");
  const name = nameInput.value.trim();
  const wish = wishInput.value.trim();

  if (!name || !wish) return;

  const entry = {
    name,
    wish,
    time: new Date().toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  };

  // Hiển thị ngay lập tức lên đầu danh sách và lưu vào localStorage
  wishesList.prepend(createWishElement(entry));
  saveLocalWish(entry);
  nameInput.value = "";
  wishInput.value = "";
  showToastMessage("💌 Đã gửi lời chúc thành công!");

  // Đồng bộ lên Google Sheets nếu đã điền URL
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

/* 6. MODAL XEM ẢNH */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

document.querySelectorAll(".gallery-item img, .person-img").forEach(img => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightbox.classList.add("active");
  });
});

lightboxClose.addEventListener("click", () => lightbox.classList.remove("active"));
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.classList.remove("active");
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

for (let i = 0; i < 40; i++) {
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

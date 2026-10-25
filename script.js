/* 1. CHỈNH NGÀY CƯỚI */
const weddingDate = "2026-12-20T10:00:00";
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

/* 4. SAO CHÉP STK */
function copySTK(elementId) {
  const stkText = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(stkText).then(() => {
    const toast = document.getElementById("toast");
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  });
}

/* 5. GỬI LỜI CHÚC TRỰC TIẾP */
document.getElementById("wishForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("guestName").value;
  const wish = document.getElementById("guestWish").value;

  if (name && wish) {
    const list = document.getElementById("wishesList");
    const newWish = document.createElement("div");
    newWish.className = "wish-item";
    newWish.innerHTML = `<h4>${name}</h4><p>${wish}</p>`;
    list.prepend(newWish);

    document.getElementById("guestName").value = "";
    document.getElementById("guestWish").value = "";
  }
});

/* 6. MODAL XEM ẢNH */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

document.querySelectorAll(".gallery-item img").forEach(img => {
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
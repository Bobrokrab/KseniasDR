// ---------------- background animation ----------------
const canvas = document.getElementById('pixel-bg');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener('resize', resize);

// pixel float squares bg
const squares = Array.from({ length: 40 }, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  s: 8 + Math.random() * 28,
  vx: (Math.random() - 0.5) * 0.3,
  vy: (Math.random() - 0.5) * 0.3,
  hue: Math.random() * 360
}));
function bgAnim() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  squares.forEach(s => {
    s.x += s.vx;
    s.y += s.vy;
    if (s.x < -50) s.x = canvas.width + 50;
    if (s.x > canvas.width + 50) s.x = -50;
    if (s.y < -50) s.y = canvas.height + 50;
    if (s.y > canvas.height + 50) s.y = -50;
    ctx.fillStyle = `hsla(${s.hue},90%,55%,${0.03 + Math.random() * 0.05})`;
    ctx.fillRect(s.x, s.y, s.s, s.s);
  });
  requestAnimationFrame(bgAnim);
}
bgAnim();

// ---------------- game elements ----------------
const game = document.getElementById("game");
const rat = document.getElementById("rat");
const scoreEl = document.getElementById("score");

// available rat sprites (existing files only)
const ratImages = [
  "images/rat1.png",
  "images/rat2.png",
  "images/rat3.png",
  "images/rat4.png"
];

rat.src = ratImages[0];

let gameRect = game.getBoundingClientRect();

function updateRect() {
  gameRect = game.getBoundingClientRect();
}
addEventListener("resize", updateRect);

// convert absolute mouse coords → local game coords
function toLocal(x, y) {
  return {
    x: x - gameRect.left,
    y: y - gameRect.top
  };
}

// ---------------- movement logic ----------------
let ratPos = { x: 200, y: 150 };
let ratVel = { x: 0, y: 0 };

function placeRat() {
  ratPos.x = 80 + Math.random() * (gameRect.width - 160);
  ratPos.y = 80 + Math.random() * (gameRect.height - 160);
  rat.style.left = ratPos.x + "px";
  rat.style.top = ratPos.y + "px";
}
placeRat();

// track mouse/touch
let pointer = { x: innerWidth / 2, y: innerHeight / 2 };

["mousemove", "touchmove"].forEach(ev => {
  window.addEventListener(ev, e => {
    if (e.type === "touchmove") {
      const t = e.touches[0];
      pointer.x = t.clientX;
      pointer.y = t.clientY;
    } else {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
  }, { passive: true });
});

// ---------------- main loop ----------------
function loop() {
  const local = toLocal(pointer.x, pointer.y);
  const dx = local.x - ratPos.x;
  const dy = local.y - ratPos.y;
  const dist = Math.hypot(dx, dy) || 1;

  const fleeRadius = 160;
  const accel = 0.45;
  const maxSpeed = 6;

  if (dist < fleeRadius) {
    const ux = -dx / dist;
    const uy = -dy / dist;
    ratVel.x += ux * accel;
    ratVel.y += uy * accel;
  } else {
    ratVel.x += (Math.random() - 0.5) * 0.2;
    ratVel.y += (Math.random() - 0.5) * 0.2;
  }

  const sp = Math.hypot(ratVel.x, ratVel.y);
  if (sp > maxSpeed) {
    ratVel.x = (ratVel.x / sp) * maxSpeed;
    ratVel.y = (ratVel.y / sp) * maxSpeed;
  }

  ratPos.x += ratVel.x;
  ratPos.y += ratVel.y;

  // keeps rat inside game block
  const pad = 35;
  if (ratPos.x < pad) { ratPos.x = pad; ratVel.x *= -0.6; }
  if (ratPos.x > gameRect.width - pad) { ratPos.x = gameRect.width - pad; ratVel.x *= -0.6; }
  if (ratPos.y < pad) { ratPos.y = pad; ratVel.y *= -0.6; }
  if (ratPos.y > gameRect.height - pad) { ratPos.y = gameRect.height - pad; ratVel.y *= -0.6; }

  rat.style.left = ratPos.x + "px";
  rat.style.top = ratPos.y + "px";

  // rotation for movement effect
  rat.style.transform = `translate(-50%,-50%) rotate(${ratVel.x * 3}deg)`;

  requestAnimationFrame(loop);
}
loop();

// ---------------- catching ----------------
function caught() {
  scoreEl.textContent = Number(scoreEl.textContent) + 1;

  // random rat sprite
  rat.src = ratImages[Math.floor(Math.random() * ratImages.length)];

  // gift animation
  const gift = document.createElement("div");
  gift.className = "gift";
  gift.textContent = "🎁";
  gift.style.left = ratPos.x + "px";
  gift.style.top = ratPos.y + "px";
  document.body.appendChild(gift);

  setTimeout(() => gift.remove(), 1200);

  // pop text
  const pop = document.createElement("div");
  pop.className = "caught-pop";
  pop.textContent = "+1 🎁";
  pop.style.left = ratPos.x + "px";
  pop.style.top = ratPos.y + "px";
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 900);

  // respawn
  setTimeout(() => {
    ratVel.x = 0;
    ratVel.y = 0;
    placeRat();
  }, 150);
}

function pointerHitsRat(x, y) {
  const r = rat.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

window.addEventListener("click", e => {
  if (pointerHitsRat(e.clientX, e.clientY)) caught();
});
window.addEventListener("touchend", e => {
  const t = e.changedTouches[0];
  if (t && pointerHitsRat(t.clientX, t.clientY)) caught();
});

      onRatCaught();
    }
  }
});

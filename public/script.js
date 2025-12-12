// Игра: убегающая крыса + падение подарка при поимке.
// Работает на desktop и mobile (touch).
// Не добавляет новых картинок — использует существующие images/rat*.png

// ---------------- background (пятнистая пиксельная анимация) ----------------
const canvas = document.getElementById('pixel-bg');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener('resize', resize);

// простая пиксельная анимация (плавающие квадраты)
const squares = Array.from({length: 40}, () => ({
  x: Math.random()*canvas.width,
  y: Math.random()*canvas.height,
  s: 8 + Math.random()*28,
  vx: (Math.random()-0.5)*0.3,
  vy: (Math.random()-0.5)*0.3,
  hue: Math.random()*360
}));
function bgAnim(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  squares.forEach(s=>{
    s.x += s.vx; s.y += s.vy;
    if(s.x< -50) s.x = canvas.width+50;
    if(s.x> canvas.width+50) s.x = -50;
    if(s.y< -50) s.y = canvas.height+50;
    if(s.y> canvas.height+50) s.y = -50;
    ctx.fillStyle = `hsla(${s.hue},90%,55%,${0.03 + Math.random()*0.05})`;
    ctx.fillRect(s.x, s.y, s.s, s.s);
  });
  requestAnimationFrame(bgAnim);
}
bgAnim();

// ---------------- game logic ----------------
const rat = document.getElementById('rat');
const game = document.getElementById('game');
const hudScore = document.getElementById('score');

let score = 0;
let ratPos = {x:200, y:150};
let ratVel = {x:0, y:0};
let canvasRect = game.getBoundingClientRect();
function refreshRect(){ canvasRect = game.getBoundingClientRect(); }
addEventListener('resize', refreshRect);
refreshRect();

// image list — использует существующие файлы (если их нет, браузер покажет пустое)
const ratImages = [
  'images/rat1.png',
  'images/rat2.png',
  'images/rat3.png',
  'images/rat4.png'
].filter(Boolean);

// fallback: если мало изображений — повторяем первый
if(ratImages.length === 0){
  rat.src = 'images/rat1.png';
} else {
  rat.src = ratImages[0];
}

// стартовые координаты — центр игрового блока
function placeRatRandom(){
  const w = canvasRect.width;
  const h = canvasRect.height;
  ratPos.x = canvasRect.left + 80 + Math.random()*(w-160);
  ratPos.y = canvasRect.top + 80 + Math.random()*(h-160);
  rat.style.left = ratPos.x + 'px';
  rat.style.top = ratPos.y + 'px';
}
placeRatRandom();

// input tracking
let pointer = {x: window.innerWidth/2, y: window.innerHeight/2};
let isPointerDown = false;
['mousemove','touchstart','touchmove'].forEach(ev=>{
  window.addEventListener(ev, e=>{
    if(e.type.startsWith('touch')){
      const t = e.touches[0] || e.changedTouches[0];
      pointer.x = t.clientX; pointer.y = t.clientY;
    } else {
      pointer.x = e.clientX; pointer.y = e.clientY;
    }
  }, {passive:true});
});
['mousedown','touchstart'].forEach(ev=>{
  window.addEventListener(ev, ()=> isPointerDown = true, {passive:true});
});
['mouseup','touchend','touchcancel'].forEach(ev=>{
  window.addEventListener(ev, ()=> isPointerDown = false, {passive:true});
});

// main animate: rat tries убежать от курсора
function gameLoop(){
  const dx = pointer.x - ratPos.x;
  const dy = pointer.y - ratPos.y;
  const dist = Math.hypot(dx,dy) || 1;

  // базовая скорость и поведение
  const fleeRadius = 160;      // когда ближе — убегает активнее
  const maxSpeed = 6;          // px per frame
  const accel = 0.45;

  if(dist < fleeRadius){
    // уходит от курсора
    const ux = -(dx/dist);
    const uy = -(dy/dist);
    ratVel.x += ux * accel;
    ratVel.y += uy * accel;
  } else {
    // небольшая шумовая дрейфовость
    ratVel.x += (Math.random()-0.5)*0.2;
    ratVel.y += (Math.random()-0.5)*0.2;
  }

  // ограничение скорости
  const sp = Math.hypot(ratVel.x, ratVel.y);
  if(sp > maxSpeed){
    ratVel.x = (ratVel.x/sp)*maxSpeed;
    ratVel.y = (ratVel.y/sp)*maxSpeed;
  }

  // обновляем позицию
  ratPos.x += ratVel.x;
  ratPos.y += ratVel.y;

  // удерживаем внутри игрового блока
  const pad = 40;
  const left = canvasRect.left + pad;
  const top = canvasRect.top + pad;
  const right = canvasRect.right - pad;
  const bottom = canvasRect.bottom - pad;

  if(ratPos.x < left){ ratPos.x = left; ratVel.x *= -0.6; }
  if(ratPos.x > right){ ratPos.x = right; ratVel.x *= -0.6; }
  if(ratPos.y < top){ ratPos.y = top; ratVel.y *= -0.6; }
  if(ratPos.y > bottom){ ratPos.y = bottom; ratVel.y *= -0.6; }

  // apply transform (centered)
  rat.style.left = ratPos.x + 'px';
  rat.style.top = ratPos.y + 'px';
  // subtle rotation based on velocity
  const rot = Math.max(Math.min(ratVel.x * 4, 18), -18);
  rat.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// ---------------- catching logic ----------------
function spawnGift(atX, atY){
  const g = document.createElement('div');
  g.className = 'gift';
  g.textContent = '🎁';
  document.body.appendChild(g);
  // position relative to viewport
  g.style.left = atX + 'px';
  g.style.top = atY + 'px';

  // remove after animation
  setTimeout(()=> g.remove(), 1200);
}

function showCaughtPopup(){
  const p = document.createElement('div');
  p.className = 'caught-pop';
  p.textContent = 'Поймала! +1';
  document.body.appendChild(p);
  setTimeout(()=> p.remove(), 900);
}

function onRatCaught(){
  // эффект: подарок + попап + смена картинки + респаун
  spawnGift(ratPos.x, ratPos.y);
  showCaughtPopup();
  score += 1;
  hudScore.textContent = score;

  // сменим изображение крыски на случайную (если есть)
  if(ratImages.length){
    const pick = ratImages[Math.floor(Math.random()*ratImages.length)];
    rat.src = pick;
  }

  // коротко "замороженный" эффект и затем телепорт в другое место
  rat.style.transition = 'transform 200ms ease';
  rat.style.transform = `translate(-50%,-50%) scale(.9) rotate(0deg)`;
  setTimeout(()=>{
    placeRatRandom();
    ratVel.x = 0; ratVel.y = 0;
    rat.style.transition = '';
  }, 450);
}

// click/tap handler: если клик близко к центру крыски — поймано
function pointerIsOnRat(clientX, clientY){
  const r = rat.getBoundingClientRect();
  return (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom);
}

window.addEventListener('click', (e)=>{
  if(pointerIsOnRat(e.clientX, e.clientY)){
    onRatCaught();
  }
});
window.addEventListener('touchend', (e)=>{
  const t = e.changedTouches[0];
  if(t && pointerIsOnRat(t.clientX, t.clientY)){
    onRatCaught();
  }
});

// also allow keyboard "space" to attempt catch (for accessibility)
window.addEventListener('keydown', (e)=>{
  if(e.code === 'Space'){
    // if pointer near rat (mouse), try to catch; else just random chance
    if(Math.hypot(pointer.x - ratPos.x, pointer.y - ratPos.y) < 80){
      onRatCaught();
    } else if (Math.random() < 0.08){
      // small chance to catch from distance
      onRatCaught();
    }
  }
});

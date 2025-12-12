window.onload = () => {
  setTimeout(() => {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("main").classList.remove("hidden");
    startPixelChaos();
  }, 3000);
};

function startPixelChaos() {
  const canvas = document.getElementById("pixel-bg");
  const ctx = canvas.getContext("2d");

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  resize();
  window.addEventListener("resize", resize);

  const sprites = [];

  const images = [
const images = [
  "images/cat1.png",
  "images/cat2.png",
  "images/cat3.png",
  "images/cat4.png",
  "images/cat5.png",
  "images/rat1.png",
  "images/rat2.png",
  "images/rat3.png",
  "images/glitch1.png",
  "images/glitch2.png",
  "images/glitch3.png"
];

  ];

  const loaded = [];
  let loadCount = 0;

  images.forEach((src, i) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      loaded[i] = img;
      loadCount++;
      if (loadCount === images.length) init();
    };
  });

  function init() {
    for (let i = 0; i < 20; i++) {
      const img = loaded[Math.floor(Math.random() * loaded.length)];
      sprites.push({
        img,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        s: 40 + Math.random() * 40
      });
    }

    animate();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sprites.forEach(s => {
      s.x += s.dx;
      s.y += s.dy;

      if (s.x < 0 || s.x > canvas.width - s.s) s.dx *= -1;
      if (s.y < 0 || s.y > canvas.height - s.s) s.dy *= -1;

      ctx.drawImage(s.img, s.x, s.y, s.s, s.s);
    });

    requestAnimationFrame(animate);
  }
}

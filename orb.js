const orbContainer = document.getElementById('orb-bg');

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

orbContainer.appendChild(canvas);

let w;
let h;
let mouseX = 0;
let mouseY = 0;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

class Orb {
  constructor() {
    this.x = w / 2;
    this.y = h / 2;
    this.radius = 180;
    this.angle = 0;
  }

  update() {
    this.angle += 0.003;
    this.x += (mouseX - this.x) * 0.015;
    this.y += (mouseY - this.y) * 0.015;
  }

  draw() {

    const pulse = Math.sin(Date.now() * 0.002) * 20;

    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      20,
      this.x,
      this.y,
      this.radius + pulse
    );

    gradient.addColorStop(0, 'rgb(246, 9, 195)');
    gradient.addColorStop(0.3, 'rgb(11, 118, 48)');
    gradient.addColorStop(0.6, 'rgba(131, 238, 64, 0.22)');
    gradient.addColorStop(1, 'rgb(236, 17, 17)');

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.radius + pulse, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 25; i++) {

      const orbitAngle = this.angle + i * 0.25;

      const orbitRadius = 120 + i * 3;

      const px = this.x + Math.cos(orbitAngle) * orbitRadius;
      const py = this.y + Math.sin(orbitAngle) * orbitRadius;

      ctx.beginPath();
      ctx.fillStyle = `rgba(196,168,255,${0.15 - i * 0.004})`;
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

const orb = new Orb();

function animate() {

  requestAnimationFrame(animate);

  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(10,10,15,0.08)';
  ctx.fillRect(0, 0, w, h);

  orb.update();
  orb.draw();
}

animate();

const orbContainer = document.getElementById('orb-bg');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
orbContainer.appendChild(canvas);

let w, h;
let isHovered = false;
let hoverProgression = 0;
let baseRadius;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  
  // RESPONSIVE RADIUS: Smaller on mobile, larger on desktop
  if (w < 768) {
    baseRadius = w * 0.35; // Roughly 35% of screen width on mobile
  } else {
    baseRadius = 320; // Default large size for desktop
  }
}

resize();
window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
  const dx = e.clientX - w / 2;
  const dy = e.clientY - h / 2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Detection range scales with baseRadius
  isHovered = distance < (baseRadius * 1.1); 
});

// For Mobile Touch: Trigger hover when touching near center
window.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const dx = touch.clientX - w / 2;
  const dy = touch.clientY - h / 2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  isHovered = distance < (baseRadius * 1.5);
});

window.addEventListener('touchend', () => {
  isHovered = false;
});

class Orb {
  constructor() {
    this.angle = 0;
  }

  update() {
    this.angle += 0.0005; 
    
    if (isHovered) {
      hoverProgression += (1 - hoverProgression) * 0.05;
    } else {
      hoverProgression += (0 - hoverProgression) * 0.03;
    }
  }

  draw() {
    const centerX = w / 2;
    const centerY = h / 2;
    const time = Date.now();
    
    const pulse = Math.sin(time * 0.0005) * 15;
    const radius = baseRadius + pulse;

    ctx.globalCompositeOperation = 'screen';

    const drawWave = (offset, color, width, blur) => {
      ctx.beginPath();
      
      const activeWidth = width * (0.4 + (hoverProgression * 1.2));
      const activeBlur = blur * (0.6 + (hoverProgression * 1.5));
      
      ctx.shadowBlur = activeBlur;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = activeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const segments = w < 768 ? 40 : 80; // Performance boost: fewer segments on mobile
      const points = [];

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        
        const wave1 = Math.sin(angle * 4 + time * 0.005) * (15 * hoverProgression);
        const wave2 = Math.cos(angle * 8 - time * 0.008) * (8 * hoverProgression);
        const gentleBreathe = Math.sin(angle * 2 + time * 0.002) * (w < 768 ? 4 : 8);

        const r = radius + wave1 + wave2 + gentleBreathe + offset;
        points.push({
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r
        });
      }

      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.closePath();
      ctx.stroke();
    };

    // LAYERS
    drawWave(0, 'rgba(0, 100, 255, 0.4)', 12, 50);
    drawWave(0, 'rgba(0, 200, 255, 0.7)', 4, 25);
    
    if (hoverProgression > 0.05) {
       drawWave(0, 'rgba(255, 255, 255, 0.95)', 1.5, 10);
    }

    // CENTER GLOW
    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.3);
    grad.addColorStop(0, `rgba(100, 200, 255, ${0.2 + (hoverProgression * 0.1)})`);
    grad.addColorStop(0.5, `rgba(0, 50, 200, ${0.1})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = grad;
    ctx.shadowBlur = 0; 
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

const orb = new Orb();

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, w, h);
  orb.update();
  orb.draw();
}

animate();
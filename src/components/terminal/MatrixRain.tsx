'use client';

import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  isDense?: boolean;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({ isDense = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const opacityRef = useRef(isDense ? 0.35 : 0.15);

  useEffect(() => {
    opacityRef.current = isDense ? 0.35 : 0.15;
  }, [isDense]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = Array(columns).fill(1).map(() => Math.floor(Math.random() * -50));

    // Characters string (katakana + numbers)
    const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1).map(() => Math.floor(Math.random() * -50));
    };

    window.addEventListener('resize', handleResize);

    let lastTime = 0;
    const fps = 24;
    const interval = 1000 / fps;

    const draw = (time: number) => {
      animId = requestAnimationFrame(draw);

      const delta = time - lastTime;
      if (delta < interval) return;
      lastTime = time - (delta % interval);

      ctx.fillStyle = 'rgba(12, 9, 7, 0.2)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ff9c';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Skip ~50% columns for sparse look unless dense
        if (!isDense && i % 2 === 0) continue;

        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.globalAlpha = opacityRef.current;
        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none w-full h-full"
    />
  );
};

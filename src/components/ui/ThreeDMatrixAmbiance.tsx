import React, { useEffect, useRef } from 'react';

export function ThreeDMatrixAmbiance() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes in 3D perspective
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      baseRadius: number;
      color: string;
      speedX: number;
      speedY: number;
      speedZ: number;
    }> = [];

    const numParticles = Math.min(width < 768 ? 40 : 85, 100);
    const colors = ['#D4AF37', '#00F0FF', '#B026FF', '#E6CA65'];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 100,
        baseRadius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        speedZ: (Math.random() - 0.5) * 0.6,
      });
    }

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.05;
      mouseY = (e.clientY - height / 2) * 0.05;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const focalLength = 400;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render perspective grid lines at bottom
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.03)';
      ctx.lineWidth = 1;
      const horizonY = height * 0.75;
      
      for (let i = -width; i <= width * 2; i += 80) {
        ctx.beginPath();
        ctx.moveTo(width / 2 + mouseX * 2, horizonY);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // Render 3D particles with depth perspective
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.z += p.speedZ;

        if (p.z <= 10) p.z = 900;
        if (p.z > 900) p.z = 10;

        const scale = focalLength / p.z;
        const screenX = width / 2 + (p.x - mouseX) * scale;
        const screenY = height / 2 + (p.y - mouseY) * scale;
        const radius = Math.max(0.5, p.baseRadius * scale);

        if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
          const alpha = Math.min(1, Math.max(0.1, (1 - p.z / 900) * 0.8));
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 12 * scale;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-50"
      style={{ filter: 'contrast(1.1) brightness(1.2)' }}
    />
  );
}

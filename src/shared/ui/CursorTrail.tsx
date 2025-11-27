'use client';

import { useEffect, useRef } from 'react';

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Array<{ x: number; y: number; size: number; alpha: number }>>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Animation loop with 60 FPS optimization
    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastTime.current;

      // Limit to ~60 FPS
      if (deltaTime >= 16) {
        lastTime.current = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Add new particle
        if (Math.random() > 0.7) {
          particles.current.push({
            x: mousePos.current.x,
            y: mousePos.current.y,
            size: Math.random() * 3 + 1,
            alpha: 1,
          });
        }

        // Update and draw particles
        particles.current = particles.current.filter((particle) => {
          particle.alpha -= 0.02;
          particle.size *= 0.98;

          if (particle.alpha <= 0) return false;

          ctx.fillStyle = `rgba(var(--primary-rgb), ${particle.alpha * 0.25})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();

          return true;
        });
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

/**
 * Particles Background Effect
 * Animated particles floating in the background
 * @author Dr. Ernesto Lee
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface Props {
  quantity?: number;
  staticity?: number;
  ease?: number;
  color?: string;
  className?: string;
}

export function Particles({
  quantity = 50,
  staticity = 50,
  ease = 50,
  color = 'rgb(147, 51, 234)', // Purple color
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext('2d');
    }
    initCanvas();
    animate();
    window.addEventListener('resize', initCanvas);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('resize', initCanvas);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    initCanvas();
  }, [quantity]);

  const initCanvas = () => {
    if (!canvasContainerRef.current || !canvasRef.current || !context.current) return;

    canvasSize.current.w = canvasContainerRef.current.offsetWidth;
    canvasSize.current.h = canvasContainerRef.current.offsetHeight;

    canvasRef.current.width = canvasSize.current.w * dpr;
    canvasRef.current.height = canvasSize.current.h * dpr;
    canvasRef.current.style.width = canvasSize.current.w + 'px';
    canvasRef.current.style.height = canvasSize.current.h + 'px';
    context.current.scale(dpr, dpr);

    particles.current = [];
    for (let i = 0; i < quantity; i++) {
      particles.current.push({
        x: Math.random() * canvasSize.current.w,
        y: Math.random() * canvasSize.current.h,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    }
  };

  const animate = () => {
    if (!context.current || !canvasRef.current) return;

    context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);

    particles.current.forEach((particle) => {
      // Mouse interaction
      const dx = mouse.current.x - particle.x;
      const dy = mouse.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 100;

      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        particle.x -= forceDirectionX * force * (staticity / 50);
        particle.y -= forceDirectionY * force * (staticity / 50);
      }

      // Move particle
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Boundary check
      if (particle.x < 0 || particle.x > canvasSize.current.w) {
        particle.speedX *= -1;
        particle.x = Math.max(0, Math.min(canvasSize.current.w, particle.x));
      }
      if (particle.y < 0 || particle.y > canvasSize.current.h) {
        particle.speedY *= -1;
        particle.y = Math.max(0, Math.min(canvasSize.current.h, particle.y));
      }

      // Apply ease
      particle.x += (Math.random() - 0.5) * (ease / 100);
      particle.y += (Math.random() - 0.5) * (ease / 100);

      // Draw particle
      if (context.current) {
        context.current.beginPath();
        context.current.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.current.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${particle.opacity})`);
        context.current.fill();
      }
    });

    requestAnimationFrame(animate);
  };

  return (
    <div
      ref={canvasContainerRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

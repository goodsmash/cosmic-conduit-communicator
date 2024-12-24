import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  life: number;
}

interface ParticleSystemProps {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  minVelocity?: number;
  maxVelocity?: number;
  interactive?: boolean;
  fadeOut?: boolean;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = 100,
  colors = ['#4A90E2', '#50E3C2', '#F8E71C'],
  minSize = 2,
  maxSize = 6,
  minVelocity = 0.1,
  maxVelocity = 0.5,
  interactive = true,
  fadeOut = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const controls = useAnimation();

  const createParticle = (x?: number, y?: number): Particle => {
    return {
      id: Math.random(),
      x: x ?? Math.random() * window.innerWidth,
      y: y ?? Math.random() * window.innerHeight,
      size: minSize + Math.random() * (maxSize - minSize),
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * (maxVelocity - minVelocity) + minVelocity,
        y: (Math.random() - 0.5) * (maxVelocity - minVelocity) + minVelocity,
      },
      life: 1,
    };
  };

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => createParticle());
  }, [count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 14, 23, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update particle position
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;

        // Interactive behavior
        if (interactive) {
          const dx = mouseX.get() - particle.x;
          const dy = mouseY.get() - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const angle = Math.atan2(dy, dx);
            particle.velocity.x -= Math.cos(angle) * 0.02;
            particle.velocity.y -= Math.sin(angle) * 0.02;
          }
        }

        // Boundary checks with wrapping
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = fadeOut 
          ? `${particle.color}${Math.floor(particle.life * 255).toString(16).padStart(2, '0')}`
          : particle.color;
        ctx.fill();

        // Update life
        if (fadeOut) {
          particle.life = Math.max(0, particle.life - 0.001);
          if (particle.life <= 0) {
            Object.assign(particle, createParticle());
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [particles, interactive, fadeOut, mouseX, mouseY]);

  return (
    <motion.canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      animate={controls}
    />
  );
};

export default ParticleSystem;

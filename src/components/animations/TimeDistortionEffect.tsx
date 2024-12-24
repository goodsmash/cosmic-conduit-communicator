import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface TimeDistortionEffectProps {
  intensity?: number;
  duration?: number;
  color?: string;
  trigger?: boolean;
  onComplete?: () => void;
}

const TimeDistortionEffect: React.FC<TimeDistortionEffectProps> = ({
  intensity = 1,
  duration = 2,
  color = '#4A90E2',
  trigger = false,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let ripples: Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
      velocity: number;
    }> = [];

    const createRipple = (x: number, y: number) => {
      ripples.push({
        x,
        y,
        radius: 0,
        alpha: 1,
        velocity: 2 + Math.random() * 2,
      });
    };

    let animationFrameId: number;
    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw ripples
      ripples = ripples.filter((ripple) => {
        ripple.radius += ripple.velocity * intensity * 60 * deltaTime;
        ripple.alpha = Math.max(0, 1 - ripple.radius / (canvas.width * 0.4));

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${color}${Math.floor(ripple.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;
        ctx.stroke();

        return ripple.alpha > 0;
      });

      if (trigger) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        if (Math.random() < 0.2) {
          createRipple(
            centerX + (Math.random() - 0.5) * 200,
            centerY + (Math.random() - 0.5) * 200
          );
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    if (trigger) {
      controls.start({
        filter: [
          'blur(0px) brightness(1)',
          'blur(4px) brightness(1.2)',
          'blur(0px) brightness(1)',
        ],
        transition: {
          duration: duration,
          times: [0, 0.5, 1],
          ease: 'easeInOut',
        },
      }).then(() => {
        onComplete?.();
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [trigger, intensity, duration, color, onComplete, controls]);

  return (
    <motion.canvas
      ref={canvasRef}
      animate={controls}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
};

export default TimeDistortionEffect;

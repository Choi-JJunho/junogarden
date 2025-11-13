"use client";

import { useEffect, useRef } from "react";

// Constants for better maintainability
const PARTICLE_COUNT = 50;
const CONNECTION_DISTANCE = 150;
const REPEL_DISTANCE = 100;
const PARTICLE_VELOCITY = 0.5;
const CONNECTION_ALPHA_MAX = 0.3;

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("Canvas 2D context not available");
      return;
    }

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const mouse = { x: 0, y: 0 };

    // Initialize particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * PARTICLE_VELOCITY,
        vy: (Math.random() - 0.5) * PARTICLE_VELOCITY,
        radius: Math.random() * 2 + 1,
      });
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Helper function to convert alpha to hex with proper bounds
    const alphaToHex = (alpha: number): string => {
      const clampedAlpha = Math.max(0, Math.min(255, Math.floor(alpha)));
      return clampedAlpha.toString(16).padStart(2, "0");
    };

    // Animation loop
    let animationId: number;
    const animate = () => {
      // Pause animation when tab is hidden (performance optimization)
      if (document.hidden) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get CSS variables
      const style = getComputedStyle(document.documentElement);
      const primaryColor = style.getPropertyValue("--primary").trim();

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Mouse interaction (repel from cursor)
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < REPEL_DISTANCE) {
          particle.x -= dx * 0.01;
          particle.y -= dy * 0.01;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor || "#4fc3f7";
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);

            // Calculate alpha value with proper clamping
            const alphaValue = (1 - distance / CONNECTION_DISTANCE) * CONNECTION_ALPHA_MAX * 255;
            const hexAlpha = alphaToHex(alphaValue);

            ctx.strokeStyle = `${primaryColor || "#4fc3f7"}${hexAlpha}`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
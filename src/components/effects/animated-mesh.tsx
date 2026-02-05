"use client";

import { useEffect, useRef } from "react";

export function AnimatedMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Gradient orbs configuration
    const orbs = [
      {
        x: 0.2,
        y: 0.3,
        radius: 400,
        color1: { r: 0, g: 212, b: 255 }, // cyan
        color2: { r: 139, g: 92, b: 246 }, // purple
        speed: 0.3,
      },
      {
        x: 0.7,
        y: 0.6,
        radius: 350,
        color1: { r: 255, g: 45, b: 146 }, // magenta
        color2: { r: 139, g: 92, b: 246 }, // purple
        speed: 0.25,
      },
      {
        x: 0.5,
        y: 0.5,
        radius: 300,
        color1: { r: 139, g: 92, b: 246 }, // purple
        color2: { r: 0, g: 212, b: 255 }, // cyan
        speed: 0.2,
      },
    ];

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      timeRef.current += 0.003;

      // Clear with dark background
      ctx.fillStyle = "#03030a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated orbs
      orbs.forEach((orb, index) => {
        const offsetX = Math.sin(timeRef.current * orb.speed + index) * 100;
        const offsetY = Math.cos(timeRef.current * orb.speed + index) * 100;

        const x = canvas.width * orb.x + offsetX;
        const y = canvas.height * orb.y + offsetY;

        // Create radial gradient for each orb
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.radius);

        // Animate opacity
        const opacity = 0.15 + Math.sin(timeRef.current * orb.speed) * 0.05;

        gradient.addColorStop(
          0,
          `rgba(${orb.color1.r}, ${orb.color1.g}, ${orb.color1.b}, ${opacity})`
        );
        gradient.addColorStop(
          0.5,
          `rgba(${orb.color2.r}, ${orb.color2.g}, ${orb.color2.b}, ${opacity * 0.6})`
        );
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Add noise/grain texture for depth
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillRect(x, y, 1, 1);
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ filter: "blur(80px)" }}
    />
  );
}

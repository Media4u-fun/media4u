"use client";

import { useEffect, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailPoints = useRef<TrailPoint[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();

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

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas with slight fade for trail effect
      ctx.fillStyle = "rgba(3, 3, 10, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add new point
      if (mousePosition.current.x > 0 && mousePosition.current.y > 0) {
        trailPoints.current.push({
          x: mousePosition.current.x,
          y: mousePosition.current.y,
          opacity: 1,
        });
      }

      // Update and draw trail points
      trailPoints.current = trailPoints.current.filter((point) => {
        point.opacity -= 0.05;

        if (point.opacity <= 0) return false;

        // Create gradient for each point
        const gradient = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          20
        );

        // Cyber colors - cyan to purple to magenta
        gradient.addColorStop(0, `rgba(0, 212, 255, ${point.opacity * 0.6})`);
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${point.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(255, 45, 146, ${point.opacity * 0.2})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 20, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

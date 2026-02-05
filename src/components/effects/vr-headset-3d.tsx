"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

export function VRHeadset3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovering) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate rotation based on mouse position
      const rotateY = ((e.clientX - centerX) / rect.width) * 30;
      const rotateX = -((e.clientY - centerY) / rect.height) * 30;

      setRotation({ x: rotateX, y: rotateY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHovering]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center perspective-1000"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setRotation({ x: 0, y: 0 });
      }}
    >
      <motion.div
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{
          transformStyle: "preserve-3d",
        }}
        className="relative w-64 h-64 md:w-80 md:h-80"
      >
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)",
            transform: "translateZ(-100px)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
            transform: "translateZ(-120px)",
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* VR Headset */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Main body */}
          <div
            className="relative"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Front face */}
            <svg
              viewBox="0 0 200 120"
              className="w-48 h-28 md:w-64 md:h-36"
              style={{
                filter: "drop-shadow(0 10px 40px rgba(0,212,255,0.4))",
                transform: "translateZ(30px)",
              }}
            >
              <defs>
                <linearGradient id="headset-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ff2d92" />
                </linearGradient>
                <linearGradient id="lens-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Main headset body */}
              <rect
                x="20"
                y="20"
                width="160"
                height="80"
                rx="20"
                fill="url(#headset-grad)"
                opacity="0.9"
              />

              {/* Left lens */}
              <circle cx="70" cy="60" r="25" fill="url(#lens-grad)" opacity="0.6" />
              <circle cx="70" cy="60" r="20" fill="#1a1a2e" opacity="0.8" />
              <circle cx="70" cy="60" r="15" fill="url(#lens-grad)" opacity="0.3" />

              {/* Right lens */}
              <circle cx="130" cy="60" r="25" fill="url(#lens-grad)" opacity="0.6" />
              <circle cx="130" cy="60" r="20" fill="#1a1a2e" opacity="0.8" />
              <circle cx="130" cy="60" r="15" fill="url(#lens-grad)" opacity="0.3" />

              {/* Bridge */}
              <rect x="95" y="55" width="10" height="10" rx="2" fill="#8b5cf6" opacity="0.7" />

              {/* Strap attachment left */}
              <rect x="5" y="50" width="15" height="20" rx="3" fill="#8b5cf6" opacity="0.6" />

              {/* Strap attachment right */}
              <rect x="180" y="50" width="15" height="20" rx="3" fill="#8b5cf6" opacity="0.6" />

              {/* Detail lines */}
              <line x1="40" y1="35" x2="160" y2="35" stroke="#00d4ff" strokeWidth="1" opacity="0.4" />
              <line x1="40" y1="85" x2="160" y2="85" stroke="#ff2d92" strokeWidth="1" opacity="0.4" />
            </svg>

            {/* Side depth panels */}
            <div
              className="absolute top-1/2 left-0 w-6 h-20 md:w-8 md:h-24 bg-gradient-to-r from-purple-600/60 to-transparent rounded-l-lg"
              style={{
                transform: "translateZ(20px) translateY(-50%) rotateY(90deg) translateX(-30px)",
              }}
            />
            <div
              className="absolute top-1/2 right-0 w-6 h-20 md:w-8 md:h-24 bg-gradient-to-l from-cyan-600/60 to-transparent rounded-r-lg"
              style={{
                transform: "translateZ(20px) translateY(-50%) rotateY(-90deg) translateX(30px)",
              }}
            />
          </div>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                transform: `translateZ(${50 + Math.random() * 100}px)`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Rotating ring */}
        <motion.div
          className="absolute inset-0 border-2 border-cyan-500/30 rounded-full"
          style={{
            transform: "translateZ(0)",
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Interactive hint */}
        {!isHovering && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm text-gray-400 whitespace-nowrap"
          >
            Move your mouse to rotate
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

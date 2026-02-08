"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Eye, MousePointer2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Generate data point positions (called once on client)
function generateDataPoints() {
  return [...Array(20)].map((_, i) => {
    const angle = (i * 360) / 20;
    const radius = 30 + Math.random() * 30;
    const depth = Math.random() * 60 - 30;
    const duration = 2 + Math.random() * 2;
    return {
      angle,
      radius,
      depth,
      duration,
      left: 50 + Math.cos((angle * Math.PI) / 180) * radius,
      top: 50 + Math.sin((angle * Math.PI) / 180) * radius,
      color: i % 3 === 0 ? "#00d4ff" : i % 3 === 1 ? "#8b5cf6" : "#ff2d92",
    };
  });
}

export function VRSphere360() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [dataPoints, setDataPoints] = useState<ReturnType<typeof generateDataPoints> | null>(null);
  const autoRotateRef = useRef<number>(0);

  // Generate data points only on client to avoid hydration mismatch
  useEffect(() => {
    setDataPoints(generateDataPoints());
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100 };
  const rotateX = useSpring(y, springConfig);
  const rotateY = useSpring(x, springConfig);

  // Auto-spin effect when not dragging
  useEffect(() => {
    if (isDragging) return;

    const interval = setInterval(() => {
      autoRotateRef.current += 0.3;
      x.set(autoRotateRef.current);
      setRotation((prev) => ({ ...prev, y: autoRotateRef.current }));
    }, 50);

    return () => clearInterval(interval);
  }, [isDragging, x]);

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    const newRotationY = info.offset.x * 0.5 + autoRotateRef.current;
    const newRotationX = -info.offset.y * 0.3;

    x.set(newRotationY);
    y.set(newRotationX);
    setRotation({ x: newRotationX, y: newRotationY });
    autoRotateRef.current = newRotationY;
  };

  const handleEnterVR = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/vr");
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      <motion.div
        drag
        dragElastic={0.05}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDrag={handleDrag}
        onDragEnd={() => setIsDragging(false)}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        className="relative w-80 h-80 md:w-96 md:h-96"
      >
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)",
            transform: "translateZ(-100px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main sphere container */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            boxShadow: "inset 0 0 100px rgba(0,212,255,0.3), 0 0 100px rgba(139,92,246,0.2)",
          }}
        >
          {/* Sphere gradient background */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(0,212,255,0.4) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, rgba(139,92,246,0.4) 0%, transparent 50%),
                radial-gradient(circle at 50% 80%, rgba(255,45,146,0.3) 0%, transparent 50%),
                linear-gradient(135deg, #0a0a1e 0%, #1a1a2e 100%)
              `,
            }}
          />

          {/* Grid lines for 360° effect */}
          <svg className="absolute inset-0 w-full h-full" style={{ transform: "translateZ(1px)" }}>
            <defs>
              <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[...Array(8)].map((_, i) => (
              <motion.ellipse
                key={`h-${i}`}
                cx="50%"
                cy="50%"
                rx={`${20 + i * 8}%`}
                ry={`${10 + i * 4}%`}
                fill="none"
                stroke="url(#grid-grad)"
                strokeWidth="1"
                opacity="0.4"
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}

            {/* Vertical grid lines */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 360) / 12;
              return (
                <motion.line
                  key={`v-${i}`}
                  x1="50%"
                  y1="10%"
                  x2="50%"
                  y2="90%"
                  stroke="url(#grid-grad)"
                  strokeWidth="1"
                  opacity="0.3"
                  style={{
                    transformOrigin: "center",
                    transform: `rotate(${angle}deg)`,
                  }}
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              );
            })}
          </svg>

          {/* Floating data points - representing VR space elements */}
          {dataPoints && dataPoints.map((point, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${point.left}%`,
                top: `${point.top}%`,
                background: point.color,
                transform: `translateZ(${point.depth}px)`,
                boxShadow: `0 0 10px ${point.color}`,
              }}
              animate={{
                scale: [0.8, 1.5, 0.8],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: point.duration,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}

          {/* Scanning beam effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.3) 50%, transparent 100%)",
              transform: "translateZ(2px)",
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Inner sphere rim glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid rgba(0,212,255,0.4)",
              boxShadow: "inset 0 0 50px rgba(0,212,255,0.2)",
            }}
          />
        </div>

        {/* Center CTA area */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(50px)",
          }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative">
            {/* Center button */}
            <motion.button
              onClick={handleEnterVR}
              className="relative z-30 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-magenta-500 text-white font-semibold text-lg shadow-2xl cursor-pointer flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(0,212,255,0.5)",
                  "0 0 40px rgba(139,92,246,0.7)",
                  "0 0 20px rgba(255,45,146,0.5)",
                  "0 0 20px rgba(0,212,255,0.5)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              <Eye className="w-5 h-5 inline-block mr-2" />
              Enter VR
            </motion.button>

            {/* Orbital rings around button */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border-2 rounded-full pointer-events-none"
                style={{
                  borderColor: i % 3 === 0 ? "rgba(0,212,255,0.3)" : i % 3 === 1 ? "rgba(139,92,246,0.3)" : "rgba(255,45,146,0.3)",
                  transform: `scale(${1.5 + i * 0.5})`,
                }}
                animate={{
                  rotate: 360,
                  scale: [1.5 + i * 0.5, 1.8 + i * 0.5, 1.5 + i * 0.5],
                }}
                transition={{
                  rotate: {
                    duration: 10 + i * 3,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  },
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Environment labels floating around sphere */}
        <motion.div
          className="absolute top-[10%] left-[15%] px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-semibold backdrop-blur-sm"
          style={{ transform: "translateZ(60px)" }}
          animate={{
            y: [-5, 5, -5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          Virtual Showroom
        </motion.div>

        <motion.div
          className="absolute top-[20%] right-[10%] px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 text-xs font-semibold backdrop-blur-sm"
          style={{ transform: "translateZ(70px)" }}
          animate={{
            y: [5, -5, 5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 0.5,
          }}
        >
          3D Gallery
        </motion.div>

        <motion.div
          className="absolute bottom-[15%] left-[20%] px-3 py-1 rounded-full bg-magenta-500/20 border border-magenta-500/40 text-magenta-400 text-xs font-semibold backdrop-blur-sm"
          style={{ transform: "translateZ(65px)" }}
          animate={{
            y: [-3, 3, -3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 1,
          }}
        >
          Event Space
        </motion.div>
      </motion.div>

      {/* Interaction hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isDragging ? 0 : 1, y: 0 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
      >
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <MousePointer2 className="w-4 h-4" />
          <span>Drag to explore the environment</span>
        </div>
        <p className="text-xs text-gray-500">
          Rotation: X: {Math.round(rotation.x)}° Y: {Math.round(rotation.y)}°
        </p>
      </motion.div>
    </div>
  );
}

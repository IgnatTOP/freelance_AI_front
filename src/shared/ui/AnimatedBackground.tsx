"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Predetermined positions for consistent SSR rendering
const particles = [
  { left: 10, top: 15, size: 2, duration: 8, delay: 0 },
  { left: 25, top: 45, size: 1, duration: 10, delay: 1 },
  { left: 40, top: 25, size: 3, duration: 12, delay: 2 },
  { left: 60, top: 70, size: 2, duration: 9, delay: 0.5 },
  { left: 75, top: 35, size: 1, duration: 11, delay: 1.5 },
  { left: 85, top: 60, size: 2, duration: 10, delay: 2.5 },
  { left: 15, top: 80, size: 1, duration: 13, delay: 3 },
  { left: 50, top: 90, size: 2, duration: 8, delay: 0.8 },
  { left: 90, top: 20, size: 3, duration: 14, delay: 1.2 },
  { left: 5, top: 50, size: 1, duration: 9, delay: 2.2 },
  { left: 35, top: 65, size: 2, duration: 11, delay: 3.5 },
  { left: 70, top: 85, size: 1, duration: 10, delay: 0.3 },
  { left: 95, top: 40, size: 2, duration: 12, delay: 1.8 },
  { left: 20, top: 30, size: 3, duration: 9, delay: 2.8 },
  { left: 45, top: 10, size: 1, duration: 13, delay: 0.6 },
  { left: 65, top: 55, size: 2, duration: 8, delay: 3.2 },
  { left: 80, top: 75, size: 1, duration: 11, delay: 1.4 },
  { left: 30, top: 95, size: 2, duration: 10, delay: 2.6 },
  { left: 55, top: 20, size: 3, duration: 14, delay: 0.9 },
  { left: 12, top: 60, size: 1, duration: 9, delay: 3.8 },
  { left: 88, top: 12, size: 2, duration: 12, delay: 1.1 },
  { left: 42, top: 78, size: 1, duration: 10, delay: 2.4 },
  { left: 68, top: 42, size: 2, duration: 11, delay: 0.7 },
  { left: 22, top: 88, size: 3, duration: 13, delay: 3.3 },
  { left: 78, top: 8, size: 1, duration: 9, delay: 1.6 },
];

const geometricShapes = [
  { type: "square", left: 15, top: 20, size: 40, rotation: 45, duration: 20 },
  { type: "circle", left: 75, top: 65, size: 60, rotation: 0, duration: 25 },
  { type: "triangle", left: 40, top: 80, size: 50, rotation: 30, duration: 22 },
  { type: "square", left: 85, top: 30, size: 35, rotation: 60, duration: 18 },
  { type: "circle", left: 25, top: 55, size: 45, rotation: 0, duration: 24 },
];

export function AnimatedBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check if device is mobile or has reduced motion preference
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 ||
                     window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsMobile(mobile);
    };

    // Check theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkMobile();
    checkTheme();

    window.addEventListener('resize', checkMobile);

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      observer.disconnect();
    };
  }, []);

  // Simplified static background for mobile devices
  if (isMobile) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Base Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background" />

        {/* Static subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(var(--primary-06) 1px, transparent 1px),
              linear-gradient(90deg, var(--primary-06) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Simple static gradient orbs */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
          style={{
            background: "var(--gradient-orb-1)",
            top: "10%",
            left: "10%",
          }}
        />

        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
          style={{
            background: "var(--gradient-orb-2)",
            bottom: "10%",
            right: "10%",
          }}
        />

        {/* Radial Vignette Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(circle at 50% 50%, transparent 0%, rgba(10, 15, 13, 0.6) 100%)"
              : "radial-gradient(circle at 50% 50%, transparent 0%, rgba(248, 250, 252, 0.4) 100%)",
          }}
        />
      </div>
    );
  }

  // Full animated background for desktop
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background" />

      {/* Animated Grid Pattern */}
      <motion.div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(var(--primary-06) 1px, transparent 1px),
            linear-gradient(90deg, var(--primary-06) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "60px 60px"],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Large Animated Gradient Orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
        style={{
          background:
            "var(--gradient-orb-1)",
          top: "10%",
          left: "10%",
        }}
        animate={{
          x: [0, 80, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full blur-3xl"
        style={{
          background:
            "var(--gradient-orb-2)",
          bottom: "10%",
          right: "10%",
        }}
        animate={{
          x: [0, -60, 0],
          y: [0, -70, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
        style={{
          background:
            "var(--gradient-orb-3)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -40, 40, 0],
          scale: [1, 1.25, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      {/* Dot Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary-12) 1px, transparent 0)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Animated Particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute bg-primary rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -40, -80, -40, 0],
            opacity: [0.2, 0.5, 0.7, 0.5, 0.2],
            scale: [1, 1.2, 1, 0.8, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}

      {/* Geometric Shapes */}
      {geometricShapes.map((shape, i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute border-2"
          style={{
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            borderColor: isDark ? 'rgba(20, 184, 166, 0.25)' : 'rgba(20, 184, 166, 0.35)',
            borderRadius:
              shape.type === "circle"
                ? "50%"
                : shape.type === "triangle"
                  ? "0"
                  : "8px",
            clipPath:
              shape.type === "triangle"
                ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                : undefined,
          }}
          animate={{
            rotate: [shape.rotation, shape.rotation + 360],
            scale: [1, 1.1, 1],
            opacity: isDark ? [0.5, 0.25, 0.5] : [0.6, 0.35, 0.6],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Floating Lines */}
      <motion.div
        className="absolute top-1/4 left-0 w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--primary-18), transparent)",
        }}
        animate={{
          x: ["-100%", "100%"],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-2/3 left-0 w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--primary-15), transparent)",
        }}
        animate={{
          x: ["100%", "-100%"],
          opacity: [0, 0.4, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Rotating Gradient Ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] opacity-10"
        style={{
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary" />
        <div className="absolute inset-8 rounded-full border border-primary" />
      </motion.div>

      {/* Glowing Corner Accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-dark/5 blur-3xl rounded-full" />

      {/* Radial Vignette Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(circle at 50% 50%, transparent 0%, rgba(10, 15, 13, 0.6) 100%)"
            : "radial-gradient(circle at 50% 50%, transparent 0%, rgba(248, 250, 252, 0.4) 100%)",
        }}
      />

      {/* Subtle Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

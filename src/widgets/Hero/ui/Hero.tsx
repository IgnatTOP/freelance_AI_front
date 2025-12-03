"use client";

import { Container } from "@/src/shared/ui/Container";
import { Button } from "@/src/shared/ui/Button";
import { motion } from "framer-motion";
import { Sparkles, Zap, Target, Users, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/shared/lib/hooks";

// Predetermined particle positions for consistent SSR/client rendering
const particles = [
  { left: 15.3, top: 25.7, duration: 3.2, delay: 0.5 },
  { left: 78.4, top: 42.1, duration: 4.5, delay: 1.2 },
  { left: 32.9, top: 68.3, duration: 3.8, delay: 2.1 },
  { left: 91.2, top: 15.6, duration: 4.2, delay: 3.5 },
  { left: 8.7, top: 89.4, duration: 3.5, delay: 0.8 },
  { left: 45.6, top: 33.8, duration: 4.8, delay: 1.9 },
  { left: 67.3, top: 71.2, duration: 3.3, delay: 4.2 },
  { left: 23.8, top: 56.9, duration: 4.1, delay: 2.7 },
  { left: 88.9, top: 8.4, duration: 3.9, delay: 0.3 },
  { left: 12.4, top: 44.7, duration: 4.6, delay: 3.8 },
  { left: 54.2, top: 92.3, duration: 3.7, delay: 1.5 },
  { left: 39.7, top: 18.9, duration: 4.3, delay: 4.5 },
  { left: 72.1, top: 63.5, duration: 3.4, delay: 2.3 },
  { left: 5.8, top: 37.2, duration: 4.7, delay: 1.1 },
  { left: 96.3, top: 81.6, duration: 3.6, delay: 3.2 },
  { left: 28.5, top: 11.8, duration: 4.4, delay: 0.9 },
  { left: 61.9, top: 49.3, duration: 3.1, delay: 4.8 },
  { left: 83.4, top: 74.7, duration: 4.9, delay: 2.5 },
  { left: 18.2, top: 28.4, duration: 3.3, delay: 1.7 },
  { left: 50.1, top: 95.1, duration: 4.0, delay: 3.9 },
];

export function Hero() {
  const router = useRouter();
  const { isAuthenticated } = useAuth({ requireAuth: false });

  const handleFindFreelancer = () => {
    if (isAuthenticated) {
      router.push("/orders/create");
    } else {
      router.push("/auth/register?role=client");
    }
  };

  const handleBecomeFreelancer = () => {
    router.push("/auth/register?role=freelancer");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary-dark/10" />

      {/* Animated Grid Pattern - hidden on mobile */}
      <div
        className="absolute inset-0 opacity-20 hidden md:block"
        style={{
          backgroundImage: `
            linear-gradient(var(--primary-06) 1px, transparent 1px),
            linear-gradient(90deg, var(--primary-06) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          animation: "gridMove 20s linear infinite",
        }}
      />

      {/* Floating gradient orbs - hidden on mobile */}
      <motion.div
        className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full blur-3xl hidden md:block"
        style={{
          background:
            "radial-gradient(circle, var(--primary-18) 0%, rgba(var(--primary-dark-rgb), 0.06) 50%, transparent 100%)",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-[15%] right-[15%] w-[600px] h-[600px] rounded-full blur-3xl hidden md:block"
        style={{
          background:
            "radial-gradient(circle, rgba(var(--primary-dark-rgb), 0.18) 0%, var(--primary-06) 50%, transparent 100%)",
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute top-[50%] left-[50%] w-[400px] h-[400px] rounded-full blur-3xl hidden md:block"
        style={{
          background:
            "radial-gradient(circle, rgba(var(--primary-light-rgb), 0.12) 0%, var(--primary-05) 50%, transparent 100%)",
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Animated Particles - hidden on mobile */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary rounded-full hidden md:block"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}

      {/* Floating geometric shapes - hidden on mobile */}
      <motion.div
        className="absolute top-[20%] right-[10%] w-20 h-20 border-2 border-primary/20 rounded-lg hidden md:block"
        animate={{
          rotate: [0, 180, 360],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute bottom-[25%] left-[8%] w-16 h-16 border-2 border-primary-light/20 hidden md:block"
        style={{ borderRadius: "30%" }}
        animate={{
          rotate: [0, -180, -360],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 0%, var(--background) 100%)",
        }}
      />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="glass px-6 py-2 rounded-full text-sm text-foreground-tertiary font-medium w-fit"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary animate-pulse" />
                Фриланс с искусственным интеллектом
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="gradient-text">Умная биржа фриланса</span>
              <br />
              <span className="text-foreground">с ИИ-ассистентом</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg sm:text-xl text-foreground-secondary max-w-2xl leading-relaxed"
            >
              ИИ помогает клиентам составить идеальное ТЗ и контролировать
              проект, а фрилансерам — найти заказы и создать выигрышные отклики
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button 
                size="lg" 
                variant="primary" 
                className="group flex items-center"
                onClick={handleFindFreelancer}
              >
                Найти фрилансера
                <ArrowRight
                  size={20}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
              <Button 
                size="lg" 
                variant="glass"
                onClick={handleBecomeFreelancer}
              >
                Стать исполнителем
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-3 gap-4 pt-8"
            >
              {[
                { value: "10K+", label: "Активных заказов" },
                { value: "5K+", label: "Фрилансеров" },
                { value: "98%", label: "Успешных сделок" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="glass rounded-2xl p-4 hover:glass-strong transition-all duration-300 cursor-pointer"
                >
                  <div className="text-2xl font-bold gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-xs text-foreground-tertiary mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Dashboard Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              <motion.div
                className="relative rounded-3xl glass overflow-hidden border-2 border-border/50 shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src="/dashboard.png"
                  alt="Dashboard"
                  width={1209}
                  height={877}
                  className="w-full h-auto object-contain"
                  priority
                />
              </motion.div>

              {/* Floating feature cards with enhanced animations */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 glass rounded-2xl p-4 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <Zap size={24} className="text-primary" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <Target size={24} className="text-primary" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -20, 0],
                  x: [0, 10, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute top-1/2 -right-8 glass rounded-2xl p-4 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <Users size={24} className="text-primary" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>

      {/* Scroll indicator with enhanced animation */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
          <motion.div
            className="w-1 h-3 bg-primary rounded-full"
            animate={{
              y: [0, 12, 0],
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </section>
  );
}

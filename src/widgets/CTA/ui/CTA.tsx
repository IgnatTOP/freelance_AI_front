"use client";

import { Container } from "@/src/shared/ui/Container";
import { Button } from "@/src/shared/ui/Button";
import { ScrollReveal } from "@/src/shared/ui/ScrollReveal";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function CTA() {
  const router = useRouter();

  return (
    <section style={{ position: "relative", padding: "96px 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--primary-gradient)" }} />
      
      {/* Decorative circles */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ position: "absolute", top: "10%", left: "5%", width: 300, height: 300, borderRadius: "50%", background: "white" }}
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "white" }}
      />

      <Container className="relative z-10">
        <ScrollReveal direction="up" delay={0}>
          <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,0.2)", marginBottom: 24 }}
            >
              <Sparkles size={20} style={{ color: "white" }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: "white" }}>Начните прямо сейчас</span>
            </motion.div>

            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, color: "white", marginBottom: 24, fontFamily: "var(--font-display)" }}>
              Готовы начать работу с ИИ-ассистентом?
            </h2>

            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", marginBottom: 40, lineHeight: 1.7 }}>
              Присоединяйтесь к тысячам заказчиков и фрилансеров, которые уже используют возможности искусственного интеллекта для эффективной работы.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }} className="sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/auth/register?role=client")}
                style={{ background: "white", color: "var(--primary)" }}
                className="group"
              >
                Найти исполнителя
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="glass"
                onClick={() => router.push("/auth/register?role=freelancer")}
                style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                Стать фрилансером
              </Button>
            </div>

            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 24 }}>
              Бесплатная регистрация • Без скрытых платежей
            </p>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}

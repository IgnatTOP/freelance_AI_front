"use client";

import { Container } from "@/src/shared/ui/Container";
import { ScrollReveal } from "@/src/shared/ui/ScrollReveal";
import { motion } from "framer-motion";

const stats = [
  { value: "10,000+", label: "Активных заказов" },
  { value: "5,000+", label: "Фрилансеров" },
  { value: "₽50M+", label: "Выплачено исполнителям" },
  { value: "98%", label: "Успешных сделок" },
];

export function Stats() {
  return (
    <section style={{ position: "relative", padding: "64px 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--primary-gradient)", opacity: 0.9 }} />

      <Container className="relative z-10">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
          {stats.map((stat, idx) => (
            <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{ textAlign: "center" }}
              >
                <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, color: "white" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 8 }}>
                  {stat.label}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

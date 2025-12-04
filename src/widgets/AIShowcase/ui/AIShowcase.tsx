"use client";

import { Container } from "@/src/shared/ui/Container";
import { ScrollReveal } from "@/src/shared/ui/ScrollReveal";
import { motion } from "framer-motion";
import { Bot, FileText, Users, Bell, Shield, Sparkles } from "lucide-react";

const aiFeatures = [
  {
    icon: FileText,
    title: "Генерация ТЗ",
    description: "ИИ задаёт уточняющие вопросы и формирует детальное техническое задание",
  },
  {
    icon: Users,
    title: "Подбор исполнителей",
    description: "Алгоритм анализирует навыки, рейтинг и опыт для рекомендации лучших кандидатов",
  },
  {
    icon: Sparkles,
    title: "Создание откликов",
    description: "Помощь фрилансерам в составлении убедительных предложений",
  },
  {
    icon: Bell,
    title: "Контроль сроков",
    description: "Автоматические напоминания и уведомления о важных этапах проекта",
  },
  {
    icon: Shield,
    title: "Анализ рисков",
    description: "Выявление потенциальных проблем и рекомендации по их предотвращению",
  },
];

export function AIShowcase() {
  return (
    <section style={{ position: "relative", padding: "96px 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--primary-05), transparent)" }} />

      <Container className="relative z-10">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 64, alignItems: "center" }} className="lg:grid-cols-2">
          <ScrollReveal direction="left" delay={0}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "var(--primary-10)", marginBottom: 24 }}>
                <Bot size={20} style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--primary)" }}>ИИ-ассистент</span>
              </div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", fontWeight: 700, marginBottom: 24, fontFamily: "var(--font-display)" }}>
                <span style={{ background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Искусственный интеллект</span>
                <br />
                <span style={{ color: "var(--foreground)" }}>на каждом этапе</span>
              </h2>
              <p style={{ fontSize: 18, color: "var(--foreground-secondary)", lineHeight: 1.7, marginBottom: 32 }}>
                Наш ИИ-ассистент помогает заказчикам и фрилансерам на всех этапах работы — от создания заказа до успешного завершения проекта.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {aiFeatures.slice(0, 3).map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 8 }}
                      style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary-10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={20} style={{ color: "var(--primary)" }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>{feature.title}</div>
                        <div style={{ fontSize: 14, color: "var(--foreground-secondary)" }}>{feature.description}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2}>
            <div style={{ position: "relative" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                style={{
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 24,
                  padding: 32,
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Bot size={24} style={{ color: "white" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--foreground)" }}>ИИ-Ассистент</div>
                    <div style={{ fontSize: 13, color: "var(--foreground-tertiary)" }}>Онлайн 24/7</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ background: "var(--primary-10)", padding: 16, borderRadius: 16, borderTopLeftRadius: 4 }}
                  >
                    <p style={{ fontSize: 14, color: "var(--foreground)" }}>
                      Расскажите подробнее о вашем проекте. Какой функционал нужен в первую очередь?
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ background: "var(--glass-bg)", padding: 16, borderRadius: 16, borderTopRightRadius: 4, marginLeft: "auto", maxWidth: "80%" }}
                  >
                    <p style={{ fontSize: 14, color: "var(--foreground-secondary)" }}>
                      Нужен интернет-магазин с каталогом и корзиной
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    style={{ background: "var(--primary-10)", padding: 16, borderRadius: 16, borderTopLeftRadius: 4 }}
                  >
                    <p style={{ fontSize: 14, color: "var(--foreground)" }}>
                      Отлично! Я сформировал ТЗ с 12 пунктами. Рекомендую бюджет 80-120 тыс. ₽ и срок 4-6 недель.
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ position: "absolute", top: -20, right: -20, width: 60, height: 60, borderRadius: 16, background: "var(--primary-gradient)", opacity: 0.2 }}
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ position: "absolute", bottom: -15, left: -15, width: 40, height: 40, borderRadius: 12, background: "var(--primary-gradient)", opacity: 0.15 }}
              />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}

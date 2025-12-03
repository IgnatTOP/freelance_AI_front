"use client";

import { Container } from "@/src/shared/ui/Container";
import { Card } from "@/src/shared/ui/Card";
import { Button } from "@/src/shared/ui/Button";
import { ScrollReveal } from "@/src/shared/ui/ScrollReveal";
import { Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Старт",
    price: "0",
    period: "навсегда",
    description: "Для начала работы на платформе",
    features: [
      "Доступ ко всем заказам",
      "Базовый ИИ-ассистент",
      "Комиссия 15% с заказа",
      "5 откликов в день",
      "Чат с заказчиками",
      "Эскроу-защита сделок",
    ],
    popular: false,
    cta: "Начать бесплатно",
  },
  {
    name: "Профессионал",
    price: "1,990",
    period: "месяц",
    description: "Для активных фрилансеров",
    features: [
      "Всё из тарифа Старт",
      "Неограниченные отклики",
      "Расширенный ИИ-ассистент",
      "Комиссия 10% с заказа",
      "Приоритет в поиске",
      "Расширенная аналитика",
      "Шаблоны откликов",
    ],
    popular: true,
    cta: "Выбрать план",
  },
  {
    name: "Бизнес",
    price: "4,990",
    period: "месяц",
    description: "Для агентств и команд",
    features: [
      "Всё из тарифа Профессионал",
      "Комиссия 5% с заказа",
      "До 5 аккаунтов в команде",
      "API для интеграций",
      "Персональный менеджер",
      "Приоритетная поддержка 24/7",
      "Верификация компании",
    ],
    popular: false,
    cta: "Связаться с нами",
  },
];

export function Pricing() {
  const router = useRouter();

  return (
    <section id="pricing" style={{ position: "relative", padding: "96px 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, transparent, var(--primary-05), transparent)" }} />

      <Container className="relative z-10">
        <ScrollReveal direction="up" delay={0}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "var(--primary-10)", marginBottom: 24 }}>
              <Sparkles size={20} style={{ color: "var(--primary)" }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--primary)" }}>Тарифы</span>
            </div>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700 }}>
              <span style={{ color: "var(--foreground)" }}>Выберите </span>
              <span style={{ background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>свой план</span>
            </h2>
            <p style={{ fontSize: 18, color: "var(--foreground-secondary)", maxWidth: 600, margin: "16px auto 0" }}>
              Прозрачные цены без скрытых платежей. Начните бесплатно и масштабируйтесь по мере роста.
            </p>
          </div>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 1100, margin: "0 auto" }} className="max-lg:grid-cols-1">
          {plans.map((plan, idx) => (
            <ScrollReveal key={idx} direction="up" delay={idx * 0.15}>
              <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }} className="h-full">
                <Card 
                  padding="lg" 
                  className={`h-full ${plan.popular ? "ring-2 ring-primary shadow-glow" : ""}`}
                >
                  {plan.popular && (
                    <div style={{ background: "var(--primary-gradient)", color: "white", padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, width: "fit-content", marginBottom: 20 }}>
                      Популярный выбор
                    </div>
                  )}

                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 700, color: "var(--foreground)" }}>{plan.name}</h3>
                    <p style={{ color: "var(--foreground-tertiary)", fontSize: 14, marginTop: 4 }}>{plan.description}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 20 }}>
                      <span style={{ fontSize: 42, fontWeight: 700, color: "var(--foreground)" }}>₽{plan.price}</span>
                      <span style={{ color: "var(--foreground-tertiary)", fontSize: 16 }}>/ {plan.period}</span>
                    </div>
                  </div>

                  <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
                    {plan.features.map((feature, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: "var(--primary-10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          <Check size={14} style={{ color: "var(--primary)" }} />
                        </div>
                        <span style={{ color: "var(--foreground-secondary)", fontSize: 15 }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={plan.popular ? "primary" : "glass"} 
                    className="w-full mt-6" 
                    onClick={() => router.push("/auth/register")}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="up" delay={0.5}>
          <p style={{ textAlign: "center", color: "var(--foreground-tertiary)", fontSize: 14, marginTop: 48 }}>
            Все тарифы включают эскроу-защиту сделок и доступ к системе споров. Отмена подписки в любой момент.
          </p>
        </ScrollReveal>
      </Container>
    </section>
  );
}

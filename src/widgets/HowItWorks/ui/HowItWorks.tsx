"use client";

import { Container } from "@/src/shared/ui/Container";
import { Card } from "@/src/shared/ui/Card";
import { ScrollReveal } from "@/src/shared/ui/ScrollReveal";
import { motion } from "framer-motion";
import { User, Briefcase } from "lucide-react";

const clientSteps = [
  { number: "01", title: "Опишите задачу", description: "ИИ-ассистент задаст уточняющие вопросы и сформирует детальное ТЗ с оценкой бюджета и сроков" },
  { number: "02", title: "Получите отклики", description: "Алгоритм подберёт лучших исполнителей. Вы увидите их рейтинг, портфолио и отзывы" },
  { number: "03", title: "Внесите оплату в эскроу", description: "Деньги замораживаются на платформе до приёмки работы — это защита для обеих сторон" },
  { number: "04", title: "Примите результат", description: "Проверьте работу, оставьте отзыв. Исполнитель получит оплату после вашего подтверждения" },
];

const freelancerSteps = [
  { number: "01", title: "Найдите подходящий заказ", description: "ИИ покажет проекты, соответствующие вашим навыкам и опыту. Фильтруйте по бюджету и категории" },
  { number: "02", title: "Отправьте отклик", description: "Ассистент поможет составить убедительное предложение на основе требований заказчика" },
  { number: "03", title: "Выполните работу", description: "Общайтесь с заказчиком в чате, прикрепляйте файлы, следите за сроками" },
  { number: "04", title: "Получите оплату", description: "После приёмки работы деньги автоматически поступят на ваш баланс. Выводите на карту или счёт" },
];

function StepCard({ step, idx }: { step: { number: string; title: string; description: string }; idx: number }) {
  return (
    <ScrollReveal direction="up" delay={idx * 0.1}>
      <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }} className="h-full">
        <Card padding="lg" className="h-full">
          <div style={{ fontSize: 48, fontWeight: 700, background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", opacity: 0.4, marginBottom: 16, flexShrink: 0 }}>{step.number}</div>
          <h4 style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)", marginBottom: 12 }}>{step.title}</h4>
          <p style={{ color: "var(--foreground-secondary)", lineHeight: 1.6, flex: 1 }}>{step.description}</p>
        </Card>
      </motion.div>
    </ScrollReveal>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ position: "relative", padding: "96px 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--primary-05), transparent, var(--primary-05))" }} />

      <Container className="relative z-10">
        <ScrollReveal direction="up" delay={0}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, fontFamily: "var(--font-display)" }}>
              <span style={{ color: "var(--foreground)" }}>Как это </span>
              <span style={{ background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>работает</span>
            </h2>
            <p style={{ fontSize: 18, color: "var(--foreground-secondary)", maxWidth: 600, margin: "16px auto 0" }}>
              Простой и прозрачный процесс для заказчиков и фрилансеров
            </p>
          </div>
        </ScrollReveal>

        <div style={{ marginBottom: 64 }}>
          <ScrollReveal direction="up" delay={0.1}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={20} style={{ color: "white" }} />
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>Для заказчиков</h3>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clientSteps.map((step, idx) => <StepCard key={idx} step={step} idx={idx} />)}
          </div>
        </div>

        <div>
          <ScrollReveal direction="up" delay={0.1}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase size={20} style={{ color: "white" }} />
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>Для фрилансеров</h3>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {freelancerSteps.map((step, idx) => <StepCard key={idx} step={step} idx={idx} />)}
          </div>
        </div>
      </Container>
    </section>
  );
}

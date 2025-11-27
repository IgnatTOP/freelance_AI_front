"use client";

import { Container } from "@/src/shared/ui/Container";
import { Card } from "@/src/shared/ui/Card";
import { ScrollReveal } from "@/src/shared/ui/ScrollReveal";

const steps = [
  {
    number: "01",
    title: "Расскажите о задаче",
    description:
      "ИИ-ассистент задаст уточняющие вопросы и сформирует подробное ТЗ",
    forClient: true,
  },
  {
    number: "02",
    title: "Получите отклики",
    description:
      "Умный алгоритм подберет лучших исполнителей с учетом рейтинга и опыта",
    forClient: true,
  },
  {
    number: "03",
    title: "Работайте с ИИ-контролем",
    description:
      "Система следит за сроками, этапами и автоматически уведомляет о прогрессе",
    forClient: true,
  },
  {
    number: "04",
    title: "Получите результат",
    description:
      "Проверьте работу, оставьте отзыв и оплатите через защищенный эскроу",
    forClient: true,
  },
];

const freelancerSteps = [
  {
    number: "01",
    title: "Найдите заказ",
    description:
      "ИИ покажет наиболее подходящие проекты на основе вашего профиля",
  },
  {
    number: "02",
    title: "Создайте отклик",
    description: "Ассистент поможет составить убедительное предложение",
  },
  {
    number: "03",
    title: "Выполните работу",
    description: "Следуйте плану и общайтесь с клиентом через платформу",
  },
  {
    number: "04",
    title: "Получите оплату",
    description: "Деньги поступят сразу после приемки работы",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-dark/5" />

      <Container className="relative z-10">
        {/* Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center mb-16 space-y-4">
            <h2
              className="text-4xl lg:text-5xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-foreground">Как это </span>
              <span className="gradient-text">работает</span>
            </h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
              Простой процесс для заказчиков и фрилансеров
            </p>
          </div>
        </ScrollReveal>

        {/* Client Steps */}
        <div className="mb-16">
          <ScrollReveal direction="up" delay={0.1}>
            <h3 className="text-2xl font-bold text-center mb-8 text-primary">
              Для заказчиков
            </h3>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <ScrollReveal key={idx} direction="left" delay={idx * 0.1}>
                <Card padding="lg" className="relative h-full">
                  <div className="flex flex-col space-y-4">
                    <div className="text-6xl font-bold gradient-text opacity-40">
                      {step.number}
                    </div>
                    <h4 className="text-xl font-bold text-foreground">
                      {step.title}
                    </h4>
                    <p className="text-foreground-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Freelancer Steps */}
        <div>
          <ScrollReveal direction="up" delay={0.1}>
            <h3 className="text-2xl font-bold text-center mb-8 text-primary">
              Для фрилансеров
            </h3>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {freelancerSteps.map((step, idx) => (
              <ScrollReveal key={idx} direction="right" delay={idx * 0.1}>
                <Card padding="lg" className="relative h-full">
                  <div className="flex flex-col space-y-4">
                    <div className="text-6xl font-bold gradient-text opacity-40">
                      {step.number}
                    </div>
                    <h4 className="text-xl font-bold text-foreground">
                      {step.title}
                    </h4>
                    <p className="text-foreground-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

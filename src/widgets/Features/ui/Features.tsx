"use client";

import { Container } from "@/src/shared/ui/Container";
import { Card } from "@/src/shared/ui/Card";
import { ScrollReveal } from "@/src/shared/ui/ScrollReveal";
import { Bot, FileText, Target, MessageSquare, Shield, TrendingUp, Wallet, Star, Bell, Briefcase } from "lucide-react";

const features = [
  { icon: Bot, title: "ИИ-Ассистент", description: "Умный помощник составит идеальное ТЗ, поможет создать выигрышный отклик и проконтролирует сроки" },
  { icon: FileText, title: "Автоматизация ТЗ", description: "ИИ задаёт уточняющие вопросы и формирует детальное техническое задание с оценкой бюджета" },
  { icon: Target, title: "Умный подбор", description: "Алгоритм анализирует навыки, рейтинг и опыт для рекомендации лучших исполнителей" },
  { icon: MessageSquare, title: "Чат с историей", description: "Удобное общение с сохранением переписки, вложениями и привязкой к заказам" },
  { icon: Shield, title: "Эскроу-платежи", description: "Деньги замораживаются до приёмки работы — защита для обеих сторон сделки" },
  { icon: Wallet, title: "Кошелёк и выводы", description: "Управление балансом, история транзакций и быстрый вывод на карту или счёт" },
  { icon: Star, title: "Рейтинг и отзывы", description: "Прозрачная система оценок помогает выбрать надёжного исполнителя или заказчика" },
  { icon: Bell, title: "Уведомления", description: "Мгновенные оповещения о новых откликах, сообщениях и изменениях статуса" },
  { icon: Briefcase, title: "Портфолио", description: "Демонстрация работ с описанием, изображениями и ссылками на проекты" },
  { icon: TrendingUp, title: "Аналитика", description: "Статистика заказов, доходов и эффективности для принятия решений" },
];

export function Features() {
  return (
    <section id="features" style={{ position: "relative", padding: "96px 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, var(--primary-05), transparent)" }} />

      <Container className="relative z-10">
        <ScrollReveal direction="up" delay={0}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, fontFamily: "var(--font-display)" }}>
              <span style={{ background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Возможности</span>
              <span style={{ color: "var(--foreground)" }}> платформы</span>
            </h2>
            <p style={{ fontSize: 18, color: "var(--foreground-secondary)", maxWidth: 600, margin: "16px auto 0" }}>
              Полный набор инструментов для эффективной работы заказчиков и фрилансеров
            </p>
          </div>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.05}>
                <Card padding="lg" className="h-full">
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--primary-10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, flexShrink: 0 }}>
                    <Icon size={24} style={{ color: "var(--primary)" }} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>{feature.title}</h3>
                  <p style={{ color: "var(--foreground-secondary)", lineHeight: 1.6, fontSize: 15, flex: 1 }}>{feature.description}</p>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

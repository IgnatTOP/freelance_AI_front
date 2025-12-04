"use client";

import { Container } from "@/src/shared/ui/Container";
import { Card } from "@/src/shared/ui/Card";
import { ScrollReveal } from "@/src/shared/ui/ScrollReveal";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Алексей К.",
    role: "Заказчик",
    avatar: "А",
    rating: 5,
    text: "ИИ-ассистент помог составить ТЗ за 10 минут. Раньше на это уходило несколько часов. Нашёл отличного разработчика уже на следующий день.",
  },
  {
    name: "Мария С.",
    role: "Фрилансер",
    avatar: "М",
    rating: 5,
    text: "Благодаря умному подбору заказов я трачу меньше времени на поиск и больше — на работу. Доход вырос на 40% за первый месяц.",
  },
  {
    name: "Дмитрий В.",
    role: "Заказчик",
    avatar: "Д",
    rating: 5,
    text: "Эскроу-система даёт уверенность, что деньги в безопасности. Работа принята — исполнитель получил оплату. Всё прозрачно.",
  },
];

export function Testimonials() {
  return (
    <section style={{ position: "relative", padding: "96px 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, var(--primary-05), transparent, var(--primary-05))" }} />

      <Container className="relative z-10">
        <ScrollReveal direction="up" delay={0}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, fontFamily: "var(--font-display)" }}>
              <span style={{ color: "var(--foreground)" }}>Отзывы </span>
              <span style={{ background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>пользователей</span>
            </h2>
            <p style={{ fontSize: 18, color: "var(--foreground-secondary)", maxWidth: 600, margin: "16px auto 0" }}>
              Что говорят о платформе заказчики и фрилансеры
            </p>
          </div>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {testimonials.map((item, idx) => (
            <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
              <Card padding="lg" className="h-full">
                <Quote size={32} style={{ color: "var(--primary)", opacity: 0.3, marginBottom: 16, flexShrink: 0 }} />
                <p style={{ color: "var(--foreground-secondary)", lineHeight: 1.7, fontStyle: "italic", flex: 1 }}>
                  &ldquo;{item.text}&rdquo;
                </p>
                <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="var(--primary)" style={{ color: "var(--primary)" }} />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--primary-10)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "var(--primary)" }}>
                    {item.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{item.name}</div>
                    <div style={{ fontSize: 14, color: "var(--foreground-tertiary)" }}>{item.role}</div>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

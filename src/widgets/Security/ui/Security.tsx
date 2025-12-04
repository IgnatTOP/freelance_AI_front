"use client";

import { Container } from "@/src/shared/ui/Container";
import { Card } from "@/src/shared/ui/Card";
import { ScrollReveal } from "@/src/shared/ui/ScrollReveal";
import { Lock, CreditCard, Shield, AlertTriangle, FileCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: CreditCard,
    title: "Эскроу-платежи",
    description: "Деньги замораживаются до приёмки работы. Исполнитель получает оплату только после подтверждения заказчика.",
  },
  {
    icon: Shield,
    title: "Верификация пользователей",
    description: "Проверка документов и подтверждение личности для повышения доверия между участниками.",
  },
  {
    icon: AlertTriangle,
    title: "Система споров",
    description: "При возникновении разногласий модераторы помогут разрешить конфликт справедливо.",
  },
  {
    icon: FileCheck,
    title: "Договор-оферта",
    description: "Каждый заказ защищён юридически. Условия фиксируются при создании сделки.",
  },
];

export function Security() {
  return (
    <section style={{ position: "relative", padding: "96px 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, var(--primary-05), transparent)" }} />

      <Container className="relative z-10">
        <ScrollReveal direction="up" delay={0}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "var(--primary-10)", marginBottom: 24 }}>
              <Lock size={20} style={{ color: "var(--primary)" }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--primary)" }}>Безопасность</span>
            </div>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, fontFamily: "var(--font-display)" }}>
              <span style={{ color: "var(--foreground)" }}>Защита </span>
              <span style={{ background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>каждой сделки</span>
            </h2>
            <p style={{ fontSize: 18, color: "var(--foreground-secondary)", maxWidth: 600, margin: "16px auto 0" }}>
              Многоуровневая система защиты для безопасной работы
            </p>
          </div>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {securityFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                <Card padding="lg" className="h-full">
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, var(--primary-10), var(--primary-20))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, flexShrink: 0 }}>
                    <Icon size={28} style={{ color: "var(--primary)" }} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>{feature.title}</h3>
                  <p style={{ color: "var(--foreground-secondary)", lineHeight: 1.6, flex: 1 }}>{feature.description}</p>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

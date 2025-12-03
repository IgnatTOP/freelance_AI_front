"use client";

import { Container } from "@/src/shared/ui/Container";
import { Card } from "@/src/shared/ui/Card";
import { ScrollReveal } from "@/src/shared/ui/ScrollReveal";
import { Code, Palette, PenTool, TrendingUp, Video, Globe, Smartphone, Database } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  { icon: Code, name: "Веб-разработка", count: "2,500+ заказов" },
  { icon: Smartphone, name: "Мобильные приложения", count: "1,200+ заказов" },
  { icon: Palette, name: "Дизайн", count: "1,800+ заказов" },
  { icon: PenTool, name: "Копирайтинг", count: "900+ заказов" },
  { icon: TrendingUp, name: "Маркетинг", count: "750+ заказов" },
  { icon: Video, name: "Видеопроизводство", count: "400+ заказов" },
  { icon: Database, name: "Data Science", count: "350+ заказов" },
  { icon: Globe, name: "SEO и продвижение", count: "600+ заказов" },
];

export function Categories() {
  const router = useRouter();

  return (
    <section style={{ position: "relative", padding: "96px 0", overflow: "hidden" }}>
      <Container className="relative z-10">
        <ScrollReveal direction="up" delay={0}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, fontFamily: "var(--font-display)" }}>
              <span style={{ color: "var(--foreground)" }}>Популярные </span>
              <span style={{ background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>категории</span>
            </h2>
            <p style={{ fontSize: 18, color: "var(--foreground-secondary)", maxWidth: 600, margin: "16px auto 0" }}>
              Найдите специалистов в любой области
            </p>
          </div>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="max-lg:grid-cols-2 max-sm:grid-cols-1">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.05}>
                <div 
                  onClick={() => router.push("/orders")}
                  style={{ cursor: "pointer", height: "100%" }}
                >
                  <Card padding="md" className="h-full hover:border-primary/50 transition-colors">
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--primary-10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={24} style={{ color: "var(--primary)" }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{cat.name}</div>
                        <div style={{ fontSize: 13, color: "var(--foreground-tertiary)" }}>{cat.count}</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

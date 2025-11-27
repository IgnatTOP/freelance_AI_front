'use client';

import { Container } from '@/src/shared/ui/Container';
import { Card } from '@/src/shared/ui/Card';
import { ScrollReveal } from '@/src/shared/ui/ScrollReveal';
import { Bot, FileText, Target, MessageSquare, Shield, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'ИИ-Ассистент',
    description: 'Умный помощник составит идеальное ТЗ для клиента и поможет фрилансеру создать выигрышный отклик',
  },
  {
    icon: FileText,
    title: 'Автоматизация ТЗ',
    description: 'ИИ анализирует ваши требования и формирует подробное техническое задание',
  },
  {
    icon: Target,
    title: 'Умный подбор',
    description: 'Алгоритм находит наиболее подходящих исполнителей для вашего проекта',
  },
  {
    icon: MessageSquare,
    title: 'Контроль проекта',
    description: 'ИИ следит за этапами выполнения и уведомляет о важных событиях',
  },
  {
    icon: Shield,
    title: 'Безопасные сделки',
    description: 'Защита платежей через эскроу и гарантия выполнения обязательств',
  },
  {
    icon: TrendingUp,
    title: 'Аналитика и рост',
    description: 'Статистика работы, рейтинги и рекомендации для развития на платформе',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <Container className="relative z-10">
        {/* Section header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="gradient-text">Возможности</span>
              <span className="text-foreground"> платформы</span>
            </h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
              ИИ-технологии для эффективной работы клиентов и фрилансеров
            </p>
          </div>
        </ScrollReveal>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                <Card padding="lg" className="h-full">
                  <div className="flex flex-col space-y-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-foreground-secondary leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

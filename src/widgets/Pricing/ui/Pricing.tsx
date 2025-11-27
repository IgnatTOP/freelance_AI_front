'use client';

import { Container } from '@/src/shared/ui/Container';
import { Card } from '@/src/shared/ui/Card';
import { Button } from '@/src/shared/ui/Button';
import { ScrollReveal } from '@/src/shared/ui/ScrollReveal';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toastService } from '@/src/shared/lib/toast';

const plans = [
  {
    name: 'Базовый',
    price: '0',
    period: 'навсегда',
    description: 'Для старта на платформе',
    features: [
      'Доступ к заказам',
      'Базовый ИИ-ассистент',
      'Комиссия 15%',
      '5 откликов в день',
      'Базовая аналитика',
    ],
    popular: false,
  },
  {
    name: 'Профессионал',
    price: '1,990',
    period: 'месяц',
    description: 'Для активных фрилансеров и заказчиков',
    features: [
      'Неограниченные отклики',
      'Расширенный ИИ-ассистент',
      'Комиссия 10%',
      'Приоритет в поиске',
      'Продвинутая аналитика',
      'Персональный менеджер',
      'Безопасная сделка',
    ],
    popular: true,
  },
  {
    name: 'Бизнес',
    price: '4,990',
    period: 'месяц',
    description: 'Для агентств и команд',
    features: [
      'Все из Профессионал',
      'Комиссия 5%',
      'Мультиаккаунты',
      'API доступ',
      'Приоритетная поддержка 24/7',
      'Брендирование профиля',
      'Корпоративное обучение',
      'Выделенный аккаунт-менеджер',
    ],
    popular: false,
  },
];

export function Pricing() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth/register');
  };

  const handleContactUs = () => {
    toastService.info('Свяжитесь с нами через форму обратной связи или email');
    // Можно добавить переход на страницу контактов, если она есть
    // router.push('/contact');
  };

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/5 to-transparent" />

      <Container className="relative z-10">
        {/* Section header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              <span className="text-foreground">Выберите </span>
              <span className="gradient-text">свой план</span>
            </h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
              Прозрачные цены без скрытых платежей. Отмените в любой момент.
            </p>
          </div>
        </ScrollReveal>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, idx) => (
            <ScrollReveal key={idx} direction="up" delay={idx * 0.15}>
              <Card
                padding="lg"
                className={plan.popular ? 'ring-2 ring-primary shadow-glow scale-105 h-full' : 'h-full'}
              >
              {/* Popular badge */}
              {plan.popular && (
                <div className="bg-primary text-background px-4 py-1 rounded-full text-sm font-medium w-fit mb-4">
                  Популярный
                </div>
              )}

              {/* Plan info */}
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-foreground-tertiary text-sm">{plan.description}</p>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  {plan.price === 'Custom' ? (
                    <span className="text-4xl font-bold gradient-text">По запросу</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-foreground">₽{plan.price}</span>
                      <span className="text-foreground-tertiary">/ {plan.period}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Features list */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={plan.popular ? 'primary' : 'glass'}
                className="w-full"
                onClick={plan.price === 'Custom' ? handleContactUs : handleGetStarted}
              >
                {plan.price === 'Custom' ? 'Связаться с нами' : 'Начать работу'}
              </Button>
            </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-center mt-12">
          <p className="text-foreground-tertiary">
            Нужна помощь с выбором?{' '}
            <button 
              className="text-primary hover:text-primary-light transition-colors"
              onClick={handleContactUs}
            >
              Свяжитесь с нами
            </button>
          </p>
        </div>
      </Container>
    </section>
  );
}

import { Container } from '@/src/shared/ui/Container';
import { Card } from '@/src/shared/ui/Card';
import { Metadata } from 'next';
import { Github, Linkedin, Mail, User } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'О нас',
  description: 'Узнайте больше о команде Modern Freelance - умной фриланс-бирже с ИИ-ассистентом. Наша миссия - сделать работу с фрилансерами проще и эффективнее.',
  openGraph: {
    title: 'О нас | Modern Freelance',
    description: 'Узнайте больше о команде Modern Freelance - умной фриланс-бирже с ИИ-ассистентом.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const team = [
  {
    name: 'Зорин Игнат',
    role: 'Frontend Developer',
    description: 'Зорин - фронт',
    avatar: '/ignat.png',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'ignat@example.com',
    },
  },
  {
    name: 'Алексей Заседателев',
    role: 'Backend Developer',
    description: 'Леша - бек',
    avatar: '/lesha.png',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'alexey@example.com',
    },
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-dark/5" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="gradient-text">О нашей платформе</span>
            </h1>
            <p className="text-xl text-foreground-secondary leading-relaxed">
              Мы создали умную фриланс-биржу с ИИ, которая меняет подход
              к удаленной работе и делает сотрудничество простым и эффективным
            </p>
          </div>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Card padding="lg">
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                Наша миссия
              </h2>
              <p className="text-foreground-secondary text-lg leading-relaxed mb-4">
                Сделать фриланс максимально простым и эффективным с помощью искусственного интеллекта.
                Мы создали платформу, где ИИ помогает клиентам четко формулировать задачи,
                а фрилансерам — находить идеальные проекты и создавать выигрышные предложения.
              </p>
              <p className="text-foreground-secondary text-lg leading-relaxed">
                Наша цель — устранить барьеры между заказчиками и исполнителями,
                автоматизировать рутину и дать каждому возможность сосредоточиться на главном —
                качественной работе и развитии.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Команда
            </h2>
            <p className="text-foreground-secondary text-lg">
              Познакомьтесь с людьми, стоящими за проектом
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <Card key={member.name} padding="lg" className="group">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Avatar */}
                  <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-border/50 group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-foreground-secondary leading-relaxed">
                      {member.description}
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center space-x-3 pt-4">
                    <a
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-background-elevated hover:bg-primary/10 flex items-center justify-center text-foreground-secondary hover:text-primary transition-all"
                      aria-label="GitHub"
                    >
                      <Github size={18} />
                    </a>
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-background-elevated hover:bg-primary/10 flex items-center justify-center text-foreground-secondary hover:text-primary transition-all"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </a>
                    <a
                      href={`mailto:${member.social.email}`}
                      className="w-10 h-10 rounded-lg bg-background-elevated hover:bg-primary/10 flex items-center justify-center text-foreground-secondary hover:text-primary transition-all"
                      aria-label="Email"
                    >
                      <Mail size={18} />
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-display)' }}>
              Наши ценности
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'ИИ-технологии',
                  description: 'Используем передовой ИИ для упрощения работы',
                },
                {
                  title: 'Прозрачность',
                  description: 'Честные условия и защита интересов обеих сторон',
                },
                {
                  title: 'Эффективность',
                  description: 'Автоматизация рутины для фокуса на результате',
                },
              ].map((value) => (
                <Card key={value.title} padding="lg">
                  <h3 className="text-xl font-bold mb-3 gradient-text">
                    {value.title}
                  </h3>
                  <p className="text-foreground-secondary">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

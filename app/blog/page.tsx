import { Container } from '@/src/shared/ui/Container';
import { Card } from '@/src/shared/ui/Card';
import { Metadata } from 'next';
import { Calendar, Clock, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Блог',
  description: 'Новости, статьи и обновления платформы Modern Freelance. Узнайте о новых функциях, советах для фрилансеров и заказчиков, гайдах и истории успеха.',
  openGraph: {
    title: 'Блог | Modern Freelance',
    description: 'Новости, статьи и обновления платформы. Узнайте о новых функциях и советах для фрилансеров.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const posts = [
  {
    id: 1,
    title: 'Запуск платформы с ИИ-ассистентом',
    excerpt: 'Мы рады представить инновационную фриланс-биржу с искусственным интеллектом, которая изменит подход к работе...',
    date: '2025-01-15',
    readTime: '5 мин',
    category: 'Новости',
  },
  {
    id: 2,
    title: 'Как ИИ помогает составить идеальное ТЗ',
    excerpt: 'Искусственный интеллект анализирует ваши требования и задает уточняющие вопросы для создания детального технического задания...',
    date: '2025-01-10',
    readTime: '7 мин',
    category: 'Гайды',
  },
  {
    id: 3,
    title: '10 советов для успешного фриланса',
    excerpt: 'Собрали лучшие практики от опытных фрилансеров платформы. Узнайте, как выделиться среди конкурентов...',
    date: '2025-01-05',
    readTime: '10 мин',
    category: 'Советы',
  },
  {
    id: 4,
    title: 'Обновление: новые функции ИИ-ассистента',
    excerpt: 'Представляем обновленную версию ИИ-ассистента с расширенными возможностями анализа и подбора...',
    date: '2024-12-28',
    readTime: '4 мин',
    category: 'Обновления',
  },
  {
    id: 5,
    title: 'Безопасность сделок: как работает эскроу',
    excerpt: 'Подробное руководство по системе защиты платежей и гарантиям для клиентов и фрилансеров...',
    date: '2024-12-20',
    readTime: '6 мин',
    category: 'Гайды',
  },
  {
    id: 6,
    title: 'История успеха: от первого заказа до топ-фрилансера',
    excerpt: 'Интервью с одним из наших успешных фрилансеров о пути развития на платформе...',
    date: '2024-12-15',
    readTime: '8 мин',
    category: 'Истории',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-dark/5" />

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="gradient-text">Блог</span>
            </h1>
            <p className="text-xl text-foreground-secondary leading-relaxed">
              Новости платформы, полезные статьи и истории успеха
            </p>
          </div>
        </Container>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="block h-full">
                <Card padding="none" className="overflow-hidden h-full group cursor-pointer">
                  {/* Image placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary-dark/20 overflow-hidden glass border-b border-border/50 flex-shrink-0">
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 group-hover:scale-105 transition-transform duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <ImageIcon size={28} className="text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground-secondary">{post.category}</p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    {/* Category */}
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary w-fit mb-3">
                      {post.category}
                    </span>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-foreground-secondary line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-foreground-tertiary pt-4 mt-4 border-t border-border">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

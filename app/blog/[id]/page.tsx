"use client";

import { useParams, useRouter } from "next/navigation";
import { Layout, Typography, Card, Space, Button } from "antd";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Container } from "@/src/shared/ui/Container";
import { StructuredData } from "@/src/shared/ui/StructuredData";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/src/shared/lib/seo/generateStructuredData";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const posts: Record<number, any> = {
  1: {
    id: 1,
    title: "Запуск платформы с ИИ-ассистентом",
    category: "Новости",
    date: "2025-01-15",
    readTime: "5 мин",
    content: `
      <p>Мы рады представить инновационную фриланс-биржу с искусственным интеллектом, которая изменит подход к работе с фрилансерами.</p>
      
      <h2>Что нового?</h2>
      <p>Наша платформа объединяет лучшие практики современных фриланс-бирж с передовыми технологиями искусственного интеллекта. Теперь создание технического задания, поиск подходящих исполнителей и управление проектами стали проще и эффективнее.</p>
      
      <h2>ИИ-ассистент</h2>
      <p>Главная особенность нашей платформы - умный ИИ-ассистент, который помогает:</p>
      <ul>
        <li>Создавать детальные технические задания</li>
        <li>Находить подходящих фрилансеров</li>
        <li>Оценивать качество заказов</li>
        <li>Предлагать оптимальные цены и сроки</li>
      </ul>
      
      <h2>Будущее фриланса</h2>
      <p>Мы верим, что искусственный интеллект может значительно улучшить процесс взаимодействия между заказчиками и исполнителями, делая его более прозрачным, быстрым и эффективным.</p>
    `,
  },
  2: {
    id: 2,
    title: "Как ИИ помогает составить идеальное ТЗ",
    category: "Гайды",
    date: "2025-01-10",
    readTime: "7 мин",
    content: `
      <p>Искусственный интеллект анализирует ваши требования и задает уточняющие вопросы для создания детального технического задания.</p>
      
      <h2>Процесс создания ТЗ с ИИ</h2>
      <p>Наш ИИ-ассистент использует продвинутые алгоритмы для анализа ваших требований и автоматического создания структурированного технического задания.</p>
      
      <h2>Преимущества</h2>
      <ul>
        <li>Экономия времени на составление ТЗ</li>
        <li>Более детальные и структурированные требования</li>
        <li>Автоматическое определение необходимых навыков</li>
        <li>Предложения по бюджету и срокам</li>
      </ul>
    `,
  },
  3: {
    id: 3,
    title: "10 советов для успешного фриланса",
    category: "Советы",
    date: "2025-01-05",
    readTime: "10 мин",
    content: `
      <p>Собрали лучшие практики от опытных фрилансеров платформы. Узнайте, как выделиться среди конкурентов.</p>
      
      <h2>1. Создайте качественное портфолио</h2>
      <p>Ваше портфолио - это ваше лицо. Добавьте лучшие работы с подробными описаниями.</p>
      
      <h2>2. Заполните профиль полностью</h2>
      <p>Детальный профиль повышает доверие заказчиков и улучшает поисковую выдачу.</p>
      
      <h2>3. Быстро отвечайте на сообщения</h2>
      <p>Оперативность - ключ к успеху. Отвечайте на сообщения в течение нескольких часов.</p>
      
      <h2>4. Используйте ИИ-рекомендации</h2>
      <p>Наша платформа предлагает заказы, которые подходят именно вам.</p>
      
      <h2>5. Собирайте отзывы</h2>
      <p>Положительные отзывы значительно повышают ваш рейтинг и привлекательность.</p>
    `,
  },
  4: {
    id: 4,
    title: "Обновление: новые функции ИИ-ассистента",
    category: "Обновления",
    date: "2024-12-28",
    readTime: "4 мин",
    content: `
      <p>Представляем обновленную версию ИИ-ассистента с расширенными возможностями анализа и подбора.</p>
      
      <h2>Новые возможности</h2>
      <ul>
        <li>Улучшенный анализ заказов</li>
        <li>Более точные рекомендации фрилансеров</li>
        <li>Расширенная поддержка языков</li>
        <li>Интеграция с популярными инструментами</li>
      </ul>
    `,
  },
  5: {
    id: 5,
    title: "Безопасность сделок: как работает эскроу",
    category: "Гайды",
    date: "2024-12-20",
    readTime: "6 мин",
    content: `
      <p>Подробное руководство по системе защиты платежей и гарантиям для клиентов и фрилансеров.</p>
      
      <h2>Что такое эскроу?</h2>
      <p>Эскроу - это система безопасных платежей, где средства замораживаются до выполнения работы.</p>
      
      <h2>Как это работает?</h2>
      <ol>
        <li>Заказчик создает заказ и резервирует средства</li>
        <li>Фрилансер выполняет работу</li>
        <li>После проверки средства переводятся исполнителю</li>
      </ol>
    `,
  },
  6: {
    id: 6,
    title: "История успеха: от первого заказа до топ-фрилансера",
    category: "Истории",
    date: "2024-12-15",
    readTime: "8 мин",
    content: `
      <p>Интервью с одним из наших успешных фрилансеров о пути развития на платформе.</p>
      
      <h2>Начало пути</h2>
      <p>Все начинается с первого заказа. Наш герой начал с небольших проектов и постепенно наращивал опыт.</p>
      
      <h2>Ключевые моменты</h2>
      <ul>
        <li>Качественное выполнение каждого проекта</li>
        <li>Постоянное обучение и развитие</li>
        <li>Сбор положительных отзывов</li>
        <li>Использование всех возможностей платформы</li>
      </ul>
    `,
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const postId = Number(params.id);
  const post = posts[postId];

  if (!post) {
    return (
      <Layout style={{ minHeight: "100vh", background: "transparent" }}>
        <Content style={{ padding: "24px" }}>
          <Container>
            <Card>
              <Title level={2}>Пост не найден</Title>
              <Link href="/blog">
                <Button type="primary">Вернуться к блогу</Button>
              </Link>
            </Card>
          </Container>
        </Content>
      </Layout>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  
  const articleSchema = generateArticleSchema({
    headline: post.title,
    description: post.content.replace(/<[^>]*>/g, '').substring(0, 200),
    datePublished: post.date,
    dateModified: post.date,
    author: {
      name: 'Modern Freelance Team',
    },
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Главная', url: siteUrl },
      { name: 'Блог', url: `${siteUrl}/blog` },
      { name: post.title, url: `${siteUrl}/blog/${postId}` },
    ],
  });

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <StructuredData data={[articleSchema, breadcrumbSchema]} />
      <Content style={{ padding: "24px" }}>
        <Container>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Link href="/blog">
              <Button type="link" icon={<ArrowLeft size={16} />} style={{ padding: 0 }}>
                Назад к блогу
              </Button>
            </Link>

            <Card>
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: 12,
                      fontWeight: 500,
                      background: "var(--primary-06)",
                      color: "var(--primary)",
                      marginBottom: 16,
                    }}
                  >
                    {post.category}
                  </span>
                  <Title level={1}>{post.title}</Title>
                  <Space>
                    <Space size="small">
                      <Calendar size={16} />
                      <span>{new Date(post.date).toLocaleDateString("ru-RU")}</span>
                    </Space>
                    <Space size="small">
                      <Clock size={16} />
                      <span>{post.readTime}</span>
                    </Space>
                  </Space>
                </div>

                <div
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  style={{
                    fontSize: 16,
                    lineHeight: 1.8,
                  }}
                />
              </Space>
            </Card>

            <div style={{ textAlign: "center" }}>
              <Link href="/blog">
                <Button type="primary">Вернуться к блогу</Button>
              </Link>
            </div>
          </Space>
        </Container>
      </Content>
    </Layout>
  );
}


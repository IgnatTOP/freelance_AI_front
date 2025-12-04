"use client";

import { useParams, useRouter } from "next/navigation";
import { Box, Container, Typography, Card, Button, Stack, Chip } from "@mui/material";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { StructuredData } from "@/src/shared/ui/StructuredData";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/src/shared/lib/seo/generateStructuredData";

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
      <Box sx={{ minHeight: "100vh", bgcolor: "transparent" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
          <Card sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4" gutterBottom>
              Пост не найден
            </Typography>
            <Link href="/blog">
              <Button variant="contained">Вернуться к блогу</Button>
            </Link>
          </Card>
        </Container>
      </Box>
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
    <Box sx={{ minHeight: "100vh", bgcolor: "transparent" }}>
      <StructuredData data={[articleSchema, breadcrumbSchema]} />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Link href="/blog">
            <Button
              startIcon={<ArrowLeft size={16} />}
              sx={{ p: 0, minWidth: 0, minHeight: 44 }}
            >
              Назад к блогу
            </Button>
          </Link>

          <Card sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Box>
                <Chip
                  label={post.category}
                  size="small"
                  color="primary"
                  sx={{ mb: 2, fontWeight: 500 }}
                />
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1.75rem", md: "2.5rem" },
                    fontWeight: 600
                  }}
                >
                  {post.title}
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    flexWrap: "wrap",
                    gap: 1
                  }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Calendar size={16} />
                    <Typography variant="body2">
                      {new Date(post.date).toLocaleDateString("ru-RU")}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Clock size={16} />
                    <Typography variant="body2">{post.readTime}</Typography>
                  </Stack>
                </Stack>
              </Box>

              <Box
                dangerouslySetInnerHTML={{ __html: post.content }}
                sx={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  "& h2": {
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                    fontWeight: 600,
                    mt: 3,
                    mb: 1.5,
                  },
                  "& p": {
                    mb: 2,
                  },
                  "& ul, & ol": {
                    pl: 3,
                    mb: 2,
                  },
                  "& li": {
                    mb: 0.5,
                  },
                }}
              />
            </Stack>
          </Card>

          <Box sx={{ textAlign: "center" }}>
            <Link href="/blog">
              <Button
                variant="contained"
                size="large"
                sx={{ minHeight: 44 }}
              >
                Вернуться к блогу
              </Button>
            </Link>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

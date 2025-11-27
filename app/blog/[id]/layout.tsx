import { Metadata } from 'next';

const posts: Record<number, any> = {
  1: {
    title: "Запуск платформы с ИИ-ассистентом",
    description: "Мы рады представить инновационную фриланс-биржу с искусственным интеллектом, которая изменит подход к работе с фрилансерами.",
  },
  2: {
    title: "Как ИИ помогает составить идеальное ТЗ",
    description: "Искусственный интеллект анализирует ваши требования и задает уточняющие вопросы для создания детального технического задания.",
  },
  3: {
    title: "10 советов для успешного фриланса",
    description: "Собрали лучшие практики от опытных фрилансеров платформы. Узнайте, как выделиться среди конкурентов.",
  },
  4: {
    title: "Обновление: новые функции ИИ-ассистента",
    description: "Представляем обновленную версию ИИ-ассистента с расширенными возможностями анализа и подбора.",
  },
  5: {
    title: "Безопасность сделок: как работает эскроу",
    description: "Подробное руководство по системе защиты платежей и гарантиям для клиентов и фрилансеров.",
  },
  6: {
    title: "История успеха: от первого заказа до топ-фрилансера",
    description: "Интервью с одним из наших успешных фрилансеров о пути развития на платформе.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const postId = Number(params.id);
  const post = posts[postId];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  if (!post) {
    return {
      title: 'Пост не найден',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: `${post.title} | Modern Freelance`,
      description: post.description,
      type: 'article',
      url: `${siteUrl}/blog/${postId}`,
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [`${siteUrl}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


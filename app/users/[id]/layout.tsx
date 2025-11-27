import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // В реальном приложении здесь можно загрузить данные пользователя
  // const user = await getUser(params.id);
  
  return {
    title: 'Профиль пользователя',
    description: 'Профиль фрилансера или заказчика. Просмотрите портфолио, рейтинг и отзывы.',
    robots: {
      index: false, // Профили пользователей обычно не индексируются
      follow: true,
    },
  };
}

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


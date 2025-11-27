import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // В реальном приложении здесь можно загрузить данные заказа
  // const order = await getOrder(params.id);
  
  return {
    title: 'Детали заказа',
    description: 'Подробная информация о заказе. Просмотрите описание, требования, бюджет и сроки выполнения.',
    robots: {
      index: false, // Динамические страницы обычно не индексируются
      follow: true,
    },
  };
}

export default function OrderDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


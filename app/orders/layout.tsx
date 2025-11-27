import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Заказы',
  description: 'Найдите подходящий проект для работы или разместите свой заказ. Тысячи проектов от заказчиков по всему миру.',
  openGraph: {
    title: 'Заказы | Modern Freelance',
    description: 'Найдите подходящий проект для работы или разместите свой заказ. Тысячи проектов от заказчиков.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


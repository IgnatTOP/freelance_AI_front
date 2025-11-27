import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Фрилансеры',
  description: 'Найдите профессионального исполнителя для вашего проекта. Просмотрите портфолио, рейтинги и отзывы фрилансеров.',
  openGraph: {
    title: 'Фрилансеры | Modern Freelance',
    description: 'Найдите профессионального исполнителя для вашего проекта. Просмотрите портфолио и рейтинги.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FreelancersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


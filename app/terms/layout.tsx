import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Условия использования',
  description: 'Условия использования платформы Modern Freelance. Ознакомьтесь с правилами и условиями работы на нашей фриланс-бирже.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


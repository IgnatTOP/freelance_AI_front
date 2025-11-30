import { Metadata } from 'next';
import { Hero } from '@/src/widgets/Hero';
import { Features } from '@/src/widgets/Features';
import { HowItWorks } from '@/src/widgets/HowItWorks';
import { Pricing } from '@/src/widgets/Pricing';
import { StructuredData } from '@/src/shared/ui/StructuredData';
import { generateFreelancePlatformSchema, generateOrganizationSchema } from '@/src/shared/lib/seo/generateStructuredData';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

export const metadata: Metadata = {
  title: 'Главная',
  description: 'Умная фриланс-биржа с ИИ-ассистентом. Найдите идеального исполнителя для вашего проекта или начните зарабатывать как фрилансер. Тысячи проектов и профессиональных исполнителей.',
  openGraph: {
    title: 'Modern Freelance - Умная фриланс-биржа с ИИ-ассистентом',
    description: 'Умная фриланс-биржа с ИИ-ассистентом. Найдите идеального исполнителя для вашего проекта или начните зарабатывать как фрилансер.',
    url: siteUrl,
    siteName: 'Modern Freelance',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Modern Freelance',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modern Freelance - Умная фриланс-биржа с ИИ-ассистентом',
    description: 'Умная фриланс-биржа с ИИ-ассистентом. Найдите идеального исполнителя для вашего проекта.',
    images: [`${siteUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Home() {
  const organizationSchema = generateOrganizationSchema({
    name: 'Modern Freelance',
    url: siteUrl,
    description: 'Умная фриланс-биржа с ИИ-ассистентом',
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      // Добавьте ссылки на социальные сети, если есть
    ],
  });

  const websiteSchema = generateFreelancePlatformSchema(siteUrl);

  return (
    <>
      <StructuredData data={[organizationSchema, websiteSchema]} />
      <main style={{ minHeight: '100vh' }}>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
    </>
  );
}

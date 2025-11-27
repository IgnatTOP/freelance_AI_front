import type { Metadata } from "next";
import { AntdProvider } from "@/src/app/providers";
import { AppShell } from "@/src/widgets/AppShell";
import {
  PageLoader,
  ScrollToTop,
  CursorTrail,
  AnimatedBackground,
  LenisScroll,
  ProgressBar,
  NavigationLoader,
} from "@/src/shared/ui";
import { OnboardingProvider } from "@/src/widgets/OnboardingProvider";
import { ToastProvider } from "@/src/shared/lib/toast/ToastProvider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
const siteName = "Modern Freelance";
const defaultDescription = "Умная фриланс-биржа с ИИ-ассистентом. Найдите идеального исполнителя для вашего проекта или начните зарабатывать как фрилансер.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Умная фриланс-биржа с ИИ-ассистентом`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "фриланс",
    "фрилансеры",
    "удаленная работа",
    "заказы",
    "проекты",
    "ИИ ассистент",
    "биржа фриланса",
    "найти исполнителя",
    "заработать онлайн",
    "удаленная работа",
    "фриланс платформа",
    "IT фриланс",
    "дизайн фриланс",
    "разработка",
  ],
  authors: [{ name: "Modern Freelance Team" }],
  creator: "Modern Freelance",
  publisher: "Modern Freelance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - Умная фриланс-биржа с ИИ-ассистентом`,
    description: defaultDescription,
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Умная фриланс-биржа с ИИ-ассистентом`,
    description: defaultDescription,
    images: [`${siteUrl}/og-image.jpg`],
    creator: "@modernfreelance",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  alternates: {
    canonical: siteUrl,
  },
  other: {
    "font-inter": "Inter",
    "font-display": "Space Grotesk",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark lenis">
      <body className="antialiased">
        <PageLoader />
        <NavigationLoader />
        <AnimatedBackground />
        <CursorTrail />
        <LenisScroll />
        <ProgressBar />
        <AntdProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
            <ScrollToTop />
            <OnboardingProvider />
          </ToastProvider>
        </AntdProvider>
      </body>
    </html>
  );
}

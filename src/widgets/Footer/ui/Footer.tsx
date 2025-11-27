import Link from 'next/link';
import { Container } from '@/src/shared/ui/Container';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  product: [
    { href: '#features', label: 'Возможности' },
    { href: '#pricing', label: 'Тарифы' },
    { href: '/blog', label: 'Блог' },
    { href: '/about', label: 'О нас' },
  ],
  support: [
    { href: '/help', label: 'Справка' },
    { href: '/docs', label: 'Документация' },
    { href: '/contact', label: 'Контакты' },
    { href: '/status', label: 'Статус' },
  ],
  legal: [
    { href: '/privacy', label: 'Конфиденциальность' },
    { href: '/terms', label: 'Условия использования' },
    { href: '/cookies', label: 'Cookies' },
    { href: '/license', label: 'Лицензия' },
  ],
};

const socialLinks = [
  { href: 'https://github.com', icon: Github, label: 'GitHub' },
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
  { href: 'mailto:info@example.com', icon: Mail, label: 'Email' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-background-secondary">
      <Container>
        <div className="py-12 lg:py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center space-x-2 group mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl font-bold gradient-text">M</span>
                </div>
                <span className="text-xl font-bold text-foreground">Modern</span>
              </Link>
              <p className="text-foreground-secondary text-sm leading-relaxed">
                Создаем инновационные решения для вашего бизнеса
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-foreground font-semibold mb-4">Продукт</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-foreground-secondary hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-foreground font-semibold mb-4">Поддержка</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-foreground-secondary hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-foreground font-semibold mb-4">Правовая информация</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-foreground-secondary hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-foreground-tertiary text-sm">
              © {currentYear} Modern. Все права защищены.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-background-elevated hover:bg-primary/10 flex items-center justify-center text-foreground-secondary hover:text-primary transition-all"
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

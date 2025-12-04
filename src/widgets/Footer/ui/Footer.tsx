import Link from "next/link";
import { Container } from "@/src/shared/ui/Container";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  product: [
    { href: "#features", label: "Возможности" },
    { href: "#pricing", label: "Тарифы" },
    { href: "/blog", label: "Блог" },
    { href: "/about", label: "О нас" },
  ],
  legal: [
    { href: "/privacy", label: "Конфиденциальность" },
    { href: "/terms", label: "Условия использования" },
  ],
};

const socialLinks = [
  { href: "https://github.com", icon: Github, label: "GitHub" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
  { href: "mailto:info@example.com", icon: Mail, label: "Email" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background-secondary">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="sm:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4 no-underline">
                <div className="w-10 h-10 rounded-xl bg-primary-10 flex items-center justify-center">
                  <span className="text-2xl font-bold gradient-text">M</span>
                </div>
                <span className="text-xl font-bold text-foreground">Modern</span>
              </Link>
              <p className="text-foreground-secondary text-sm leading-relaxed max-w-xs">
                Создаем инновационные решения для вашего бизнеса
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-4">Продукт</h3>
              <ul className="list-none p-0 m-0 space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-foreground-secondary text-sm no-underline hover:text-primary transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-4">Правовая информация</h3>
              <ul className="list-none p-0 m-0 space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-foreground-secondary text-sm no-underline hover:text-primary transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-foreground-tertiary text-sm text-center sm:text-left">© {currentYear} Modern. Все права защищены.</p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-background-elevated flex items-center justify-center text-foreground-secondary hover:text-primary hover:bg-primary-10 transition-colors" aria-label={social.label}>
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

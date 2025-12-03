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
  support: [
    { href: "/help", label: "Справка" },
    { href: "/docs", label: "Документация" },
    { href: "/contact", label: "Контакты" },
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
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--background-secondary)" }}>
      <Container>
        <div style={{ padding: "48px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, marginBottom: 48 }}>
            <div style={{ gridColumn: "span 2" }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, textDecoration: "none" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--primary-10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 24, fontWeight: 700, background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>M</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>Modern</span>
              </Link>
              <p style={{ color: "var(--foreground-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                Создаем инновационные решения для вашего бизнеса
              </p>
            </div>

            <div>
              <h3 style={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 16 }}>Продукт</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {footerLinks.product.map((link) => (
                  <li key={link.href} style={{ marginBottom: 8 }}>
                    <Link href={link.href} style={{ color: "var(--foreground-secondary)", fontSize: 14, textDecoration: "none" }}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 16 }}>Правовая информация</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {footerLinks.legal.map((link) => (
                  <li key={link.href} style={{ marginBottom: 8 }}>
                    <Link href={link.href} style={{ color: "var(--foreground-secondary)", fontSize: 14, textDecoration: "none" }}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "var(--foreground-tertiary)", fontSize: 14 }}>© {currentYear} Modern. Все права защищены.</p>
            <div style={{ display: "flex", gap: 16 }}>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: 8, background: "var(--background-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-secondary)" }} aria-label={social.label}>
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

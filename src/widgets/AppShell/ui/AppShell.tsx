"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/src/widgets/Header";
import { DashboardHeader } from "@/src/widgets/DashboardHeader";
import { Footer } from "@/src/widgets/Footer";
import { DashboardLayout } from "@/src/widgets/DashboardLayout";
import { isDashboardRoute, isAuthRoute } from "@/src/shared/config/routes";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const isDashboard = isDashboardRoute(pathname);
  const isAuth = isAuthRoute(pathname);

  // Определяем, показывать ли footer
  const showFooter = !isDashboard && !isAuth;

  // Рендерим header
  const renderHeader = () => {
    if (isAuth) return null;
    return isDashboard ? <DashboardHeader /> : <Header />;
  };

  // Рендерим контент с layout
  const renderContent = () => {
    if (isDashboard) {
      return <DashboardLayout>{children}</DashboardLayout>;
    }

    const mainClassName = isAuth ? "" : "pt-4 lg:pt-24";
    return <main className={mainClassName}>{children}</main>;
  };

  return (
    <>
      {renderHeader()}
      {renderContent()}
      {showFooter && <Footer />}
    </>
  );
}

"use client";

import Link from "next/link";
import { Box, Typography, Grid, Stack, Button, Container } from "@mui/material";
import { useAuth } from "@/src/shared/lib/hooks";
import { Clock, CheckCircle2, Wallet, Zap, Target, Rocket, MessageSquare, FileText, Users, FolderKanban, Briefcase } from "lucide-react";
import { ActivityWidget } from "@/src/widgets/Dashboard/ActivityWidget";
import { ProjectsCards } from "@/src/widgets/Dashboard/ProjectsCards";
import { AIHub } from "@/src/widgets/Dashboard/AIHub";
import { DashboardProvider, useDashboard } from "@/src/features/dashboard/context";
import { StyledCard, StatCard, ActionCard, LoadingState, SectionHeader } from "@/src/shared/ui";
import { iconSize } from "@/src/shared/lib/constants/design";

type DashboardRole = "client" | "freelancer";

const quickActionsConfig: Record<DashboardRole, Array<{ icon: typeof Rocket; title: string; href: string }>> = {
  client: [
    { icon: Rocket, title: "Создать заказ", href: "/orders/create" },
    { icon: FileText, title: "Мои заказы", href: "/my-orders" },
    { icon: Users, title: "Фрилансеры", href: "/freelancers" },
    { icon: MessageSquare, title: "Сообщения", href: "/messages" },
  ],
  freelancer: [
    { icon: Target, title: "Найти заказы", href: "/orders" },
    { icon: FileText, title: "Мои отклики", href: "/proposals" },
    { icon: FolderKanban, title: "Мои проекты", href: "/orders/in-progress" },
    { icon: MessageSquare, title: "Сообщения", href: "/messages" },
  ],
};

function DashboardContent() {
  const { user, profile, userRole: rawUserRole, loading: authLoading } = useAuth();
  const { data, loading } = useDashboard();

  const userRole: DashboardRole = rawUserRole === "admin" || rawUserRole === "client" ? "client" : "freelancer";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Доброе утро";
    if (hour < 18) return "Добрый день";
    return "Добрый вечер";
  };

  if (authLoading || loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, md: 3 } }}>
        <LoadingState type="page" />
      </Container>
    );
  }

  if (!data) return null;

  const stats = userRole === "client"
    ? [
        { label: "Всего заказов", value: data.stats.orders.total, icon: Briefcase },
        { label: "В работе", value: data.stats.orders.in_progress, icon: Clock },
        { label: "Завершено", value: data.stats.orders.completed, icon: CheckCircle2 },
        { label: "Потрачено", value: data.stats.balance > 0 ? `${(data.stats.balance / 1000).toFixed(0)}K ₽` : "0 ₽", icon: Wallet },
      ]
    : [
        { label: "Откликов", value: data.stats.proposals.total, icon: FileText },
        { label: "Ожидают", value: data.stats.proposals.pending, icon: Clock },
        { label: "Принято", value: data.stats.proposals.accepted, icon: CheckCircle2 },
        { label: "Заработано", value: data.stats.balance > 0 ? `${(data.stats.balance / 1000).toFixed(0)}K ₽` : "0 ₽", icon: Wallet },
      ];

  const quickActions = quickActionsConfig[userRole];

  return (
    <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        {/* Welcome Card */}
        <StyledCard>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
            <Box>
              <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 13 }}>
                {getGreeting()}, {profile?.display_name || user?.username}!
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--text)", mt: 0.5 }}>
                {userRole === "client" ? "Управляйте проектами" : "Найдите новые проекты"}
              </Typography>
            </Box>
            <Link href={quickActions[0].href} style={{ textDecoration: "none" }}>
              {(() => {
                const Icon = quickActions[0].icon;
                return (
                  <Button variant="contained" startIcon={<Icon size={iconSize.lg} />} sx={{ px: 2.5, py: 1.5 }}>
                    {quickActions[0].title}
                  </Button>
                );
              })()}
            </Link>
          </Stack>
        </StyledCard>

        {/* Stats Grid */}
        <Grid container spacing={2}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <StatCard icon={stat.icon} label={stat.label} value={stat.value} />
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              {/* Quick Actions */}
              <StyledCard>
                <SectionHeader icon={Zap} title="Быстрые действия" />
                <Grid container spacing={1.5} sx={{ mt: 2 }}>
                  {quickActions.slice(1).map((action) => (
                    <Grid size={{ xs: 6, sm: 4 }} key={action.href}>
                      <ActionCard icon={action.icon} title={action.title} href={action.href} />
                    </Grid>
                  ))}
                </Grid>
              </StyledCard>

              <ActivityWidget userRole={userRole} />
              <ProjectsCards userRole={userRole} />
            </Stack>
          </Grid>

          {/* Right Column - AI Hub */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <AIHub userRole={userRole} />
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

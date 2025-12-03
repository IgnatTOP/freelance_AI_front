"use client";

import { Card, CardContent, Stack, Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Plus, Search, MessageSquare, FileText, Sparkles, Bot } from "lucide-react";
import Link from "next/link";
import { QuickCreateOrder } from "../../QuickCreateOrder";

interface QuickActionsProps {
  userRole: "client" | "freelancer" | null;
}

const clientActions = [
  { title: "Создать заказ", description: "Опубликуйте проект", icon: Plus, href: "/orders/create", primary: true },
  { title: "AI генератор", description: "Описание с AI", icon: Sparkles, href: "/orders/create?ai=true" },
  { title: "Фрилансеры", description: "Найти исполнителей", icon: Search, href: "/freelancers" },
  { title: "Сообщения", description: "Чаты", icon: MessageSquare, href: "/messages" },
];

const freelancerActions = [
  { title: "Найти заказы", description: "Активные проекты", icon: Search, href: "/orders", primary: true },
  { title: "AI рекомендации", description: "Подходящие заказы", icon: Bot, href: "/orders?ai-recommended=true" },
  { title: "Мои отклики", description: "Предложения", icon: FileText, href: "/proposals" },
  { title: "Сообщения", description: "Чаты", icon: MessageSquare, href: "/messages" },
];

export function QuickActions({ userRole }: QuickActionsProps) {
  const actions = userRole === "client" ? clientActions : freelancerActions;

  return (
    <Card sx={{ background: "var(--primary-05)", border: "1px solid var(--primary-15)" }}>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={1.5} wrap="nowrap" sx={{ overflowX: "auto" }}>
          {userRole === "client" && (
            <Grid>
              <QuickCreateOrder userRole={userRole} />
            </Grid>
          )}

          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Grid key={action.title}>
                <Link href={action.href} style={{ textDecoration: "none" }}>
                  <Card sx={{
                    minWidth: 120,
                    cursor: "pointer",
                    border: action.primary ? "1px solid var(--primary-30)" : "1px solid var(--border)",
                    bgcolor: action.primary ? "var(--primary-10)" : "transparent",
                    "&:hover": { borderColor: "var(--primary)", boxShadow: "var(--shadow-md)" },
                    transition: "all 0.2s"
                  }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Stack alignItems="center" spacing={1} textAlign="center">
                        <Icon size={18} style={{ color: action.primary ? "var(--primary)" : "var(--foreground)" }} />
                        <Box>
                          <Typography variant="caption" fontWeight={600} sx={{ display: "block" }}>{action.title}</Typography>
                          <Typography variant="caption" sx={{ color: "var(--foreground-muted)", fontSize: 10 }}>{action.description}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}

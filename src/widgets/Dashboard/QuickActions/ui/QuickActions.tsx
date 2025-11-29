"use client";

import { Card, CardContent, Button, Stack, Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import {
  Plus,
  Search,
  MessageSquare,
  FileText,
  Sparkles,
  Bot,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { QuickCreateOrder } from "../../QuickCreateOrder";

interface QuickActionsProps {
  userRole: "client" | "freelancer" | null;
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const clientActions = [
    {
      title: "Создать заказ",
      description: "Опубликуйте новый проект",
      icon: Plus,
      href: "/orders/create",
      color: "bg-primary/10 text-primary hover:bg-primary/20",
      primary: true,
    },
    {
      title: "AI генератор ТЗ",
      description: "Сгенерируйте описание с помощью AI",
      icon: Sparkles,
      href: "/orders/create?ai=true",
      color: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
    },
    {
      title: "Найти фрилансеров",
      description: "Подходящие исполнители",
      icon: Search,
      href: "/freelancers",
      color: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
    },
    {
      title: "Сообщения",
      description: "Чаты с фрилансерами",
      icon: MessageSquare,
      href: "/messages",
      color: "bg-green-500/10 text-green-400 hover:bg-green-500/20",
    },
  ];

  const freelancerActions = [
    {
      title: "Найти заказы",
      description: "Просмотр активных проектов",
      icon: Search,
      href: "/orders",
      color: "bg-primary/10 text-primary hover:bg-primary/20",
      primary: true,
    },
    {
      title: "AI рекомендации",
      description: "Подходящие заказы для вас",
      icon: Bot,
      href: "/orders?ai-recommended=true",
      color: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
    },
    {
      title: "Мои отклики",
      description: "Управление предложениями",
      icon: FileText,
      href: "/proposals",
      color: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
    },
    {
      title: "Сообщения",
      description: "Чаты с заказчиками",
      icon: MessageSquare,
      href: "/messages",
      color: "bg-green-500/10 text-green-400 hover:bg-green-500/20",
    },
  ];

  const actions = userRole === "client" ? clientActions : freelancerActions;
  const theme = useTheme();

  return (
    <Card
      sx={{
        background: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.05)' : 'rgba(24, 144, 255, 0.03)',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.12)' : 'rgba(24, 144, 255, 0.08)',
        borderWidth: 1,
        borderStyle: 'solid',
      }}
    >
      <CardContent>
        <Grid container spacing={2} wrap="nowrap" sx={{ overflowX: 'auto' }}>
          {/* Quick Create Order для клиентов - первая карточка */}
          {userRole === "client" && (
            <Grid>
              <QuickCreateOrder userRole={userRole} />
            </Grid>
          )}

          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Grid key={action.title}>
                <Link href={action.href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      sx={{
                        minWidth: 140,
                        background: action.primary
                          ? theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.08)' : 'rgba(24, 144, 255, 0.05)'
                          : 'transparent',
                        borderColor: action.primary
                          ? theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.25)' : 'rgba(24, 144, 255, 0.15)'
                          : theme.palette.divider,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <CardContent>
                        <Stack direction="column" alignItems="center" spacing={1} sx={{ textAlign: 'center' }}>
                          <Icon size={20} style={{ color: action.primary ? theme.palette.primary.main : theme.palette.text.primary }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '14px' }}>
                              {action.title}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '12px', opacity: 0.7, mt: 0.5, display: 'block' }}>
                              {action.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}

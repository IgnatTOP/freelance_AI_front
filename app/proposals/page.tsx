"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Card,
  Typography,
  Stack,
  Chip,
  Button,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, Hourglass, ArrowRight } from "lucide-react";
import { getMyProposals } from "@/src/shared/api/proposals";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import Link from "next/link";
import { formatPriceRange } from "@/src/shared/lib/utils";
import type { Proposal } from "@/src/shared/api/proposals";

const statusConfig = {
  pending: { label: "Ожидает", color: "info" as const, icon: Hourglass },
  shortlisted: { label: "В шорт-листе", color: "warning" as const, icon: Clock },
  accepted: { label: "Принято", color: "success" as const, icon: CheckCircle },
  rejected: { label: "Отклонено", color: "error" as const, icon: XCircle },
};

export default function ProposalsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }

    const user = authService.getCurrentUser();
    if (user?.role !== "freelancer") {
      toastService.error("Только фрилансеры могут просматривать отклики");
      router.push("/dashboard");
      return;
    }

    loadProposals();
  }, [router]);

  // Подписка на WebSocket события для обновления в реальном времени
  useEffect(() => {
    if (!authService.isAuthenticated()) return;

    // Подключаемся к WebSocket
    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
      } catch (error) {
        // Silently handle connection errors
      }
    };

    connectWebSocket();

    // Подписываемся на обновления предложений
    const unsubscribeProposals = websocketService.on("proposals.updated", (wsMessage) => {
      const data = wsMessage.data;
      
      // Если это обновление нашего предложения, перезагружаем данные
      if (data.proposal) {
        loadProposals();
      }
    });

    // Подписываемся на изменения подключения
    const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
      if (connected) {
        // При переподключении перезагружаем данные
        loadProposals();
      }
    });

    return () => {
      unsubscribeProposals();
      unsubscribeConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await getMyProposals();
      setProposals(data);
    } catch (error: any) {
      console.error("Error loading proposals:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки откликов");
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "только что";
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ч назад`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "вчера";
    if (diffInDays < 7) return `${diffInDays} дн назад`;

    return formatDate(dateString);
  };

  const groupedProposals = {
    pending: proposals.filter((p) => p.status === "pending"),
    shortlisted: proposals.filter((p) => p.status === "shortlisted"),
    accepted: proposals.filter((p) => p.status === "accepted"),
    rejected: proposals.filter((p) => p.status === "rejected"),
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "transparent" }}>
      <Container maxWidth="lg">
        <Box sx={{ minHeight: "100vh", py: 5 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Stack spacing={4}>
              {/* Header */}
              <Box>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  Мои отклики
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Управляйте своими предложениями и отслеживайте их статус
                </Typography>
              </Box>

              {/* Stats */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      Всего
                    </Typography>
                    <Typography variant="h4" component="div">
                      {proposals.length}
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      Ожидают
                    </Typography>
                    <Typography variant="h4" component="div" color="info.main">
                      {groupedProposals.pending.length}
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      Принято
                    </Typography>
                    <Typography variant="h4" component="div" color="success.main">
                      {groupedProposals.accepted.length}
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      Отклонено
                    </Typography>
                    <Typography variant="h4" component="div" color="error.main">
                      {groupedProposals.rejected.length}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Proposals List */}
              {loading ? (
                <Stack spacing={2}>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} sx={{ p: 2 }}>
                      <Skeleton variant="text" width="60%" height={32} />
                      <Skeleton variant="text" width="100%" />
                      <Skeleton variant="text" width="100%" />
                      <Skeleton variant="text" width="80%" />
                    </Card>
                  ))}
                </Stack>
              ) : proposals.length === 0 ? (
                <Card
                  sx={{
                    textAlign: "center",
                    py: 10,
                    px: 3,
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        У вас пока нет откликов
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Найдите подходящие заказы и отправьте свой первый отклик
                      </Typography>
                    </Box>
                    <Link href="/orders" style={{ textDecoration: "none" }}>
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowRight size={16} />}
                      >
                        Найти заказы
                      </Button>
                    </Link>
                  </Stack>
                </Card>
              ) : (
                <Stack spacing={2}>
                  {proposals.map((proposal) => {
                    const statusInfo = statusConfig[proposal.status];
                    const StatusIcon = statusInfo.icon;

                    return (
                      <motion.div
                        key={proposal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          sx={{
                            transition: "all 0.2s",
                            "&:hover": {
                              boxShadow: 4,
                            },
                          }}
                        >
                          <Stack spacing={2} p={2}>
                            {/* Header */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: 2,
                              }}
                            >
                              <Stack spacing={1} sx={{ flex: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                  <FileText size={20} style={{ color: theme.palette.primary.main }} />
                                  <Link
                                    href={`/orders/${proposal.order_id}`}
                                    style={{ textDecoration: "none" }}
                                  >
                                    <Typography
                                      variant="body1"
                                      fontWeight={600}
                                      sx={{
                                        cursor: "pointer",
                                        color: "primary.main",
                                        "&:hover": {
                                          textDecoration: "underline",
                                        },
                                      }}
                                    >
                                      Заказ #{proposal.order_id.slice(0, 8)}
                                    </Typography>
                                  </Link>
                                </Box>
                                <Chip
                                  label={statusInfo.label}
                                  color={statusInfo.color}
                                  icon={<StatusIcon size={14} />}
                                  size="small"
                                  sx={{ alignSelf: "flex-start" }}
                                />
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(proposal.created_at)}
                              </Typography>
                            </Box>

                            {/* Cover Letter */}
                            <Typography
                              variant="body2"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {proposal.cover_letter}
                            </Typography>

                            {/* Footer */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                pt: 1.5,
                                borderTop: 1,
                                borderColor: "divider",
                                flexWrap: "wrap",
                                gap: 1,
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                {proposal.proposed_amount && (
                                  <Typography variant="body2" fontWeight={600}>
                                    {formatPriceRange(proposal.proposed_amount, proposal.proposed_amount)}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(proposal.created_at)}
                                </Typography>
                              </Stack>
                              <Link
                                href={`/orders/${proposal.order_id}`}
                                style={{ textDecoration: "none" }}
                              >
                                <Button
                                  variant="text"
                                  endIcon={<ArrowRight size={14} />}
                                  size="small"
                                >
                                  Перейти к заказу
                                </Button>
                              </Link>
                            </Box>

                            {/* AI Feedback */}
                            {proposal.ai_feedback && (
                              <Card
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  borderColor: alpha(theme.palette.primary.main, 0.2),
                                  p: 1.5,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontStyle: "italic" }}
                                >
                                  <strong>AI рекомендация:</strong> {proposal.ai_feedback}
                                </Typography>
                              </Card>
                            )}
                          </Stack>
                        </Card>
                      </motion.div>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}


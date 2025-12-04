"use client";

import { Button, Stack, Typography, Box, Chip, LinearProgress, Grid } from "@mui/material";
import { Briefcase, Clock, Wallet, ArrowRight, Calendar, User } from "lucide-react";
import { formatDate } from "@/src/shared/lib/utils/date-utils";
import Link from "next/link";
import { formatPriceRange } from "@/src/shared/lib/utils";
import { useDashboardData } from "@/src/features/dashboard/context";
import { StyledCard, SectionHeader, IconBox, MetaItem, LoadingState } from "@/src/shared/ui";
import { orderStatusConfig } from "@/src/shared/lib/constants/design";

interface ProjectsCardsProps {
  userRole: "client" | "freelancer" | null;
}

export function ProjectsCards({ userRole }: ProjectsCardsProps) {
  const { data, loading } = useDashboardData();
  const orders = data?.recent_orders?.slice(0, 3) || [];

  const title = userRole === "client" ? "Мои проекты" : "Доступные заказы";

  if (loading) {
    return (
      <StyledCard>
        <SectionHeader icon={Briefcase} title={title} />
        <Box sx={{ mt: 2 }}>
          <LoadingState type="list" count={2} height={100} />
        </Box>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <SectionHeader
        icon={Briefcase}
        title={title}
        action={
          <Link href="/orders" style={{ textDecoration: "none" }}>
            <Button size="small" endIcon={<ArrowRight size={14} />} sx={{ fontSize: 13 }}>
              Все
            </Button>
          </Link>
        }
      />

      {orders.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 13 }}>
            {userRole === "client" ? "Нет проектов" : "Нет доступных заказов"}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {orders.map((order) => {
            const statusInfo = orderStatusConfig[order.status as keyof typeof orderStatusConfig] || orderStatusConfig.draft;
            const progress = order.status === "in_progress" ? 50 : order.status === "completed" ? 100 : 0;

            return (
              <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: "none" }}>
                <StyledCard interactive>
                  <Stack spacing={1.5}>
                    {/* Header */}
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <IconBox icon={Briefcase} size="lg" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
                          {order.title}
                        </Typography>
                        <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ mt: 0.5, height: 20, fontSize: 11 }} />
                      </Box>
                    </Stack>

                    {/* Description */}
                    {order.ai_summary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "var(--text-muted)",
                          fontSize: 13,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {order.ai_summary}
                      </Typography>
                    )}

                    {/* Progress */}
                    {progress > 0 && (
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 11 }}>
                            Прогресс
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>
                            {progress}%
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 2 }} />
                      </Box>
                    )}

                    {/* Meta */}
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <MetaItem icon={Wallet}>{formatPriceRange(order.budget_min, order.budget_max)}</MetaItem>
                      </Grid>
                      {order.deadline_at && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <MetaItem icon={Calendar}>{formatDate(order.deadline_at)}</MetaItem>
                        </Grid>
                      )}
                      {order.proposals_count !== undefined && order.proposals_count > 0 && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <MetaItem icon={User}>{order.proposals_count} откликов</MetaItem>
                        </Grid>
                      )}
                    </Grid>

                    {/* Footer */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1.5, borderTop: "1px solid var(--border)" }}>
                      <MetaItem icon={Clock}>{formatDate(order.created_at)}</MetaItem>
                    </Stack>
                  </Stack>
                </StyledCard>
              </Link>
            );
          })}
        </Stack>
      )}
    </StyledCard>
  );
}

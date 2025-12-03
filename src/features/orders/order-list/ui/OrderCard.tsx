"use client";

import Link from "next/link";
import { Typography, Stack, Box, Chip } from "@mui/material";
import { Clock, Wallet, Users, Sparkles, Calendar } from "lucide-react";
import { StyledCard, StatusChip, MetaItem } from "@/src/shared/ui";
import { formatPriceRange } from "@/src/shared/lib/utils";
import { formatTimeAgo } from "@/src/shared/lib/utils/date-utils";
import type { Order } from "@/src/entities/order/model/types";

interface OrderCardProps {
  order: Order;
  userRole?: "client" | "freelancer" | null;
  aiScore?: number;
  aiReason?: string;
  showStatus?: boolean;
}

export function OrderCard({ order, userRole, aiScore, aiReason, showStatus = false }: OrderCardProps) {
  const hasAI = aiScore !== undefined && aiScore > 0;
  const matchPercent = hasAI ? Math.min(Math.round((aiScore / 10) * 100), 100) : 0;

  return (
    <Link href={`/orders/${order.id}`} style={{ textDecoration: "none" }}>
      <StyledCard
        interactive
        sx={{
          height: "100%",
          borderColor: hasAI ? "var(--primary-20)" : undefined,
          bgcolor: hasAI ? "var(--primary-5)" : undefined,
        }}
      >
        <Stack spacing={2}>
          {/* Header */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  flex: 1,
                }}
              >
                {order.title}
              </Typography>
              {hasAI && (
                <Chip
                  size="small"
                  icon={<Sparkles size={12} />}
                  label={`${matchPercent}%`}
                  color="primary"
                  sx={{ fontWeight: 600, minWidth: 60 }}
                />
              )}
            </Stack>
            {showStatus && order.status && (
              <Box sx={{ mt: 1 }}>
                <StatusChip status={order.status} type="order" />
              </Box>
            )}
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: "var(--text-muted)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 40,
            }}
          >
            {order.ai_summary || order.description || "Без описания"}
          </Typography>

          {/* AI Reason */}
          {hasAI && aiReason && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: "var(--primary-10)",
                border: "1px solid var(--primary-20)",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Sparkles size={14} style={{ color: "var(--primary)", marginTop: 2, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: "var(--primary)", lineHeight: 1.4 }}>
                  {aiReason.length > 100 ? aiReason.slice(0, 100) + "..." : aiReason}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Meta */}
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <MetaItem icon={Wallet} size="md">{formatPriceRange(order.budget_min, order.budget_max)}</MetaItem>
            
            {order.deadline_at && (
              <MetaItem icon={Calendar} size="md">до {new Date(order.deadline_at).toLocaleDateString("ru-RU")}</MetaItem>
            )}

            {order.proposals_count !== undefined && order.proposals_count > 0 && (
              <MetaItem icon={Users} size="md">{order.proposals_count} откликов</MetaItem>
            )}
          </Stack>

          {/* Footer */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1, borderTop: "1px solid var(--border)" }}>
            <MetaItem icon={Clock}>{formatTimeAgo(order.created_at)}</MetaItem>
            
            {order.requirements && order.requirements.length > 0 && (
              <Stack direction="row" spacing={0.5}>
                {order.requirements.slice(0, 2).map((req) => (
                  <Chip key={req.skill} label={req.skill} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                ))}
                {order.requirements.length > 2 && (
                  <Chip label={`+${order.requirements.length - 2}`} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                )}
              </Stack>
            )}
          </Stack>
        </Stack>
      </StyledCard>
    </Link>
  );
}

"use client";

import { Card, CardContent, Chip, Box, Typography, LinearProgress, Stack } from "@mui/material";
import { Calendar, DollarSign, Clock, Code, MessageSquare, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import type { Order } from "@/src/entities/order/model/types";
import { formatPriceRange } from "@/src/shared/lib/utils";
import { getOrderStatusColor, getOrderStatusLabel } from "@/src/shared/lib/order-utils";
import { authService } from "@/src/shared/lib/auth/auth.service";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";

dayjs.extend(relativeTime);
dayjs.locale("ru");

interface OrderCardProps {
  order: Order;
  matchScore?: number;
  matchExplanation?: string;
}

const statusColorMap: Record<string, string> = {
  open: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
  pending: 'default',
};

export function OrderCard({ order, matchScore, matchExplanation }: OrderCardProps) {
  const theme = useTheme();
  const currentUser = authService.getCurrentUser();
  const isMyOrder = currentUser && String(order.client_id) === String(currentUser.id);

  const handleCardClick = () => {
    window.location.href = `/orders/${order.id}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={handleCardClick}
        sx={{
          borderRadius: 2,
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: 4,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Header: Title + Status */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
              <Box flex={1} minWidth={0}>
                {isMyOrder && (
                  <Chip
                    icon={<User size={12} />}
                    label="Мой заказ"
                    size="small"
                    color="info"
                    sx={{ mb: 0.5, height: 20, fontSize: '0.6875rem' }}
                  />
                )}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    transition: "color 0.2s",
                    "&:hover": {
                      color: theme.palette.primary.main,
                    }
                  }}
                >
                  {order.title}
                </Typography>

                {/* Match Score */}
                {matchScore !== undefined && matchScore >= 0 && (
                  <Stack spacing={0.5} mt={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Sparkles size={14} color={theme.palette.primary.main} />
                      <Typography variant="caption" color="primary" fontWeight={600}>
                        Совместимость: {Math.round(matchScore * 10)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.round(matchScore * 10)}
                        sx={{
                          flex: 1,
                          maxWidth: 120,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: theme.palette.action.hover,
                        }}
                      />
                    </Box>
                    {matchExplanation && (
                      <Typography variant="caption" color="text.secondary" fontStyle="italic">
                        {matchExplanation}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>

              <Chip
                label={getOrderStatusLabel(order.status)}
                size="small"
                color={statusColorMap[order.status] as any || 'default'}
                sx={{ flexShrink: 0 }}
              />
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {order.description}
            </Typography>

            {/* Meta Info */}
            <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
              {order.budget_min && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <DollarSign size={15} color={theme.palette.success.main} />
                  <Typography variant="caption" fontWeight={500}>
                    {formatPriceRange(order.budget_min, order.budget_max)}
                  </Typography>
                </Box>
              )}

              {order.deadline_at && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Calendar size={15} color={theme.palette.warning.main} />
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(order.deadline_at).format("DD MMM YYYY")}
                  </Typography>
                </Box>
              )}

              <Box display="flex" alignItems="center" gap={0.5}>
                <Clock size={15} color={theme.palette.text.disabled} />
                <Typography variant="caption" color="text.secondary">
                  {dayjs(order.created_at).fromNow()}
                </Typography>
              </Box>

              {order.proposals_count !== undefined && order.proposals_count > 0 && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <MessageSquare size={15} color={theme.palette.info.main} />
                  <Typography variant="caption" color="text.secondary">
                    {order.proposals_count}{" "}
                    {order.proposals_count === 1
                      ? "отклик"
                      : order.proposals_count < 5
                      ? "отклика"
                      : "откликов"}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Skills */}
            {order.requirements && order.requirements.length > 0 && (
              <Box
                display="flex"
                flexWrap="wrap"
                gap={1}
                pt={1}
                borderTop={1}
                borderColor="divider"
              >
                {order.requirements.slice(0, 8).map((req, idx) => (
                  <Chip
                    key={idx}
                    icon={<Code size={11} />}
                    label={req.skill}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ height: 24, fontSize: '0.6875rem' }}
                  />
                ))}
                {order.requirements.length > 8 && (
                  <Chip
                    label={`+${order.requirements.length - 8}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 24, fontSize: '0.6875rem' }}
                  />
                )}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}

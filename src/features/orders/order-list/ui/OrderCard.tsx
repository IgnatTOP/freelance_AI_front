"use client";

import { Card, CardContent, Chip, Box, Typography, LinearProgress } from "@mui/material";
import { Tag, Typography as AntTypography, Progress, theme as antTheme } from "antd";
import { Calendar, RussianRuble, Clock, Code, MessageSquare, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import type { Order } from "@/src/entities/order/model/types";
import { formatPriceRange } from "@/src/shared/lib/utils";
import { getOrderStatusColor, getOrderStatusLabel } from "@/src/shared/lib/order-utils";
import { authService } from "@/src/shared/lib/auth/auth.service";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";

const { Title, Text } = AntTypography;
const { useToken } = antTheme;

dayjs.extend(relativeTime);
dayjs.locale("ru");

interface OrderCardProps {
  order: Order;
  matchScore?: number;
  matchExplanation?: string;
}

export function OrderCard({ order, matchScore, matchExplanation }: OrderCardProps) {
  const theme = useTheme();
  const { token } = useToken();
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
          borderRadius: 1,
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: 1,
          "&:hover": {
            boxShadow: 3,
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        <CardContent sx={{ padding: "20px 24px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25, width: "100%" }}>
          {/* Header: Title + Status */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                {isMyOrder && (
                  <Tag
                    color="blue"
                    icon={<User size={11} />}
                    style={{
                      margin: 0,
                      fontSize: 10,
                      lineHeight: "18px",
                      padding: "2px 8px",
                      borderRadius: token.borderRadiusSM,
                      fontWeight: 600,
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Мой заказ
                  </Tag>
                )}
              </div>
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: "26px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  color: token.colorTextHeading,
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = token.colorPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = token.colorTextHeading;
                }}
              >
                {order.title}
              </Title>
              {/* Match Score and Explanation */}
              {matchScore !== undefined && matchScore >= 0 && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Sparkles size={14} style={{ color: token.colorPrimary }} />
                    <Text strong style={{ fontSize: 13, color: token.colorPrimary }}>
                      Совместимость: {Math.round(matchScore * 10)}%
                    </Text>
                    <Progress
                      percent={Math.round(matchScore * 10)}
                      size="small"
                      strokeColor={matchScore >= 9 ? "#52c41a" : matchScore >= 8 ? "#1890ff" : "#faad14"}
                      showInfo={false}
                      style={{ flex: 1, maxWidth: 120 }}
                    />
                  </div>
                  {matchExplanation && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        lineHeight: "18px",
                        color: token.colorTextSecondary,
                        fontStyle: "italic",
                      }}
                    >
                      {matchExplanation}
                    </Text>
                  )}
                </div>
              )}
            </div>
            <Tag
              color={getOrderStatusColor(order.status)}
              style={{
                margin: 0,
                fontSize: 11,
                lineHeight: "20px",
                padding: "4px 10px",
                borderRadius: token.borderRadiusSM,
                flexShrink: 0,
                fontWeight: 500,
                border: "none",
              }}
            >
              {getOrderStatusLabel(order.status)}
            </Tag>
          </div>

          {/* Description */}
          <Text
            type="secondary"
            style={{
              fontSize: 14,
              lineHeight: "22px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: token.colorTextSecondary,
            }}
          >
            {order.description}
          </Text>

          {/* Meta Info: Budget, Deadline, Created, Proposals */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              alignItems: "center",
              paddingTop: 4,
            }}
          >
            {order.budget_min && (
              <div
                style={{
                  fontSize: 13,
                  lineHeight: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <RussianRuble
                  size={15}
                  style={{
                    color: token.colorSuccess,
                    flexShrink: 0,
                  }}
                />
                <Text
                  strong
                  style={{
                    fontSize: 13,
                    lineHeight: "20px",
                    color: token.colorText,
                    fontWeight: 500,
                  }}
                >
                  {formatPriceRange(order.budget_min, order.budget_max)}
                </Text>
              </div>
            )}
            {order.deadline_at && (
              <div
                style={{
                  fontSize: 13,
                  lineHeight: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Calendar
                  size={15}
                  style={{
                    color: token.colorWarning,
                    flexShrink: 0,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: "20px",
                    color: token.colorTextSecondary,
                  }}
                >
                  {dayjs(order.deadline_at).format("DD MMM YYYY")}
                </Text>
              </div>
            )}
            <div
              style={{
                fontSize: 13,
                lineHeight: "20px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Clock
                size={15}
                style={{
                  color: token.colorTextTertiary,
                  flexShrink: 0,
                }}
              />
              <Text
                style={{
                  fontSize: 13,
                  lineHeight: "20px",
                  color: token.colorTextSecondary,
                }}
              >
                {dayjs(order.created_at).fromNow()}
              </Text>
            </div>
            {order.proposals_count !== undefined && order.proposals_count > 0 && (
              <div
                style={{
                  fontSize: 13,
                  lineHeight: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MessageSquare
                  size={15}
                  style={{
                    color: token.colorInfo,
                    flexShrink: 0,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: "20px",
                    color: token.colorTextSecondary,
                  }}
                >
                  {order.proposals_count}{" "}
                  {order.proposals_count === 1
                    ? "отклик"
                    : order.proposals_count < 5
                    ? "отклика"
                    : "откликов"}
                </Text>
              </div>
            )}
          </div>

          {/* Skills */}
          {order.requirements && order.requirements.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                paddingTop: 16,
                borderTop: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              {order.requirements.slice(0, 8).map((req, idx) => (
                <Tag
                  key={idx}
                  color="processing"
                  style={{
                    margin: 0,
                    fontSize: 11,
                    lineHeight: "20px",
                    padding: "3px 10px",
                    borderRadius: token.borderRadiusSM,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontWeight: 500,
                    border: "none",
                  }}
                >
                  <Code size={11} style={{ flexShrink: 0 }} />
                  {req.skill}
                </Tag>
              ))}
              {order.requirements.length > 8 && (
                <Tag
                  style={{
                    margin: 0,
                    fontSize: 11,
                    lineHeight: "20px",
                    padding: "3px 10px",
                    borderRadius: token.borderRadiusSM,
                    background: token.colorBgTextHover,
                    borderColor: token.colorBorder,
                    color: token.colorTextSecondary,
                    fontWeight: 500,
                  }}
                >
                  +{order.requirements.length - 8}
                </Tag>
              )}
            </div>
          )}
        </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

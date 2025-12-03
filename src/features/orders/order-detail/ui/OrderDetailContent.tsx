"use client";

import { Card, Typography, Stack, Chip, Box } from "@mui/material";
import { Code, FileText, Sparkles } from "lucide-react";
import type { Order } from "@/src/entities/order/model/types";
import { getMediaUrl } from "@/src/shared/lib/api/axios";

interface OrderDetailContentProps {
  order: Order;
}

export function OrderDetailContent({ order }: OrderDetailContentProps) {
  return (
    <Stack spacing={3}>
      {/* Description */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Описание
        </Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
          {order.description}
        </Typography>
      </Card>

      {/* AI Summary */}
      {order.ai_summary && (
        <Card
          sx={{
            p: 3,
            bgcolor: 'primary.main',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Sparkles size={18} />
            <Typography variant="h6">AI Резюме</Typography>
          </Stack>
          <Typography variant="body2">
            {order.ai_summary}
          </Typography>
        </Card>
      )}

      {/* Requirements */}
      {order.requirements && order.requirements.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Code size={20} />
            <Typography variant="h6">Требуемые навыки</Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {order.requirements.map((req, idx) => (
              <Chip
                key={idx}
                label={
                  <>
                    {req.skill}
                    {req.level !== "middle" && (
                      <span style={{ marginLeft: 4, opacity: 0.7 }}>
                        ({req.level === "junior" ? "начинающий" : req.level === "senior" ? "опытный" : "средний"})
                      </span>
                    )}
                  </>
                }
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </Card>
      )}

      {/* Attachments */}
      {order.attachments && order.attachments.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <FileText size={20} />
            <Typography variant="h6">Прикрепленные файлы</Typography>
          </Stack>
          <Stack spacing={1}>
            {order.attachments.map((att) => {
              const fileUrlRaw = att.media?.url || att.media?.file_path;
              const filename = att.media?.filename || att.media?.file_path?.split("/").pop() || `Файл ${att.id.substring(0, 8)}`;
              const mediaUrl = fileUrlRaw ? getMediaUrl(fileUrlRaw) ?? undefined : undefined;
              return (
                <Box
                  key={att.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FileText size={16} color="currentColor" />
                    <Typography variant="body2">{filename}</Typography>
                  </Stack>
                  {mediaUrl && (
                    <Typography
                      component="a"
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Открыть
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}


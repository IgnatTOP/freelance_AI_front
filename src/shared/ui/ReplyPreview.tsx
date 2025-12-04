import { Box, Typography, IconButton, useTheme, alpha, Card } from "@mui/material";
import { X, Reply } from "lucide-react";
import { motion } from "framer-motion";
import type { Message } from "@/src/entities/conversation/model/types";

interface ReplyPreviewProps {
  message: Message;
  onCancel?: () => void;
  compact?: boolean;
}

export function ReplyPreview({ message, onCancel, compact = false }: ReplyPreviewProps) {
  const theme = useTheme();
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
      <Card
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          p: compact ? 1 : 2,
          borderRadius: 2,
          borderLeft: `3px solid ${theme.palette.primary.main}`,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        }}
      >
        <Reply size={18} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            Ответ на сообщение
          </Typography>
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {truncateText(message.content)}
          </Typography>
        </Box>
        {onCancel && (
          <IconButton size="small" onClick={onCancel}>
            <X size={16} />
          </IconButton>
        )}
      </Card>
  );
}

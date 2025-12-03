import { useState } from "react";
import { Box, Chip, IconButton, Popover, Typography, Tooltip, alpha, useTheme, Zoom } from "@mui/material";
import { Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MessageReaction } from "@/src/entities/conversation/model/types";

interface MessageReactionsProps {
  reactions: MessageReaction[];
  currentUserId: string | null;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: () => void;
  disabled?: boolean;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😊", "😂", "😮", "😢", "🎉", "🔥"];

export function MessageReactions({
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  disabled = false,
}: MessageReactionsProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePicker = () => {
    setAnchorEl(null);
  };

  const handleSelectEmoji = (emoji: string) => {
    onAddReaction(emoji);
    handleClosePicker();
  };

  // Группируем реакции по эмодзи
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  // Проверяем, есть ли реакция текущего пользователя
  const myReaction = reactions.find((r) => r.user_id === currentUserId);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", mt: 1 }}>
      <AnimatePresence>
        {/* Отображение существующих реакций */}
        {Object.entries(groupedReactions).map(([emoji, reactionsList]) => {
          const isMyReaction = reactionsList.some((r) => r.user_id === currentUserId);
          return (
            <motion.div
              key={emoji}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Tooltip
                title={reactionsList.map((r) => r.user_id).join(", ")}
                arrow
                TransitionComponent={Zoom}
              >
                <Chip
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <span style={{ fontSize: 14 }}>{emoji}</span>
                      {reactionsList.length > 1 && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            lineHeight: 1,
                          }}
                        >
                          {reactionsList.length}
                        </Typography>
                      )}
                    </Box>
                  }
                  size="small"
                  onClick={() => {
                    if (isMyReaction) {
                      onRemoveReaction();
                    } else {
                      onAddReaction(emoji);
                    }
                  }}
                  disabled={disabled}
                  sx={{
                    height: 28,
                    fontSize: 13,
                    cursor: "pointer",
                    borderRadius: 2,
                    px: 1,
                    bgcolor: isMyReaction
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.action.hover, 0.5),
                    border: `1.5px solid ${isMyReaction
                      ? alpha(theme.palette.primary.main, 0.3)
                      : alpha(theme.palette.divider, 0.1)
                    }`,
                    color: isMyReaction ? theme.palette.primary.main : theme.palette.text.primary,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: isMyReaction
                        ? alpha(theme.palette.primary.main, 0.25)
                        : alpha(theme.palette.action.hover, 0.8),
                      borderColor: isMyReaction
                        ? alpha(theme.palette.primary.main, 0.5)
                        : alpha(theme.palette.divider, 0.3),
                      transform: "scale(1.05)",
                    },
                  }}
                />
              </Tooltip>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Кнопка добавления реакции */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <IconButton
          size="small"
          onClick={handleOpenPicker}
          disabled={disabled}
          sx={{
            width: 28,
            height: 28,
            borderRadius: 2,
            opacity: 0.6,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            backgroundColor: alpha(theme.palette.action.hover, 0.3),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            "&:hover": {
              opacity: 1,
              backgroundColor: alpha(theme.palette.action.hover, 0.6),
              borderColor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          <Smile size={16} />
        </IconButton>
      </motion.div>

      {/* Popover с выбором эмодзи */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePicker}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          elevation: 12,
          sx: {
            borderRadius: 3,
            boxShadow: `0 12px 48px ${alpha('#000', 0.15)}, 0 4px 16px ${alpha('#000', 0.1)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 1.5, display: "flex", gap: 0.75 }}>
          {EMOJI_OPTIONS.map((emoji, index) => (
            <motion.div
              key={emoji}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <IconButton
                size="small"
                onClick={() => handleSelectEmoji(emoji)}
                sx={{
                  fontSize: 22,
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    transform: "scale(1.2)",
                  },
                }}
              >
                {emoji}
              </IconButton>
            </motion.div>
          ))}
        </Box>
      </Popover>
    </Box>
  );
}

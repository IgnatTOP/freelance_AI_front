import { Box, Typography, IconButton, alpha, useTheme, Zoom, Card } from "@mui/material";
import { Download, File, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { getMediaUrl } from "@/src/shared/lib/api/axios";
import type { MessageAttachment } from "@/src/entities/conversation/model/types";

interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
  compact?: boolean;
}

export function MessageAttachments({ attachments, compact = false }: MessageAttachmentsProps) {
  const theme = useTheme();
  if (!attachments || attachments.length === 0) return null;

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon size={16} />;
    return <File size={16} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
      {attachments.map((attachment, index) => {
        const isImage = attachment.media.file_type.startsWith("image/");
        const fileUrl = getMediaUrl(attachment.media.file_path) || "";

        if (isImage && !compact) {
          return (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                elevation={0}
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  maxWidth: "320px",
                  cursor: "pointer",
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: `0 8px 24px ${alpha('#000', 0.12)}`,
                  },
                }}
                onClick={() => window.open(fileUrl, "_blank")}
              >
                <Box
                  sx={{
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(to bottom, transparent 60%, ${alpha('#000', 0.4)})`,
                      opacity: 0,
                      transition: "opacity 0.3s",
                    },
                    "&:hover::after": {
                      opacity: 1,
                    },
                  }}
                >
                  <img
                    src={fileUrl}
                    alt="Attachment"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      opacity: 0,
                      transition: "opacity 0.3s",
                      ".MuiCard-root:hover &": {
                        opacity: 1,
                      },
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: alpha('#fff', 0.9),
                        backdropFilter: "blur(8px)",
                        "&:hover": {
                          backgroundColor: "#fff",
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(fileUrl, "_blank");
                      }}
                    >
                      <Download size={18} />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={attachment.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                bgcolor: alpha(theme.palette.action.hover, 0.5),
                borderRadius: 2,
                maxWidth: "320px",
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  transform: "translateX(4px)",
                },
              }}
              onClick={() => window.open(fileUrl, "_blank")}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: theme.palette.primary.main,
                  transition: "all 0.3s",
                  ".MuiCard-root:hover &": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    transform: "scale(1.1)",
                  },
                }}
              >
                {getFileIcon(attachment.media.file_type)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    mb: 0.25,
                  }}
                >
                  {attachment.media.file_path.split("/").pop()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    color: alpha(theme.palette.text.secondary, 0.7),
                    fontWeight: 500,
                  }}
                >
                  {formatFileSize(attachment.media.file_size)}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(fileUrl, "_blank");
                }}
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  transition: "all 0.3s",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    color: theme.palette.primary.main,
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Download size={18} />
              </IconButton>
            </Card>
          </motion.div>
        );
      })}
    </Box>
  );
}

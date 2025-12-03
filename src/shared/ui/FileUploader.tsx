import { useState, useRef } from "react";
import {
  Box,
  IconButton,
  Chip,
  CircularProgress,
  Typography,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { Paperclip, X, File, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadPhoto } from "@/src/shared/api/media";
import { toastService } from "@/src/shared/lib/toast";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
}

interface FileUploaderProps {
  onFilesChange: (fileIds: string[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export function FileUploader({
  onFilesChange,
  disabled = false,
  maxFiles = 5,
}: FileUploaderProps) {
  const theme = useTheme();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Проверка лимита файлов
    if (files.length + selectedFiles.length > maxFiles) {
      toastService.warning(`Максимум ${maxFiles} файлов`);
      return;
    }

    setUploading(true);
    const uploadedFiles: UploadedFile[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Проверка размера файла (макс 10 МБ)
        if (file.size > 10 * 1024 * 1024) {
          toastService.warning(`Файл ${file.name} слишком большой (макс 10 МБ)`);
          continue;
        }

        try {
          const response = await uploadPhoto(file);
          uploadedFiles.push({
            id: response.id,
            name: file.name,
            type: file.type,
            size: file.size,
          });
        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error);
          toastService.error(`Ошибка загрузки ${file.name}`);
        }
      }

      if (uploadedFiles.length > 0) {
        const newFiles = [...files, ...uploadedFiles];
        setFiles(newFiles);
        onFilesChange(newFiles.map((f) => f.id));
      }
    } finally {
      setUploading(false);
      // Сбрасываем input для возможности повторной загрузки
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const newFiles = files.filter((f) => f.id !== fileId);
    setFiles(newFiles);
    onFilesChange(newFiles.map((f) => f.id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon size={12} />;
    return <File size={12} />;
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.doc,.docx"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
        {/* Кнопка выбора файлов */}
        <Tooltip title="Прикрепить файл" arrow>
          <span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading || files.length >= maxFiles}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.main,
                  },
                  "&:disabled": {
                    opacity: 0.5,
                  },
                }}
              >
                {uploading ? (
                  <CircularProgress size={20} />
                ) : (
                  <Paperclip size={20} />
                )}
              </IconButton>
            </motion.div>
          </span>
        </Tooltip>

        {/* Список загруженных файлов */}
        <AnimatePresence>
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Chip
                icon={getFileIcon(file.type)}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {file.name.length > 15
                        ? file.name.substring(0, 12) + "..."
                        : file.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 10,
                        opacity: 0.7,
                        fontWeight: 500,
                      }}
                    >
                      ({formatFileSize(file.size)})
                    </Typography>
                  </Box>
                }
                onDelete={() => handleRemoveFile(file.id)}
                deleteIcon={<X size={16} />}
                size="medium"
                sx={{
                  maxWidth: 220,
                  height: 32,
                  borderRadius: 2,
                  px: 1.5,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "& .MuiChip-label": {
                    display: "flex",
                    alignItems: "center",
                    px: 1,
                  },
                  "& .MuiChip-icon": {
                    color: theme.palette.primary.main,
                    fontSize: 18,
                  },
                  "& .MuiChip-deleteIcon": {
                    color: alpha(theme.palette.text.secondary, 0.7),
                    transition: "all 0.2s",
                    "&:hover": {
                      color: theme.palette.error.main,
                      transform: "scale(1.1)",
                    },
                  },
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    borderColor: alpha(theme.palette.primary.main, 0.25),
                  },
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
    </Box>
  );
}

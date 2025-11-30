"use client";

import { Button, Box, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, CircularProgress } from "@mui/material";
import { Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { uploadPhoto } from "@/src/shared/api/media";
import { toastService } from "@/src/shared/lib/toast";

interface CreateOrderFileUploadProps {
  attachments: string[];
  onAttachmentsChange: (attachments: string[]) => void;
}

export function CreateOrderFileUpload({
  attachments,
  onAttachmentsChange,
}: CreateOrderFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadPhoto(file));
      const responses = await Promise.all(uploadPromises);
      const newIds = responses.map(response => response.id);
      onAttachmentsChange([...attachments, ...newIds]);
      toastService.success(`Загружено файлов: ${newIds.length}`);
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка загрузки файла");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (mediaId: string) => {
    onAttachmentsChange(attachments.filter((id) => id !== mediaId));
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variant="outlined"
        startIcon={uploading ? <CircularProgress size={20} /> : <Upload size={20} />}
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? 'Загрузка...' : 'Выбрать файлы'}
      </Button>

      {attachments.length > 0 && (
        <List
          sx={{
            mt: 2,
            bgcolor: 'action.hover',
            borderRadius: 2,
            p: 1,
          }}
        >
          {attachments.map((id) => (
            <ListItem
              key={id}
              dense
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&:last-child': { mb: 0 },
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2">
                    Файл {id.substring(0, 8)}...
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleRemoveAttachment(id)}
                  color="error"
                >
                  <X size={18} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

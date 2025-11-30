"use client";

import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Stack,
  Chip,
  Card,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { Upload, Trash2, Plus, CheckCircle2, X, Link as LinkIcon } from "lucide-react";
import { uploadPhoto } from "@/src/shared/api/media";
import { getMediaUrl } from "@/src/shared/lib/api/axios";
import type { CreatePortfolioItemRequest, PortfolioItemWithMedia } from "@/src/entities/portfolio/model/types";
import { getPortfolioItem } from "@/src/shared/api/portfolio";
import { AIAssistantInline } from "@/src/shared/ui/AIAssistantInline";
import { aiService } from "@/src/shared/lib/ai/ai.service";

interface CreatePortfolioItemFormProps {
  onSubmit: (data: CreatePortfolioItemRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: Partial<CreatePortfolioItemRequest>;
  portfolioItemId?: string;
}

interface UploadedMedia {
  id: string;
  file_path: string;
  file_type: string;
  preview?: string;
}

export function CreatePortfolioItemForm({
  onSubmit,
  onCancel,
  loading,
  initialValues,
  portfolioItemId,
}: CreatePortfolioItemFormProps) {
  const [formData, setFormData] = useState({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    external_link: initialValues?.external_link || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [mediaList, setMediaList] = useState<UploadedMedia[]>([]);
  const [coverMediaId, setCoverMediaId] = useState<string | undefined>(
    initialValues?.cover_media_id
  );
  const [tags, setTags] = useState<string[]>(initialValues?.ai_tags || []);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (portfolioItemId && initialValues?.media_ids && initialValues.media_ids.length > 0) {
      loadExistingMedia();
    }
  }, [portfolioItemId, initialValues?.media_ids]);

  const loadExistingMedia = async () => {
    if (!portfolioItemId) return;
    try {
      const item = await getPortfolioItem(portfolioItemId);
      if (item.media && item.media.length > 0) {
        const existingMedia: UploadedMedia[] = item.media.map((m) => ({
          id: m.id,
          file_path: m.file_path,
          file_type: m.file_type,
          preview: getMediaUrl(m.file_path) || undefined,
        }));
        setMediaList(existingMedia);
        if (item.cover_media_id && !coverMediaId) {
          setCoverMediaId(item.cover_media_id);
        }
      }
    } catch (error) {
      console.error("Failed to load existing media:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const response = await uploadPhoto(file);
      const newMedia: UploadedMedia = {
        id: response.id,
        file_path: response.file_path,
        file_type: response.file_type,
        preview: getMediaUrl(response.file_path) || undefined,
      };
      setMediaList([...mediaList, newMedia]);
      if (!coverMediaId) {
        setCoverMediaId(response.id);
      }
      toastService.success("Файл успешно загружен");
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка загрузки файла");
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMediaList(mediaList.filter((m) => m.id !== mediaId));
    if (coverMediaId === mediaId) {
      setCoverMediaId(mediaList.length > 1 ? mediaList[0]?.id : undefined);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) {
      newErrors.title = 'Введите название работы';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        title: formData.title,
        description: formData.description || undefined,
        cover_media_id: coverMediaId || undefined,
        ai_tags: tags,
        external_link: formData.external_link || undefined,
        media_ids: mediaList.map((m) => m.id),
      });
    } catch (error) {
      // Ошибка обрабатывается в родительском компоненте
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          required
          label="Название работы"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
          placeholder="Например: Веб-сайт для компании X"
        />

        <Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Описание"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Опишите проект, используемые технологии, результаты..."
            inputProps={{ maxLength: 2000 }}
            helperText={`${formData.description.length}/2000`}
          />
          <Box sx={{ mt: 1 }}>
            <AIAssistantInline
              onImprove={async (onChunk) => {
                const currentTitle = formData.title || "";
                const description = formData.description || "";
                if (!currentTitle || currentTitle.trim().length === 0) {
                  toastService.warning("Сначала введите название работы");
                  return;
                }
                await aiService.improvePortfolioStream(
                  {
                    title: currentTitle,
                    description: description || "Описание проекта",
                    ai_tags: tags,
                  },
                  onChunk
                );
              }}
              onApply={(text) => {
                handleChange('description', text);
              }}
              disabled={!formData.title || formData.title.trim().length === 0}
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Медиа файлы
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<Upload size={16} />}
            disabled={uploading}
          >
            {uploading ? "Загрузка..." : "Загрузить изображения"}
            <input
              type="file"
              hidden
              accept="image/*"
              multiple
              onChange={handleFileUpload}
            />
          </Button>

          {mediaList.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Выберите обложку (клик по изображению)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {mediaList.map((media) => {
                  const isCover = coverMediaId === media.id;
                  return (
                    <Box
                      key={media.id}
                      onClick={() => setCoverMediaId(media.id)}
                      sx={{
                        position: 'relative',
                        width: 120,
                        height: 120,
                        border: isCover ? '3px solid' : '1px solid',
                        borderColor: isCover ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      {media.preview && (
                        <img
                          src={media.preview}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                      {isCover && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CheckCircle2 size={16} color="white" />
                        </Box>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMedia(media.id);
                        }}
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 1)',
                          },
                        }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>

        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Теги
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Добавить тег"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<Plus size={16} />}
              onClick={handleAddTag}
            >
              Добавить
            </Button>
          </Stack>
          {tags.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          )}
        </Box>

        <TextField
          fullWidth
          label="Внешняя ссылка"
          value={formData.external_link}
          onChange={(e) => handleChange('external_link', e.target.value)}
          placeholder="https://example.com"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon size={16} />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={onCancel} size="large" sx={{ minWidth: 120 }}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<CheckCircle2 size={16} />}
            sx={{ minWidth: 200 }}
          >
            Сохранить
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

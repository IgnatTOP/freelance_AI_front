"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Grid,
  Button,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Typography,
  Box,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { Plus, Edit, Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMyPortfolio, deletePortfolioItem } from "@/src/shared/api/portfolio";
import type { PortfolioItem } from "@/src/entities/portfolio/model/types";
import { getMediaUrl } from "@/src/shared/lib/api/axios";

interface PortfolioListProps {
  onCreateNew?: () => void;
  onEdit?: (id: string) => void;
}

export function PortfolioList({ onCreateNew, onEdit }: PortfolioListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await getMyPortfolio();
      setPortfolio(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Не удалось загрузить портфолио");
      setPortfolio([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deletePortfolioItem(itemToDelete);
      toastService.success("Работа удалена из портфолио");
      loadPortfolio();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Не удалось удалить работу");
    }
  };

  const getCoverImageUrl = (item: PortfolioItem) => {
    if (item.cover_media_id && item.media) {
      const coverMedia = item.media.find((m) => m.id === item.cover_media_id);
      if (coverMedia) {
        return getMediaUrl(coverMedia.file_path);
      }
    }
    if (item.media && item.media.length > 0) {
      return getMediaUrl(item.media[0].file_path);
    }
    return null;
  };

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Card>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4">
          Моё портфолио
        </Typography>
        {onCreateNew && (
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={onCreateNew}>
            Добавить работу
          </Button>
        )}
      </Box>

      {!portfolio || portfolio.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            У вас пока нет работ в портфолио
          </Typography>
          {onCreateNew && (
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={onCreateNew}>
              Добавить первую работу
            </Button>
          )}
        </Card>
      ) : (
        <Grid container spacing={2}>
          {portfolio.map((item) => {
            const coverUrl = getCoverImageUrl(item);
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {coverUrl ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={coverUrl}
                      alt={item.title}
                      sx={{ objectFit: "cover" }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "grey.200",
                      }}
                    >
                      <ImageIcon size={48} color="#999" />
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {item.title}
                      </Typography>
                      {item.external_link && (
                        <IconButton
                          component="a"
                          href={item.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                        >
                          <ExternalLink size={14} />
                        </IconButton>
                      )}
                    </Stack>
                    {item.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}
                    {item.ai_tags && item.ai_tags.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {item.ai_tags.map((tag, idx) => (
                          <Chip key={idx} label={tag} size="small" color="primary" variant="outlined" />
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    {onEdit && (
                      <Button
                        size="small"
                        startIcon={<Edit size={16} />}
                        onClick={() => onEdit(item.id)}
                      >
                        Редактировать
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Trash2 size={16} />}
                      onClick={() => handleDelete(item.id)}
                    >
                      Удалить
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Delete Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
      >
        <DialogTitle>Удалить работу из портфолио?</DialogTitle>
        <DialogContent>
          <Typography>Это действие нельзя отменить.</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteModalOpen(false);
              setItemToDelete(null);
            }}
          >
            Отмена
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

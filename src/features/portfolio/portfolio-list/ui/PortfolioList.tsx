"use client";

import { useState, useEffect } from "react";
import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Typography,
  Box,
  CardMedia,
  CardActions,
  IconButton,
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { Plus, Edit, Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { getMyPortfolio, deletePortfolioItem } from "@/src/shared/api/portfolio";
import type { PortfolioItem } from "@/src/entities/portfolio/model/types";
import { getMediaUrl } from "@/src/shared/lib/api/axios";
import { StyledCard, EmptyState, LoadingState } from "@/src/shared/ui";

interface PortfolioListProps {
  onCreateNew?: () => void;
  onEdit?: (id: string) => void;
}

function PortfolioCard({ item, onEdit, onDelete }: { item: PortfolioItem; onEdit?: (id: string) => void; onDelete: (id: string) => void }) {
  const getCoverImageUrl = () => {
    if (item.cover_media_id && item.media) {
      const coverMedia = item.media.find((m) => m.id === item.cover_media_id);
      if (coverMedia) return getMediaUrl(coverMedia.file_path);
    }
    if (item.media && item.media.length > 0) return getMediaUrl(item.media[0].file_path);
    return null;
  };

  const coverUrl = getCoverImageUrl();

  return (
    <StyledCard noPadding sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {coverUrl ? (
        <CardMedia component="img" height="200" image={coverUrl} alt={item.title} sx={{ objectFit: "cover" }} />
      ) : (
        <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "var(--bg-secondary)" }}>
          <ImageIcon size={48} style={{ color: "var(--text-muted)" }} />
        </Box>
      )}
      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" component="div">{item.title}</Typography>
          {item.external_link && (
            <IconButton component="a" href={item.external_link} target="_blank" rel="noopener noreferrer" size="small">
              <ExternalLink size={14} />
            </IconButton>
          )}
        </Stack>
        {item.description && (
          <Typography
            variant="body2"
            sx={{
              color: "var(--text-muted)",
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
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
      </Box>
      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        {onEdit && (
          <Button size="small" startIcon={<Edit size={16} />} onClick={() => onEdit(item.id)}>
            Редактировать
          </Button>
        )}
        <Button size="small" color="error" startIcon={<Trash2 size={16} />} onClick={() => onDelete(item.id)}>
          Удалить
        </Button>
      </CardActions>
    </StyledCard>
  );
}

export function PortfolioList({ onCreateNew, onEdit }: PortfolioListProps) {
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

  if (loading) {
    return <LoadingState type="cards" count={3} height={300} />;
  }

  if (!portfolio || portfolio.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="У вас пока нет работ в портфолио"
        description="Добавьте свои лучшие проекты, чтобы привлечь заказчиков"
        action={onCreateNew ? { label: "Добавить первую работу", onClick: onCreateNew } : undefined}
      />
    );
  }

  return (
    <>
      <Grid container spacing={2}>
        {portfolio.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
            <PortfolioCard item={item} onEdit={onEdit} onDelete={handleDelete} />
          </Grid>
        ))}
      </Grid>

      <Dialog open={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }}>
        <DialogTitle>Удалить работу из портфолио?</DialogTitle>
        <DialogContent>
          <Typography>Это действие нельзя отменить.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteModalOpen(false); setItemToDelete(null); }}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Удалить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

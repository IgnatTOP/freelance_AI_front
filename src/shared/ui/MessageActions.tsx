import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  alpha,
  useTheme,
  Fade,
} from "@mui/material";
import {
  MoreVertical,
  Reply,
  Edit,
  Trash2,
  Smile,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Message } from "@/src/entities/conversation/model/types";

interface MessageActionsProps {
  message: Message;
  isMyMessage: boolean;
  onReply: (message: Message) => void;
  onEdit: (message: Message, newContent: string) => void;
  onDelete: (message: Message) => void;
  onReact: (message: Message) => void;
  disabled?: boolean;
}

export function MessageActions({
  message,
  isMyMessage,
  onReply,
  onEdit,
  onDelete,
  onReact,
  disabled = false,
}: MessageActionsProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleReply = () => {
    onReply(message);
    handleCloseMenu();
  };

  const handleOpenEdit = () => {
    setEditContent(message.content);
    setEditDialogOpen(true);
    handleCloseMenu();
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message, editContent.trim());
    }
    setEditDialogOpen(false);
  };

  const handleOpenDelete = () => {
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleConfirmDelete = () => {
    onDelete(message);
    setDeleteDialogOpen(false);
  };

  const handleReact = () => {
    onReact(message);
    handleCloseMenu();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <IconButton
          size="small"
          onClick={handleOpenMenu}
          disabled={disabled}
          sx={{
            opacity: 0,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            ".message-container:hover &": {
              opacity: 1,
            },
            width: 28,
            height: 28,
            borderRadius: 1.5,
            backgroundColor: alpha(theme.palette.action.hover, 0.5),
            "&:hover": {
              backgroundColor: alpha(theme.palette.action.hover, 0.8),
              transform: "scale(1.1)",
            },
          }}
        >
          <MoreVertical size={16} />
        </IconButton>
      </motion.div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          elevation: 8,
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: `0 8px 32px ${alpha('#000', 0.12)}, 0 2px 8px ${alpha('#000', 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            mt: 1,
          },
        }}
      >
        <MenuItem
          onClick={handleReply}
          sx={{
            borderRadius: 1,
            mx: 0.5,
            my: 0.5,
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: "translateX(4px)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Reply size={18} />
          </ListItemIcon>
          <ListItemText
            primary="Ответить"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 500,
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={handleReact}
          sx={{
            borderRadius: 1,
            mx: 0.5,
            my: 0.5,
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: "translateX(4px)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Smile size={18} />
          </ListItemIcon>
          <ListItemText
            primary="Реакция"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 500,
            }}
          />
        </MenuItem>

        {isMyMessage && (
          <MenuItem
            onClick={handleOpenEdit}
            sx={{
              borderRadius: 1,
              mx: 0.5,
              my: 0.5,
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                transform: "translateX(4px)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Edit size={18} />
            </ListItemIcon>
            <ListItemText
              primary="Редактировать"
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 500,
              }}
            />
          </MenuItem>
        )}

        {isMyMessage && (
          <MenuItem
            onClick={handleOpenDelete}
            sx={{
              borderRadius: 1,
              mx: 0.5,
              my: 0.5,
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                transform: "translateX(4px)",
                color: theme.palette.error.main,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <Trash2 size={18} />
            </ListItemIcon>
            <ListItemText
              primary="Удалить"
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 500,
                color: "inherit",
              }}
            />
          </MenuItem>
        )}
      </Menu>

      {/* Диалог редактирования */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 12,
          sx: {
            borderRadius: 3,
            boxShadow: `0 12px 48px ${alpha('#000', 0.15)}, 0 4px 16px ${alpha('#000', 0.1)}`,
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontWeight: 600 }}>
          Редактировать сообщение
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={10}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{
              borderRadius: 2,
              px: 2.5,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editContent.trim() || editContent === message.content}
            sx={{
              borderRadius: 2,
              px: 2.5,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 12,
          sx: {
            borderRadius: 3,
            boxShadow: `0 12px 48px ${alpha('#000', 0.15)}, 0 4px 16px ${alpha('#000', 0.1)}`,
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontWeight: 600 }}>
          Удалить сообщение?
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          Это действие нельзя отменить. Сообщение будет помечено как удаленное.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              borderRadius: 2,
              px: 2.5,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 2.5,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.25)}`,
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

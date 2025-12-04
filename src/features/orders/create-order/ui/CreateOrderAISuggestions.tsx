"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  Grid,
  Divider,
  Checkbox,
  useTheme
} from "@mui/material";
import { Bot, Check, Code, Wallet, Calendar, FileText, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import { formatNumber, parseFormattedNumber } from "@/src/shared/lib/utils/number-utils";

export interface AISuggestions {
  skills: string[];
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  needsAttachments: boolean;
  attachmentDescription?: string;
}

interface CreateOrderAISuggestionsProps {
  suggestions: AISuggestions | null;
  generating: boolean;
  selectedSkills: string[];
  onApplyAll: (edited?: Partial<AISuggestions>) => void;
  onToggleSkill?: (skill: string) => void;
  open?: boolean;
  onClose?: () => void;
}

export function CreateOrderAISuggestions({
  suggestions,
  generating,
  selectedSkills,
  onApplyAll,
  onToggleSkill,
  open,
  onClose,
}: CreateOrderAISuggestionsProps) {
  const theme = useTheme();
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState<number | undefined>();
  const [budgetMax, setBudgetMax] = useState<number | undefined>();
  const [deadline, setDeadline] = useState<string | undefined>();

  useEffect(() => {
    if (suggestions && open) {
      // Инициализируем все навыки как выбранные по умолчанию
      setEditedSkills([...suggestions.skills]);
      setBudgetMin(suggestions.budget_min);
      setBudgetMax(suggestions.budget_max);
      setDeadline(suggestions.deadline ? dayjs(suggestions.deadline).format('YYYY-MM-DD') : undefined);
    }
  }, [suggestions, open]);

  const handleApply = () => {
    const editedSuggestions: Partial<AISuggestions> = {
      skills: editedSkills,
      budget_min: budgetMin,
      budget_max: budgetMax,
      deadline: deadline ? dayjs(deadline).toISOString() : suggestions?.deadline,
    };
    onApplyAll(editedSuggestions);
    onClose?.();
  };

  if (generating) {
    return (
      <Dialog
        open={open || false}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Bot size={18} style={{ color: 'var(--primary)' }} />
            <span>AI готовит предложения...</span>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={40} />
              <Typography sx={{ fontSize: '14px' }}>AI анализирует заказ и готовит предложения...</Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!open) return null;

  // Если предложения пустые, показываем сообщение
  if (!suggestions) {
    return (
      <Dialog
        open={open || false}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <span>Предложения AI</span>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ padding: '20px', textAlign: 'center' }}>
            <Typography color="text.secondary">AI не смог сгенерировать предложения. Попробуйте еще раз.</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Проверяем, есть ли хотя бы одно предложение
  const hasAnySuggestion =
    (suggestions.skills && suggestions.skills.length > 0) ||
    suggestions.budget_min !== undefined ||
    suggestions.budget_max !== undefined ||
    suggestions.deadline !== undefined ||
    suggestions.needsAttachments;

  return (
    <Dialog
      open={open || false}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles size={18} style={{ color: 'var(--primary)' }} />
          <span>Предложения AI</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        {!hasAnySuggestion ? (
          <Box sx={{ padding: '20px', textAlign: 'center' }}>
            <Typography color="text.secondary">AI не смог предложить значения для полей. Вы можете заполнить их вручную.</Typography>
            <Box sx={{ marginTop: '16px' }}>
              <Button onClick={onClose}>Закрыть</Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {/* Навыки */}
            {suggestions.skills && suggestions.skills.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Code size={16} style={{ color: 'var(--primary)' }} />
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                    Навыки ({editedSkills.length} / {suggestions.skills.length})
                  </Typography>
                </Box>
                <Box sx={{
                  padding: '12px',
                  background: 'var(--primary-05)',
                  borderRadius: '8px',
                  border: '1px solid var(--primary-12)',
                }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {suggestions.skills.map((skill, idx) => {
                      const isSelected = editedSkills.includes(skill);
                      return (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: isSelected ? 'var(--primary-08)' : 'transparent',
                            border: `1px solid ${isSelected ? 'var(--primary-25)' : 'rgba(255, 255, 255, 0.1)'}`,
                          }}
                          onClick={() => {
                            setEditedSkills(prev =>
                              prev.includes(skill)
                                ? prev.filter(s => s !== skill)
                                : [...prev, skill]
                            );
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              setEditedSkills(prev =>
                                prev.includes(skill)
                                  ? prev.filter(s => s !== skill)
                                  : [...prev, skill]
                              );
                            }}
                            sx={{ margin: 0, padding: 0 }}
                          />
                          <Typography sx={{ fontSize: '13px' }}>{skill}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            )}

            {/* Бюджет */}
            {(suggestions.budget_min || suggestions.budget_max) && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Wallet size={16} style={{ color: 'var(--primary)' }} />
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>Рекомендуемый бюджет</Typography>
                </Box>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Бюджет от (₽)"
                      type="number"
                      value={budgetMin || ''}
                      onChange={(e) => setBudgetMin(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="0"
                      inputProps={{ min: 0 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Бюджет до (₽)"
                      type="number"
                      value={budgetMax || ''}
                      onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="0"
                      inputProps={{ min: 0 }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Срок */}
            {suggestions.deadline && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Calendar size={16} style={{ color: 'var(--primary)' }} />
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>Рекомендуемый срок</Typography>
                </Box>
                <TextField
                  type="datetime-local"
                  value={deadline || ''}
                  onChange={(e) => setDeadline(e.target.value)}
                  fullWidth
                  inputProps={{
                    min: dayjs().format('YYYY-MM-DDTHH:mm'),
                  }}
                />
              </Box>
            )}

            {/* Файлы */}
            {suggestions.needsAttachments && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FileText size={16} style={{ color: 'var(--primary)' }} />
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>Рекомендуется прикрепить файлы</Typography>
                </Box>
                <Typography color="text.secondary" sx={{ fontSize: '13px' }}>
                  {suggestions.attachmentDescription}
                </Typography>
              </Box>
            )}

          <Divider sx={{ margin: '16px 0' }} />

          {/* Кнопки действий */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={onClose}>
              Отклонить
            </Button>
            <Button
              variant="contained"
              startIcon={<Check size={16} />}
              onClick={handleApply}
            >
              Применить предложения
            </Button>
          </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

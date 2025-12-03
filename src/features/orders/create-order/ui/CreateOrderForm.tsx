"use client";

import {
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Chip,
  Autocomplete,
  Grid,
  CircularProgress,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Calendar, Wallet, Briefcase, Sparkles, FolderTree } from "lucide-react";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { aiService } from "@/src/shared/lib/ai";
import { parseAIResponse } from "@/src/shared/lib/ai/ai-utils";
import { formatNumber, parseFormattedNumber } from "@/src/shared/lib/utils/number-utils";
import { toastService } from "@/src/shared/lib/toast";
import { getCategories, getSkills } from "@/src/shared/api/catalog";
import type { Category } from "@/src/entities/catalog/model/types";
import 'dayjs/locale/ru';

interface CreateOrderFormData {
  title: string;
  description: string;
  skills: string[];
  budget_min?: number;
  budget_max?: number;
  deadline?: dayjs.Dayjs | null;
  category_id?: string;
}

interface CreateOrderFormProps {
  formData: CreateOrderFormData;
  onFormDataChange: (data: Partial<CreateOrderFormData>) => void;
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
  onTitleChange?: (title: string) => void;
  onGenerateAll?: () => void;
  aiMode?: boolean;
}

export function CreateOrderForm({
  formData,
  onFormDataChange,
  skills,
  onSkillsChange,
  onSubmit,
  loading,
  onTitleChange,
  onGenerateAll,
  aiMode,
}: CreateOrderFormProps) {
  // Защита от undefined formData
  const safeFormData = formData || {
    title: '',
    description: '',
    skills: [],
    budget_min: undefined,
    budget_max: undefined,
    deadline: null,
    category_id: undefined,
  };

  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingSkills, setGeneratingSkills] = useState(false);
  const [generatingBudget, setGeneratingBudget] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [skillOptions, setSkillOptions] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, skillsData] = await Promise.all([
          getCategories(),
          getSkills(),
        ]);
        setCategories(categoriesData.categories || []);
        setSkillOptions(skillsData.skills?.map(s => s.name) || []);
      } catch (error) {
        console.error("Failed to load catalog data:", error);
      }
    };
    loadData();
  }, []);

  const handleGenerateDescription = async () => {
    if (!safeFormData.title || safeFormData.title.trim().length < 3) {
      toastService.warning("Сначала введите название заказа (минимум 3 символа)");
      return;
    }

    setGeneratingDescription(true);
    try {
      let fullDescription = "";
      try {
        await aiService.generateOrderDescriptionStream(
          {
            title: safeFormData.title.trim(),
            description: safeFormData.description || "Создайте подробное описание проекта",
            skills: skills,
          },
          (chunk) => {
            fullDescription += chunk;
            onFormDataChange({ description: fullDescription });
          }
        );
        toastService.success("Описание сгенерировано!");
      } catch (error: any) {
        console.error("Error generating description:", error);
        throw new Error(error?.message || "Не удалось сгенерировать описание");
      }
    } catch (error) {
      console.error("Error generating description:", error);
      toastService.error("Не удалось сгенерировать описание");
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleGenerateSkills = async () => {
    if (!safeFormData.title || safeFormData.title.trim().length < 3) {
      toastService.warning("Сначала введите название заказа");
      return;
    }

    setGeneratingSkills(true);
    try {
      let aiResponse = "";
      try {
        await aiService.generateOrderSkillsStream(
          {
            title: safeFormData.title,
            description: safeFormData.description || '',
          },
          (chunk) => {
            aiResponse += chunk;
          }
        );
      } catch (error: any) {
        console.error("Error in generateOrderSkillsStream:", error);
        throw new Error(error?.message || "Не удалось получить ответ от AI");
      }

      const parsed = parseAIResponse(aiResponse);
      if (parsed && parsed.skills && Array.isArray(parsed.skills)) {
        onSkillsChange(parsed.skills);
        toastService.success(`Добавлено ${parsed.skills.length} навыков!`);
      } else if (parsed && Array.isArray(parsed)) {
        onSkillsChange(parsed);
        toastService.success(`Добавлено ${parsed.length} навыков!`);
      } else {
        toastService.warning("Не удалось распознать навыки. Попробуйте еще раз.");
      }
    } catch (error: any) {
      console.error("Error generating skills:", error);
      toastService.error(error?.message || "Не удалось сгенерировать навыки");
    } finally {
      setGeneratingSkills(false);
    }
  };

  const handleGenerateBudget = async () => {
    if (!safeFormData.title || safeFormData.title.trim().length < 3) {
      toastService.warning("Сначала введите название заказа");
      return;
    }

    setGeneratingBudget(true);
    try {
      let aiResponse = "";
      try {
        await aiService.generateOrderBudgetStream(
          {
            title: safeFormData.title,
            description: safeFormData.description || '',
          },
          (chunk) => {
            aiResponse += chunk;
          }
        );
      } catch (error: any) {
        console.error("Error in generateOrderBudgetStream:", error);
        throw new Error(error?.message || "Не удалось получить ответ от AI");
      }

      const parsed = parseAIResponse(aiResponse);
      if (parsed) {
        if (parsed.budget_min && typeof parsed.budget_min === "number") {
          onFormDataChange({ budget_min: parsed.budget_min });
        }
        if (parsed.budget_max && typeof parsed.budget_max === "number") {
          onFormDataChange({ budget_max: parsed.budget_max });
        }
        toastService.success("Бюджет предложен!");
      } else {
        toastService.warning("Не удалось распознать бюджет. Попробуйте еще раз.");
      }
    } catch (error: any) {
      console.error("Error generating budget:", error);
      toastService.error(error?.message || "Не удалось предложить бюджет");
    } finally {
      setGeneratingBudget(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!safeFormData.title || safeFormData.title.length < 3) {
      newErrors.title = "Минимум 3 символа";
    }
    if (safeFormData.title && safeFormData.title.length > 200) {
      newErrors.title = "Максимум 200 символов";
    }

    if (!safeFormData.description || safeFormData.description.length < 10) {
      newErrors.description = "Минимум 10 символов";
    }
    if (safeFormData.description && safeFormData.description.length > 5000) {
      newErrors.description = "Максимум 5000 символов";
    }

    if (safeFormData.budget_min !== undefined && safeFormData.budget_max !== undefined) {
      if (safeFormData.budget_min > safeFormData.budget_max) {
        newErrors.budget_min = "Минимум не может быть больше максимума";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Stack spacing={4}>
        {/* AI Helper Section */}
        {onGenerateAll && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 2,
            }}
          >
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between" 
              alignItems={{ xs: 'stretch', sm: 'center' }}
              gap={2}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={600} display="flex" alignItems="center" gap={1}>
                  <Sparkles size={14} />
                  AI помощник
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Автоматически заполнит описание, навыки, бюджет и сроки
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Sparkles size={16} />}
                onClick={onGenerateAll}
                sx={{ flexShrink: 0 }}
                fullWidth
              >
                AI заполнить всё
              </Button>
            </Box>
          </Paper>
        )}

        {/* Main Information Section */}
        <Box>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Основная информация
          </Typography>
          <Stack spacing={3}>
            <TextField
              fullWidth
              required
              label="Название заказа"
              value={safeFormData.title || ''}
              onChange={(e) => {
                const title = e.target.value;
                onFormDataChange({ title });
                if (aiMode && title && onTitleChange) {
                  onTitleChange(title);
                }
              }}
              error={!!errors.title}
              helperText={errors.title}
              placeholder="Например: Разработка веб-приложения для стартапа"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Briefcase size={20} />
                  </InputAdornment>
                ),
              }}
            />

            {categories.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={safeFormData.category_id || ''}
                  onChange={(e) => onFormDataChange({ category_id: e.target.value || undefined })}
                  label="Категория"
                  startAdornment={
                    <InputAdornment position="start">
                      <FolderTree size={20} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Не выбрана</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Box>
              <Box 
                display="flex" 
                flexDirection={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                gap={1}
                mb={1}
              >
                <Typography variant="body2" fontWeight={500}>
                  Описание проекта <span style={{ color: 'error.main' }}>*</span>
                </Typography>
                <Button
                  size="small"
                  startIcon={generatingDescription ? <CircularProgress size={14} /> : <Sparkles size={14} />}
                  onClick={handleGenerateDescription}
                  disabled={generatingDescription}
                  sx={{ minWidth: 'auto' }}
                >
                  {generatingDescription ? 'Генерирую...' : 'AI создать описание'}
                </Button>
              </Box>
              <TextField
                fullWidth
                required
                multiline
                rows={8}
                value={safeFormData.description || ''}
                onChange={(e) => onFormDataChange({ description: e.target.value })}
                error={!!errors.description}
                helperText={errors.description || "Опишите детали проекта, требования, ожидания и задачи"}
                placeholder="Опишите детали проекта, требования, ожидания..."
                inputProps={{ maxLength: 5000 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                {safeFormData.description?.length || 0} / 5000
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Requirements Section */}
        <Box>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Требования к исполнителю
          </Typography>
          <Box>
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              gap={1}
              mb={1}
            >
              <Typography variant="body2" fontWeight={500}>
                Требуемые навыки
              </Typography>
              <Button
                size="small"
                startIcon={generatingSkills ? <CircularProgress size={14} /> : <Sparkles size={14} />}
                onClick={handleGenerateSkills}
                disabled={generatingSkills}
                sx={{ minWidth: 'auto' }}
              >
                {generatingSkills ? 'Генерирую...' : 'AI подобрать навыки'}
              </Button>
            </Box>
            <Autocomplete
              multiple
              freeSolo
              options={skillOptions}
              value={skills}
              onChange={(_, newValue) => onSkillsChange(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Выберите или введите навыки"
                  helperText="Выберите из списка или введите свой навык и нажмите Enter"
                />
              )}
            />
          </Box>
        </Box>

        {/* Budget and Deadline Section */}
        <Box>
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={1}
            mb={3}
          >
            <Typography variant="h6" fontWeight={600}>
              Бюджет и сроки выполнения
            </Typography>
            <Button
              size="small"
              startIcon={generatingBudget ? <CircularProgress size={14} /> : <Sparkles size={14} />}
              onClick={handleGenerateBudget}
              disabled={generatingBudget}
              sx={{ minWidth: 'auto' }}
            >
              {generatingBudget ? 'Генерирую...' : 'AI предложить бюджет'}
            </Button>
          </Box>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Бюджет от (₽)"
                  value={safeFormData.budget_min || ''}
                  onChange={(e) => onFormDataChange({ budget_min: Number(e.target.value) })}
                  error={!!errors.budget_min}
                  helperText={errors.budget_min || "Минимальная сумма проекта"}
                  placeholder="0"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Wallet size={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Бюджет до (₽)"
                  value={safeFormData.budget_max || ''}
                  onChange={(e) => onFormDataChange({ budget_max: Number(e.target.value) })}
                  helperText="Максимальная сумма проекта"
                  placeholder="0"
                />
              </Grid>
            </Grid>

            <DateTimePicker
              label="Срок выполнения"
              value={safeFormData.deadline || null}
              onChange={(newValue) => onFormDataChange({ deadline: newValue })}
              minDate={dayjs()}
              format="DD.MM.YYYY HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: "Выберите дату и время завершения проекта",
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Calendar size={20} />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </Stack>
        </Box>

        {/* Submit Button */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            {loading ? 'Создание...' : 'Создать заказ'}
          </Button>
        </Box>
      </Stack>
    </LocalizationProvider>
  );
}

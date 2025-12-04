"use client";

import { useState } from "react";
import {
  Card,
  TextField,
  Button,
  Stack,
  Typography,
  Grid,
  Divider,
  Chip,
  Box,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  FileText,
  Calendar as CalendarIcon,
  Code,
  Sparkles,
  CheckCircle,
  Banknote,
} from "lucide-react";
import type { GeneratedOrderData } from "./QuickCreateMode";
import dayjs, { Dayjs } from "dayjs";
import { formatNumber, parseFormattedNumber, COMMON_SKILLS } from "@/src/shared/lib/utils";
import "dayjs/locale/ru";

dayjs.locale("ru");

interface StandardCreateModeProps {
  initialData?: GeneratedOrderData;
  onSubmit: (values: any) => Promise<void>;
  onSwitchMode: () => void;
  loading?: boolean;
}

export function StandardCreateMode({
  initialData,
  onSubmit,
  onSwitchMode,
  loading = false,
}: StandardCreateModeProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    budget_min: initialData?.budget_min || 0,
    budget_max: initialData?.budget_max || 0,
    deadline: initialData?.deadline ? dayjs(initialData.deadline) : null as Dayjs | null,
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData?.skills || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) {
      newErrors.title = 'Введите название заказа';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Минимум 10 символов';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Максимум 200 символов';
    }

    if (!formData.description) {
      newErrors.description = 'Введите описание проекта';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Минимум 50 символов';
    }

    if (!formData.budget_min) {
      newErrors.budget_min = 'Укажите минимальный бюджет';
    } else if (formData.budget_min < 1000) {
      newErrors.budget_min = 'Минимум 1 000 ₽';
    }

    if (!formData.budget_max) {
      newErrors.budget_max = 'Укажите максимальный бюджет';
    } else if (formData.budget_max < 1000) {
      newErrors.budget_max = 'Минимум 1 000 ₽';
    } else if (formData.budget_max < formData.budget_min) {
      newErrors.budget_max = 'Должен быть больше минимального';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        ...formData,
        skills: selectedSkills,
        deadline: formData.deadline ? formData.deadline.toISOString() : undefined,
      };
      await onSubmit(submitData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Box sx={{ maxWidth: 960, mx: "auto" }}>
        <Card sx={{ borderRadius: 2 }}>
          {/* Заголовок Card */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={28} strokeWidth={2} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={600}>
                  Создание заказа
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Заполните детали вашего проекта
                </Typography>
              </Box>
              <Button
                variant="text"
                startIcon={<Sparkles size={16} />}
                onClick={onSwitchMode}
                sx={{ fontSize: 14, height: 32 }}
              >
                Быстрое создание
              </Button>
            </Stack>
          </Box>

          {/* Форма */}
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            {/* Секция 1: Основная информация */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <FileText size={20} />
                <Typography variant="h6" fontWeight={600}>
                  Основная информация
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    label="Название заказа"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title || `${formData.title.length}/200`}
                    placeholder="Например: Разработка веб-приложения для управления задачами"
                    inputProps={{ maxLength: 200 }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={8}
                    label="Описание проекта"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description || `${formData.description.length}/5000 • Опишите детально: цели, требования, функционал, технические детали`}
                    placeholder="Опишите детально требования к проекту..."
                    inputProps={{ maxLength: 5000 }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Секция 2: Бюджет и сроки */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Banknote size={20} />
                <Typography variant="h6" fontWeight={600}>
                  Бюджет и сроки
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Минимальный бюджет (₽)"
                    value={formData.budget_min || ''}
                    onChange={(e) => handleChange('budget_min', parseFloat(e.target.value) || 0)}
                    error={!!errors.budget_min}
                    helperText={errors.budget_min}
                    placeholder="10 000"
                    inputProps={{ min: 1000, max: 10000000, step: 1000 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Максимальный бюджет (₽)"
                    value={formData.budget_max || ''}
                    onChange={(e) => handleChange('budget_max', parseFloat(e.target.value) || 0)}
                    error={!!errors.budget_max}
                    helperText={errors.budget_max}
                    placeholder="50 000"
                    inputProps={{ min: 1000, max: 10000000, step: 1000 }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <DatePicker
                    label="Срок выполнения"
                    value={formData.deadline}
                    onChange={(newValue) => handleChange('deadline', newValue)}
                    format="DD.MM.YYYY"
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: 'Когда проект должен быть завершён (опционально)',
                        placeholder: 'Выберите дату',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Секция 3: Навыки */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Code size={20} />
                <Typography variant="h6" fontWeight={600}>
                  Требуемые навыки
                </Typography>
              </Stack>

              <Autocomplete
                multiple
                freeSolo
                options={COMMON_SKILLS}
                value={selectedSkills}
                onChange={(_, newValue) => setSelectedSkills(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Выберите или введите навыки"
                    helperText={
                      selectedSkills.length > 0
                        ? `Выбрано: ${selectedSkills.length}`
                        : 'Добавьте навыки, необходимые для выполнения проекта'
                    }
                  />
                )}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Кнопки */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<CheckCircle size={20} strokeWidth={2} />}
              disabled={loading}
              fullWidth
              sx={{ height: 48, fontSize: 16, fontWeight: 500 }}
            >
              {loading ? "Создаю заказ..." : "Создать заказ"}
            </Button>
          </Box>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}

"use client";

import { useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Divider,
  Typography,
  Stack,
  Box,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import {
  User,
  MapPin,
  DollarSign,
  Briefcase,
  Code,
  Save,
} from "lucide-react";
import { AIAssistantInline } from "@/src/shared/ui/AIAssistantInline";
import { aiService } from "@/src/shared/lib/ai/ai.service";
import { formatNumber, parseFormattedNumber } from "@/src/shared/lib/utils/number-utils";

interface EditProfileFormProps {
  form: any;
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
}

export function EditProfileForm({
  form,
  skills,
  onSkillsChange,
  onSubmit,
  loading,
}: EditProfileFormProps) {
  // Initialize formData from form values
  const [formData, setFormData] = useState(() => ({
    display_name: form?.getFieldValue?.('display_name') || '',
    bio: form?.getFieldValue?.('bio') || '',
    location: form?.getFieldValue?.('location') || '',
    experience_level: form?.getFieldValue?.('experience_level') || '',
    hourly_rate: form?.getFieldValue?.('hourly_rate') || 0,
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    // Update parent form state
    if (form?.setFieldValue) {
      form.setFieldValue(field, value);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.display_name) {
      newErrors.display_name = 'Введите имя';
    } else if (formData.display_name.length < 2) {
      newErrors.display_name = 'Минимум 2 символа';
    } else if (formData.display_name.length > 100) {
      newErrors.display_name = 'Максимум 100 символов';
    }

    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = 'Максимум 1000 символов';
    }

    if (!formData.experience_level) {
      newErrors.experience_level = 'Выберите уровень опыта';
    }

    if (formData.hourly_rate && formData.hourly_rate < 0) {
      newErrors.hourly_rate = 'Ставка должна быть положительным числом';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const isAIDisabled = !formData.bio && skills.length === 0 && !formData.experience_level;

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      {/* Секция 1: Основная информация */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <User size={20} color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Основная информация
          </Typography>
        </Stack>

        <TextField
          fullWidth
          required
          label="Отображаемое имя"
          value={formData.display_name}
          onChange={(e) => handleChange('display_name', e.target.value)}
          error={!!errors.display_name}
          helperText={errors.display_name}
          placeholder="Как вас должны называть"
          inputProps={{ maxLength: 50 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <User size={16} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          multiline
          rows={6}
          label="О себе"
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          error={!!errors.bio}
          helperText={errors.bio || `${formData.bio?.length || 0}/1000`}
          placeholder="Опишите ваш опыт, навыки, специализацию..."
          inputProps={{ maxLength: 1000 }}
          sx={{ mb: 1 }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Расскажите о себе, опыте и специализации
        </Typography>

        <AIAssistantInline
          onImprove={async (onChunk) => {
            const currentBio = formData.bio || "";
            const currentExperienceLevel = formData.experience_level || "";
            if (!currentBio && skills.length === 0 && !currentExperienceLevel) {
              toastService.warning("Сначала заполните описание, добавьте навыки или выберите уровень опыта");
              return;
            }
            await aiService.improveProfileStream(
              {
                current_bio: currentBio || "Фрилансер с опытом работы",
                skills: skills,
                experience_level: currentExperienceLevel,
              },
              onChunk
            );
          }}
          onApply={(text) => {
            handleChange('bio', text);
          }}
          disabled={isAIDisabled}
        />

        <TextField
          fullWidth
          label="Местоположение"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Например: Москва, Россия"
          helperText="Город, страна (опционально)"
          inputProps={{ maxLength: 100 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MapPin size={16} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3, mt: 2 }}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Секция 2: Профессиональная информация */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Briefcase size={20} />
          <Typography variant="h6" fontWeight={600}>
            Профессиональная информация
          </Typography>
        </Stack>

        <FormControl fullWidth required error={!!errors.experience_level} sx={{ mb: 3 }}>
          <InputLabel>Уровень опыта</InputLabel>
          <Select
            value={formData.experience_level}
            onChange={(e) => handleChange('experience_level', e.target.value)}
            label="Уровень опыта"
            startAdornment={
              <InputAdornment position="start">
                <Briefcase size={16} />
              </InputAdornment>
            }
          >
            <MenuItem value="junior">Начинающий (Junior)</MenuItem>
            <MenuItem value="middle">Средний (Middle)</MenuItem>
            <MenuItem value="senior">Опытный (Senior)</MenuItem>
          </Select>
          {errors.experience_level && (
            <FormHelperText>{errors.experience_level}</FormHelperText>
          )}
        </FormControl>

        <TextField
          fullWidth
          type="number"
          label="Ставка в час (₽)"
          value={formData.hourly_rate}
          onChange={(e) => handleChange('hourly_rate', parseFloat(e.target.value) || 0)}
          error={!!errors.hourly_rate}
          helperText={errors.hourly_rate || "Укажите желаемую почасовую ставку (опционально)"}
          placeholder="1000"
          inputProps={{ min: 0, max: 100000, step: 100 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DollarSign size={16} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Секция 3: Навыки */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Code size={20} />
          <Typography variant="h6" fontWeight={600}>
            Навыки и технологии
          </Typography>
        </Stack>

        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={skills}
          onChange={(_, newValue) => onSkillsChange(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
                key={option}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Навыки"
              placeholder="Введите навык и нажмите Enter"
              helperText="Добавьте навыки и технологии, которыми владеете. Нажмите Enter после каждого"
            />
          )}
          sx={{ mb: 2 }}
        />

        {skills.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Добавлено навыков: {skills.length}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        startIcon={<Save size={20} />}
        disabled={loading}
        sx={{ height: 48, fontSize: 16, fontWeight: 500 }}
      >
        {loading ? "Сохраняю изменения..." : "Сохранить изменения"}
      </Button>
    </form>
  );
}

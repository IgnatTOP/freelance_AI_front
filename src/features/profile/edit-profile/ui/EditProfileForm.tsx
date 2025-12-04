"use client";

import { useState, useEffect } from "react";
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
  Briefcase,
  Code,
  Save,
  Phone,
  Send,
  Globe,
  Building2,
  FileText,
} from "lucide-react";
import { AIAssistantInline } from "@/src/shared/ui/AIAssistantInline";
import { aiService } from "@/src/shared/lib/ai/ai.service";
import { formatNumber, parseFormattedNumber } from "@/src/shared/lib/utils/number-utils";
import { getSkills } from "@/src/shared/api/catalog";

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
  const [formData, setFormData] = useState(() => {
    const initialHourlyRate = form?.getFieldValue?.('hourly_rate');
    return {
      display_name: form?.getFieldValue?.('display_name') || '',
      bio: form?.getFieldValue?.('bio') || '',
      location: form?.getFieldValue?.('location') || '',
      experience_level: form?.getFieldValue?.('experience_level') || '',
      hourly_rate: initialHourlyRate ? String(initialHourlyRate) : '',
      phone: form?.getFieldValue?.('phone') || '',
      telegram: form?.getFieldValue?.('telegram') || '',
      website: form?.getFieldValue?.('website') || '',
      company_name: form?.getFieldValue?.('company_name') || '',
      inn: form?.getFieldValue?.('inn') || '',
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skillOptions, setSkillOptions] = useState<string[]>([]);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await getSkills();
        setSkillOptions(data.skills?.map(s => s.name) || []);
      } catch (error) {
        console.error("Failed to load skills:", error);
      }
    };
    loadSkills();
  }, []);

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

    const hourlyRateNum = formData.hourly_rate ? parseFloat(formData.hourly_rate) : 0;
    if (formData.hourly_rate && (isNaN(hourlyRateNum) || hourlyRateNum < 0)) {
      newErrors.hourly_rate = 'Ставка должна быть положительным числом';
    }

    // Validate website URL
    if (formData.website) {
      const websiteUrl = formData.website.trim();
      if (websiteUrl && !websiteUrl.match(/^https?:\/\//i)) {
        newErrors.website = 'Ссылка должна начинаться с https://';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Convert hourly_rate to number for submission
      const submitData = {
        ...formData,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : 0,
      };
      onSubmit(submitData);
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
            if (skills.length === 0) {
              toastService.warning("Сначала добавьте хотя бы один навык");
              return;
            }
            await aiService.improveProfileStream(
              {
                current_bio: formData.bio || "",
                skills: skills,
                experience_level: formData.experience_level || "",
              },
              onChunk
            );
          }}
          onApply={(text) => {
            handleChange('bio', text);
          }}
          disabled={skills.length === 0}
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
          label="Ставка в час (₽)"
          value={formData.hourly_rate}
          onChange={(e) => {
            const value = e.target.value;
            // Allow only numbers and empty string
            if (value === '' || /^\d*$/.test(value)) {
              handleChange('hourly_rate', value);
            }
          }}
          error={!!errors.hourly_rate}
          helperText={errors.hourly_rate || "Укажите желаемую почасовую ставку (опционально)"}
          placeholder="1000"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                ₽
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Секция 3: Контактная информация */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Phone size={20} />
          <Typography variant="h6" fontWeight={600}>
            Контактная информация
          </Typography>
        </Stack>

        <TextField
          fullWidth
          label="Телефон"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+7 999 123-45-67"
          helperText="Номер телефона для связи (опционально)"
          inputProps={{ maxLength: 20 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone size={16} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Telegram"
          value={formData.telegram}
          onChange={(e) => handleChange('telegram', e.target.value)}
          placeholder="@username"
          helperText="Ваш Telegram username (опционально)"
          inputProps={{ maxLength: 50 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Send size={16} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Веб-сайт"
          value={formData.website}
          onChange={(e) => handleChange('website', e.target.value)}
          placeholder="https://example.com"
          error={!!errors.website}
          helperText={errors.website || "Ваш личный сайт или портфолио (опционально)"}
          inputProps={{ maxLength: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Globe size={16} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Секция 4: Для юридических лиц */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Building2 size={20} />
          <Typography variant="h6" fontWeight={600}>
            Для юридических лиц
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Заполните, если работаете как компания или ИП
        </Typography>

        <TextField
          fullWidth
          label="Название компании"
          value={formData.company_name}
          onChange={(e) => handleChange('company_name', e.target.value)}
          placeholder="ООО Разработка"
          helperText="Название вашей компании или ИП (опционально)"
          inputProps={{ maxLength: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Building2 size={16} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="ИНН"
          value={formData.inn}
          onChange={(e) => handleChange('inn', e.target.value)}
          placeholder="1234567890"
          helperText="ИНН компании или ИП (опционально)"
          inputProps={{ maxLength: 12 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FileText size={16} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Секция 5: Навыки */}
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
          options={skillOptions}
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
              placeholder="Выберите или введите навык"
              helperText="Выберите из списка или введите свой навык и нажмите Enter"
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TextField, Button, Checkbox, FormControlLabel, Divider, Typography, Box, Stack, InputAdornment, IconButton, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toastService } from '@/src/shared/lib/toast';
import { User, Mail, Lock } from 'lucide-react';
import { emailRules, passwordRules, displayNameRules, usernameRules, confirmPasswordRules } from '@/src/shared/lib/utils/form-validations';
import { useAsyncOperation } from '@/src/shared/lib/hooks';
import { authService } from '@/src/shared/lib/auth/auth.service';
import type { RegisterRequest } from '@/src/shared/lib/auth/auth.service';

interface RegisterFormValues {
  email: string;
  password: string;
  username: string;
  role: 'client' | 'freelancer';
  display_name: string;
  confirmPassword: string;
  agreement: boolean;
}

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormValues>({
    email: '',
    password: '',
    username: '',
    role: 'client',
    display_name: '',
    confirmPassword: '',
    agreement: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({});

  const { execute: handleRegister, loading } = useAsyncOperation(
    async (values: RegisterRequest) => {
      await authService.register(values);
      toastService.success('Регистрация успешна!');
      router.push('/dashboard');
    },
    {
      onError: (error) => {
        toastService.error('Ошибка регистрации. Попробуйте снова.');
        console.error('Register error:', error);
      },
    }
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormValues, string>> = {};

    if (!formData.display_name || formData.display_name.length < 2) {
      newErrors.display_name = 'Минимум 2 символа';
    }
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Минимум 3 символа';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Максимум 30 символов';
    } else if (!/^[a-z0-9_]+$/i.test(formData.username)) {
      newErrors.username = 'Только буквы, цифры и _';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Минимум 8 символов';
    } else if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать буквы и цифры';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    if (!formData.agreement) {
      newErrors.agreement = 'Необходимо согласие с условиями';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const { confirmPassword, agreement, ...registerData } = formData;
    await handleRegister(registerData as RegisterRequest);
  };

  const handleChange = (field: keyof RegisterFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <TextField
          label="Имя"
          fullWidth
          value={formData.display_name}
          onChange={(e) => handleChange('display_name', e.target.value)}
          error={!!errors.display_name}
          helperText={errors.display_name}
          placeholder="Иван Иванов"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <User size={18} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Имя пользователя"
          fullWidth
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          error={!!errors.username}
          helperText={errors.username}
          placeholder="username"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <User size={18} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Email"
          fullWidth
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          placeholder="your@email.com"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Mail size={18} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl fullWidth error={!!errors.role}>
          <InputLabel>Роль</InputLabel>
          <Select
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            label="Роль"
          >
            <MenuItem value="client">Заказчик</MenuItem>
            <MenuItem value="freelancer">Фрилансер</MenuItem>
          </Select>
          {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
        </FormControl>

        <TextField
          label="Пароль"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
          placeholder="••••••••"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={18} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Подтверждение пароля"
          fullWidth
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          placeholder="••••••••"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={18} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControl error={!!errors.agreement}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.agreement}
                onChange={(e) => handleChange('agreement', e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                Я согласен с{' '}
                <Link href="/terms" style={{ textDecoration: 'none' }}>
                  <Typography component="span" variant="body2" color="primary">
                    условиями использования
                  </Typography>
                </Link>
                {' '}и{' '}
                <Link href="/privacy" style={{ textDecoration: 'none' }}>
                  <Typography component="span" variant="body2" color="primary">
                    политикой конфиденциальности
                  </Typography>
                </Link>
              </Typography>
            }
          />
          {errors.agreement && <FormHelperText>{errors.agreement}</FormHelperText>}
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>

        <Divider>
          <Typography variant="body2" color="text.secondary">
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <Typography component="span" variant="body2" color="primary">
                Войти
              </Typography>
            </Link>
          </Typography>
        </Divider>
      </Stack>
    </Box>
  );
}

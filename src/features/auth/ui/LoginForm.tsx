'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TextField, Button, Checkbox, FormControlLabel, Divider, Typography, Box, Stack, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toastService } from '@/src/shared/lib/toast';
import { Mail, Lock } from 'lucide-react';
import { emailRules, passwordRules } from '@/src/shared/lib/utils/form-validations';
import { useAsyncOperation } from '@/src/shared/lib/hooks';
import { authService } from '@/src/shared/lib/auth/auth.service';
import type { LoginRequest } from '@/src/shared/lib/auth/auth.service';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { execute: handleLogin, loading } = useAsyncOperation(
    async (values: LoginRequest) => {
      await authService.login(values);
      toastService.success('Успешный вход!');
      router.push('/dashboard');
    },
    {
      onError: (error) => {
        toastService.error('Ошибка входа. Проверьте данные.');
        console.error('Login error:', error);
      },
    }
  );

  const validateEmail = (value: string): string | undefined => {
    if (!value) return 'Введите email';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Неверный формат email';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Введите пароль';
    if (value.length < 6) return 'Минимум 6 символов';
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    if (emailError || passwordError) return;

    await handleLogin({ email, password });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <TextField
          label="Email"
          fullWidth
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        <TextField
          label="Пароль"
          fullWidth
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
            }
            label="Запомнить меня"
          />
          <Link href="/auth/forgot-password" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary">
              Забыли пароль?
            </Typography>
          </Link>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </Button>

        <Divider>
          <Typography variant="body2" color="text.secondary">
            Нет аккаунта?{' '}
            <Link href="/auth/register" style={{ textDecoration: 'none' }}>
              <Typography component="span" variant="body2" color="primary">
                Зарегистрироваться
              </Typography>
            </Link>
          </Typography>
        </Divider>
      </Stack>
    </Box>
  );
}

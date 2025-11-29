"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toastService } from "@/src/shared/lib/toast";
import { motion } from "framer-motion";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Введите email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Введите корректный email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Введите пароль");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Минимум 6 символов");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      await authService.login({
        email,
        password,
      });

      toastService.success("Вход выполнен успешно!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err?.response?.data?.error ||
        "Ошибка входа. Проверьте email и пароль.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "transparent" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: { xs: "24px", md: "40px 24px" },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: 480 }}
        >
          <Stack spacing={4}>
            {/* Header */}
            <Box sx={{ textAlign: "center" }}>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: theme.shape.borderRadius * 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <LogIn size={32} strokeWidth={2} style={{ color: "#fff" }} />
              </motion.div>
              <Typography
                variant="h3"
                component="h1"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                Вход в аккаунт
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Войдите для доступа к платформе
              </Typography>
            </Box>

            {/* Form Card */}
            <Card
              sx={{
                borderRadius: 2,
                borderColor: theme.palette.divider,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* Error Alert */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Alert
                          severity="error"
                          onClose={() => setError("")}
                          sx={{ borderRadius: 1 }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            Ошибка входа
                          </Typography>
                          <Typography variant="body2">{error}</Typography>
                        </Alert>
                      </motion.div>
                    )}

                    {/* Email Field */}
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      onBlur={() => validateEmail(email)}
                      error={!!emailError}
                      helperText={emailError}
                      disabled={loading}
                      placeholder="your@email.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail size={16} style={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                      required
                    />

                    {/* Password Field */}
                    <TextField
                      label="Пароль"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                      }}
                      onBlur={() => validatePassword(password)}
                      error={!!passwordError}
                      helperText={passwordError}
                      disabled={loading}
                      placeholder="••••••••"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={16} style={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                      required
                    />

                    {/* Forgot Password Link */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Link href="/auth/forgot-password" style={{ textDecoration: "none" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.primary.main,
                            cursor: "pointer",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          Забыли пароль?
                        </Typography>
                      </Link>
                    </Box>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      endIcon={<ArrowRight size={20} strokeWidth={2} />}
                      fullWidth
                      sx={{
                        height: 48,
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {loading ? "Вход..." : "Войти"}
                    </Button>

                    {/* Register Link */}
                    <Box
                      sx={{
                        pt: 3,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Нет аккаунта?{" "}
                        <Link href="/auth/register" style={{ textDecoration: "none" }}>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                              cursor: "pointer",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            Зарегистрироваться
                          </Typography>
                        </Link>
                      </Typography>
                    </Box>
                  </Stack>
                </form>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <ShieldCheck
                size={16}
                style={{ color: theme.palette.text.secondary }}
              />
              <Typography variant="caption" color="text.secondary">
                Защищенное соединение с шифрованием
              </Typography>
            </Box>
          </Stack>
        </motion.div>
      </Box>
    </Box>
  );
}

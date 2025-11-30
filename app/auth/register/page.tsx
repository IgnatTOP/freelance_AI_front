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
  Grid,
  useTheme,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toastService } from "@/src/shared/lib/toast";
import { motion } from "framer-motion";
import { authService } from "@/src/shared/lib/auth/auth.service";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Briefcase,
  Users,
  ArrowRight,
  Check,
  Shield,
} from "lucide-react";

type Role = "client" | "freelancer";

export default function RegisterPage() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

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

  const validateUsername = (username: string) => {
    if (!username) {
      setUsernameError("Введите имя пользователя");
      return false;
    }
    if (username.length < 3) {
      setUsernameError("Минимум 3 символа");
      return false;
    }
    setUsernameError("");
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

  const validateConfirmPassword = (confirmPass: string, pass: string) => {
    if (!confirmPass) {
      setConfirmPasswordError("Подтвердите пароль");
      return false;
    }
    if (confirmPass !== pass) {
      setConfirmPasswordError("Пароли не совпадают");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("Пожалуйста, выберите роль");
      return;
    }

    const isEmailValid = validateEmail(email);
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);

    if (!isEmailValid || !isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email,
        password,
        username,
        role: selectedRole,
        display_name: displayName || username,
      });

      toastService.success("Регистрация прошла успешно!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Register error:", err);
      const errorMessage =
        err?.response?.data?.error ||
        "Ошибка регистрации. Попробуйте другой email или username.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "client" as Role,
      title: "Заказчик",
      description: "Ищу исполнителей для проектов",
      icon: Briefcase,
      features: [
        "Размещение заказов",
        "AI-помощник для ТЗ",
        "Выбор фрилансеров",
        "Контроль проекта",
      ],
    },
    {
      id: "freelancer" as Role,
      title: "Фрилансер",
      description: "Выполняю заказы и зарабатываю",
      icon: Users,
      features: [
        "Поиск заказов",
        "AI-помощник для откликов",
        "Портфолио и рейтинг",
        "Защищенные выплаты",
      ],
    },
  ];

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
          style={{ width: "100%", maxWidth: selectedRole ? 480 : 960 }}
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
                  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 16,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <UserPlus size={32} strokeWidth={2} style={{ color: "#fff" }} />
              </motion.div>
              <Typography
                variant="h3"
                component="h1"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                Регистрация
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {!selectedRole
                  ? "Выберите роль для начала работы"
                  : "Создайте аккаунт на платформе"}
              </Typography>
            </Box>

            {/* Role Selection */}
            {!selectedRole && (
              <Grid container spacing={3}>
                {roles.map((role, index) => {
                  const Icon = role.icon;
                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={role.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      >
                        <Card
                          onClick={() => setSelectedRole(role.id)}
                          sx={{
                            borderRadius: 2,
                            borderColor: theme.palette.divider,
                            height: "100%",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              borderColor: theme.palette.primary.main,
                              boxShadow: `0 4px 12px ${theme.palette.primary.main}33`,
                            },
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2}>
                              <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box
                                  sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 2,
                                    background: `${theme.palette.primary.main}1A`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <Icon size={28} style={{ color: theme.palette.primary.main }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600, mb: 0.5 }}
                                  >
                                    {role.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {role.description}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Box
                                sx={{
                                  pt: 2,
                                  borderTop: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                <Stack spacing={1}>
                                  {role.features.map((feature, i) => (
                                    <Box
                                      key={i}
                                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                      <Check
                                        size={16}
                                        style={{
                                          color: theme.palette.success.main,
                                          flexShrink: 0,
                                        }}
                                      />
                                      <Typography variant="body2" color="text.secondary">
                                        {feature}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Stack>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {/* Registration Form */}
            {selectedRole && (
              <Card
                sx={{
                  borderRadius: 2,
                  borderColor: theme.palette.divider,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  {/* Selected Role Badge */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1.5,
                      p: 2,
                      mb: 3,
                      borderRadius: 1,
                      background: `${theme.palette.primary.main}0D`,
                      border: `1px solid ${theme.palette.primary.main}26`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        background: `${theme.palette.primary.main}1A`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selectedRole === "client" ? (
                        <Briefcase size={20} style={{ color: theme.palette.primary.main }} />
                      ) : (
                        <Users size={20} style={{ color: theme.palette.primary.main }} />
                      )}
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                      Регистрация как {selectedRole === "client" ? "Заказчик" : "Фрилансер"}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setSelectedRole(null)}
                    >
                      Изменить
                    </Button>
                  </Box>

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
                              Ошибка регистрации
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

                      {/* Username Field */}
                      <TextField
                        label="Имя пользователя"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setUsernameError("");
                        }}
                        onBlur={() => validateUsername(username)}
                        error={!!usernameError}
                        helperText={usernameError || "Минимум 3 символа, без пробелов"}
                        disabled={loading}
                        placeholder="username"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <User size={16} style={{ color: theme.palette.text.secondary }} />
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                        required
                      />

                      {/* Display Name Field */}
                      <TextField
                        label="Отображаемое имя"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={loading}
                        placeholder="Иван Иванов"
                        helperText="Ваше настоящее имя (опционально)"
                        fullWidth
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
                        helperText={passwordError || "Минимум 6 символов"}
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

                      {/* Confirm Password Field */}
                      <TextField
                        label="Подтверждение пароля"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setConfirmPasswordError("");
                        }}
                        onBlur={() => validateConfirmPassword(confirmPassword, password)}
                        error={!!confirmPasswordError}
                        helperText={confirmPasswordError}
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
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                size="small"
                              >
                                {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                        required
                      />

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
                        {loading ? "Регистрация..." : "Зарегистрироваться"}
                      </Button>

                      {/* Login Link */}
                      <Box
                        sx={{
                          pt: 3,
                          borderTop: `1px solid ${theme.palette.divider}`,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Уже есть аккаунт?{" "}
                          <Link href="/auth/login" style={{ textDecoration: "none" }}>
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
                              Войти
                            </Typography>
                          </Link>
                        </Typography>
                      </Box>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Security Info */}
            {selectedRole && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Shield size={16} style={{ color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary">
                  Регистрируясь, вы соглашаетесь с{" "}
                  <Link href="/terms" style={{ textDecoration: "none" }}>
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        color: theme.palette.primary.main,
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      условиями использования
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            )}
          </Stack>
        </motion.div>
      </Box>
    </Box>
  );
}

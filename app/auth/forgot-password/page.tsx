"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement password reset API call
      toastService.success("Инструкции по восстановлению пароля отправлены на ваш email");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toastService.error("Не удалось отправить инструкции. Попробуйте позже.");
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
                  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 16,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <KeyRound size={32} strokeWidth={2} style={{ color: "#fff" }} />
              </motion.div>
              <Typography
                variant="h3"
                component="h1"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                Восстановление пароля
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Введите email, и мы отправим вам инструкции по восстановлению пароля
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
                      autoFocus
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      sx={{
                        height: 48,
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {loading ? "Отправка..." : "Отправить инструкции"}
                    </Button>

                    {/* Back to Login Link */}
                    <Box
                      sx={{
                        pt: 3,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        textAlign: "center",
                      }}
                    >
                      <Link href="/auth/login" style={{ textDecoration: "none" }}>
                        <Button
                          variant="text"
                          startIcon={<ArrowLeft size={16} />}
                          sx={{
                            color: theme.palette.text.secondary,
                            "&:hover": {
                              color: theme.palette.primary.main,
                            },
                          }}
                        >
                          Вернуться к входу
                        </Button>
                      </Link>
                    </Box>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Stack>
        </motion.div>
      </Box>
    </Box>
  );
}


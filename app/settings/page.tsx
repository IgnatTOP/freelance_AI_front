"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, Stack, Button, Avatar, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, IconButton } from "@mui/material";
import { User, Bell, Lock, Shield, CheckCircle, XCircle, Mail, Phone, Smartphone, Trash2, LogOut } from "lucide-react";
import { PageContainer, StyledCard } from "@/src/shared/ui";
import { useAuth } from "@/src/shared/lib/hooks";
import { toastService } from "@/src/shared/lib/toast";
import { getVerificationStatus, sendEmailCode, sendPhoneCode, verifyCode as verifyCodeApi } from "@/src/shared/api/verification";
import { authService, type Session } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import type { VerificationStatus } from "@/src/entities/verification/model/types";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyType, setVerifyType] = useState<"email" | "phone">("email");
  const [codeInput, setCodeInput] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }
    if (isAuthenticated) {
      loadVerificationStatus();
      loadSessions();
    }
  }, [loading, isAuthenticated, router]);

  const loadVerificationStatus = async () => {
    try {
      const status = await getVerificationStatus();
      setVerificationStatus(status);
    } catch (error) {
      console.error("Failed to load verification status:", error);
    }
  };

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const sessionsList = await authService.getSessions();
      setSessions(sessionsList);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSendCode = async () => {
    setSendingCode(true);
    try {
      if (verifyType === "email") {
        await sendEmailCode();
      } else {
        await sendPhoneCode();
      }
      setCodeSent(true);
      toastService.success("Код отправлен");
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка отправки кода");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerify = async () => {
    if (!codeInput) return;
    setVerifying(true);
    try {
      const result = await verifyCodeApi({ type: verifyType, code: codeInput });
      if (result.verified) {
        toastService.success("Верификация успешна");
        setVerifyDialogOpen(false);
        setCodeInput("");
        setCodeSent(false);
        loadVerificationStatus();
      } else {
        toastService.error("Неверный код");
      }
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка верификации");
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await authService.deleteSession(sessionId);
      toastService.success("Сессия удалена");
      loadSessions();
    } catch (error) {
      toastService.error("Ошибка удаления сессии");
    }
  };

  const handleLogoutAll = async () => {
    try {
      await authService.deleteAllSessions();
      authService.clearAuthAndRedirect("/auth/login");
    } catch (error) {
      toastService.error("Ошибка выхода");
    }
  };

  const openVerifyDialog = (type: "email" | "phone") => {
    setVerifyType(type);
    setCodeInput("");
    setCodeSent(false);
    setVerifyDialogOpen(true);
  };

  const settingsSections = [
    {
      icon: User,
      title: "Профиль",
      description: "Управляйте информацией о себе, навыками и опытом работы",
      href: "/profile",
      color: "var(--primary)",
      action: "Редактировать",
    },
    {
      icon: Bell,
      title: "Уведомления",
      description: "Настройте email и push-уведомления",
      href: null,
      color: "var(--info)",
      action: null,
      disabled: true,
    },
    {
      icon: Lock,
      title: "Безопасность",
      description: "Смена пароля и двухфакторная аутентификация",
      href: null,
      color: "var(--success)",
      action: null,
      disabled: true,
    },
    {
      icon: Shield,
      title: "Приватность",
      description: "Управление видимостью профиля и данных",
      href: null,
      color: "var(--warning)",
      action: null,
      disabled: true,
    },
  ];

  return (
    <PageContainer title="Настройки" subtitle="Управление настройками аккаунта" maxWidth="md">
      <Stack spacing={3}>
        {/* Settings Sections */}
        <Stack spacing={2}>
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <StyledCard key={section.title} sx={{ opacity: section.disabled ? 0.6 : 1 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: `${section.color}20`, width: 48, height: 48 }}>
                    <Icon size={24} style={{ color: section.color }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {section.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
                      {section.description}
                      {section.disabled && " (скоро)"}
                    </Typography>
                  </Box>
                  {section.href && section.action && (
                    <Link href={section.href} style={{ textDecoration: "none" }}>
                      <Button variant="outlined">{section.action}</Button>
                    </Link>
                  )}
                </Stack>
              </StyledCard>
            );
          })}
        </Stack>

        {/* Verification Section */}
        <StyledCard>
          <Typography variant="h6" sx={{ mb: 2 }}>Верификация</Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Mail size={20} />
                <Box>
                  <Typography variant="body1">Email</Typography>
                  <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>{user?.email}</Typography>
                </Box>
              </Stack>
              {verificationStatus?.email_verified ? (
                <Chip icon={<CheckCircle size={16} />} label="Подтверждён" color="success" size="small" />
              ) : (
                <Button variant="outlined" size="small" onClick={() => openVerifyDialog("email")}>
                  Подтвердить
                </Button>
              )}
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Phone size={20} />
                <Box>
                  <Typography variant="body1">Телефон</Typography>
                  <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>Не указан</Typography>
                </Box>
              </Stack>
              {verificationStatus?.phone_verified ? (
                <Chip icon={<CheckCircle size={16} />} label="Подтверждён" color="success" size="small" />
              ) : (
                <Button variant="outlined" size="small" onClick={() => openVerifyDialog("phone")} disabled>
                  Подтвердить
                </Button>
              )}
            </Stack>
          </Stack>
        </StyledCard>

        {/* Sessions Section */}
        <StyledCard>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Активные сессии</Typography>
            <Button variant="text" color="error" startIcon={<LogOut size={16} />} onClick={handleLogoutAll}>
              Выйти везде
            </Button>
          </Stack>
          {loadingSessions ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : sessions.length === 0 ? (
            <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>Нет активных сессий</Typography>
          ) : (
            <Stack spacing={1}>
              {sessions.map((session) => (
                <Stack key={session.id} direction="row" spacing={2} alignItems="center" sx={{ p: 1.5, bgcolor: "var(--bg)", borderRadius: 1 }}>
                  <Smartphone size={20} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: 13 }}>
                      {session.user_agent?.substring(0, 50) || "Неизвестное устройство"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                      IP: {session.ip_address || "—"} • {new Date(session.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleDeleteSession(session.id)}>
                    <Trash2 size={16} />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </StyledCard>
      </Stack>

      {/* Verification Dialog */}
      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Подтверждение {verifyType === "email" ? "email" : "телефона"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {!codeSent ? (
              <Typography variant="body2">
                Мы отправим код подтверждения на ваш {verifyType === "email" ? "email" : "телефон"}.
              </Typography>
            ) : (
              <>
                <Typography variant="body2">Введите код из {verifyType === "email" ? "письма" : "SMS"}:</Typography>
                <TextField
                  fullWidth
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Код подтверждения"
                  size="small"
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Отмена</Button>
          {!codeSent ? (
            <Button variant="contained" onClick={handleSendCode} disabled={sendingCode}>
              {sendingCode ? <CircularProgress size={20} /> : "Отправить код"}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleVerify} disabled={verifying || !codeInput}>
              {verifying ? <CircularProgress size={20} /> : "Подтвердить"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

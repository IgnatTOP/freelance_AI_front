"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Card, CardContent, CardHeader, Typography, Stack, Button, Avatar } from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { User, Bell, Lock, Settings as SettingsIcon } from "lucide-react";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }
  }, [router]);

  return (
    <Box sx={{ minHeight: "100vh", p: 3, maxWidth: 1000, mx: "auto", width: "100%" }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4">Настройки</Typography>
          <Typography variant="body2" color="text.secondary">
            Управление настройками аккаунта
          </Typography>
        </Box>

        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <User size={20} />
              </Avatar>
            }
            title="Профиль"
            action={
              <Link href="/profile" style={{ textDecoration: 'none' }}>
                <Button variant="contained">Редактировать профиль</Button>
              </Link>
            }
          />
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Управляйте информацией о себе, навыками и опытом работы
              </Typography>
              <Box>
                <Link href="/profile" style={{ textDecoration: 'none' }}>
                  <Button variant="outlined">Перейти к редактированию профиля</Button>
                </Link>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Bell size={20} />
              </Avatar>
            }
            title="Уведомления"
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Настройки уведомлений будут доступны в следующих версиях
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <Lock size={20} />
              </Avatar>
            }
            title="Безопасность"
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Настройки безопасности будут доступны в следующих версиях
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

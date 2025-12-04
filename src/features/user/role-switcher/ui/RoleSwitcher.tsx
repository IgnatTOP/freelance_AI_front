"use client";

import { useState, useEffect } from "react";
import { ToggleButtonGroup, ToggleButton, Box, CircularProgress } from "@mui/material";
import { Briefcase, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { updateRole } from "@/src/shared/api/profile";
import { toastService } from "@/src/shared/lib/toast";

type UserRole = "client" | "freelancer";

export function RoleSwitcher() {
  const theme = useTheme();
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<UserRole>("client");
  const [loading, setLoading] = useState(false);

  const getCurrentRole = (): UserRole => {
    const user = authService.getCurrentUser();
    if (!user?.role) return "client";

    if (user.role === "admin") {
      return "client";
    }

    return user.role as UserRole;
  };

  useEffect(() => {
    const initialRole = getCurrentRole();
    setCurrentRole(initialRole);

    const handleRoleUpdate = () => {
      const newRole = getCurrentRole();
      setCurrentRole(newRole);
    };

    window.addEventListener('userRoleChanged', handleRoleUpdate);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        handleRoleUpdate();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('userRoleChanged', handleRoleUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleRoleChange = async (_event: React.MouseEvent<HTMLElement>, newRole: UserRole | null) => {
    if (!newRole || newRole === currentRole) return;

    setLoading(true);
    try {
      const updatedUser = await updateRole(newRole);
      authService.setCurrentUser(updatedUser);
      setCurrentRole(newRole);

      toastService.success(
        `Роль изменена на ${newRole === "client" ? "Заказчик" : "Фрилансер"}`
      );

      window.dispatchEvent(new Event('userRoleChanged'));
      window.location.reload();
    } catch (error: any) {
      console.error("Error changing role:", error);
      toastService.error(
        error.response?.data?.error || "Ошибка при смене роли"
      );
      const role = getCurrentRole();
      setCurrentRole(role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToggleButtonGroup
      value={currentRole}
      exclusive
      onChange={handleRoleChange}
      disabled={loading}
      size="small"
      sx={{
        bgcolor: 'background.paper',
        '& .MuiToggleButton-root': {
          px: 2,
          py: 0.75,
          fontSize: '0.875rem',
          textTransform: 'none',
          border: 1,
          borderColor: 'divider',
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }
        }
      }}
    >
      <ToggleButton value="client">
        <Box display="flex" alignItems="center" gap={0.5}>
          {loading && currentRole === "client" ? (
            <CircularProgress size={14} />
          ) : (
            <User size={14} />
          )}
          <span>Заказчик</span>
        </Box>
      </ToggleButton>
      <ToggleButton value="freelancer">
        <Box display="flex" alignItems="center" gap={0.5}>
          {loading && currentRole === "freelancer" ? (
            <CircularProgress size={14} />
          ) : (
            <Briefcase size={14} />
          )}
          <span>Фрилансер</span>
        </Box>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

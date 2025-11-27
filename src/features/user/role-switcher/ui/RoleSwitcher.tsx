"use client";

import { useState, useEffect } from "react";
import { Segmented, theme } from "antd";
import { Briefcase, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { updateRole } from "@/src/shared/api/profile";
import { toastService } from "@/src/shared/lib/toast";

const { useToken } = theme;

type UserRole = "client" | "freelancer";

export function RoleSwitcher() {
  const { token } = useToken();
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<UserRole>("client");
  const [loading, setLoading] = useState(false);

  // Функция для получения текущей роли
  const getCurrentRole = (): UserRole => {
    const user = authService.getCurrentUser();
    if (!user?.role) return "client";
    
    // Если роль admin, показываем как client
    if (user.role === "admin") {
      return "client";
    }
    
    return user.role as UserRole;
  };

  useEffect(() => {
    // Инициализируем роль сразу
    const initialRole = getCurrentRole();
    setCurrentRole(initialRole);
    
    // Слушаем изменения роли
    const handleRoleUpdate = () => {
      const newRole = getCurrentRole();
      setCurrentRole(newRole);
    };

    window.addEventListener('userRoleChanged', handleRoleUpdate);
    
    // Слушаем изменения localStorage (для синхронизации между вкладками)
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

  const handleRoleChange = async (value: string | number) => {
    const newRole = value as UserRole;
    if (newRole === currentRole) return;

    setLoading(true);
    try {
      // Update role via API
      const updatedUser = await updateRole(newRole);

      // Update local storage
      authService.setCurrentUser(updatedUser);

      // Обновляем локальное состояние
      setCurrentRole(newRole);
      
      toastService.success(
        `Роль изменена на ${newRole === "client" ? "Заказчик" : "Фрилансер"}`
      );

      // Отправляем событие для обновления других компонентов
      window.dispatchEvent(new Event('userRoleChanged'));

      // Reload page to update UI everywhere
      window.location.reload();
    } catch (error: any) {
      console.error("Error changing role:", error);
      toastService.error(
        error.response?.data?.error || "Ошибка при смене роли"
      );
      // В случае ошибки возвращаем предыдущую роль
      const role = getCurrentRole();
      setCurrentRole(role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Segmented
      value={currentRole}
      onChange={handleRoleChange}
      disabled={loading}
      className="role-switcher-segmented"
      options={[
        {
          label: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                fontSize: 14,
                lineHeight: "22px",
                fontWeight: 500,
                margin: 0,
                padding: 0,
              }}
            >
              <User size={14} style={{ flexShrink: 0, margin: 0, padding: 0, marginRight: 4 }} />
              <span style={{ display: "inline", margin: 0, padding: 0 }}>Заказчик</span>
            </div>
          ),
          value: "client",
        },
        {
          label: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                fontSize: 14,
                lineHeight: "22px",
                fontWeight: 500,
                margin: 0,
                padding: 0,
              }}
            >
              <Briefcase size={14} style={{ flexShrink: 0, margin: 0, padding: 0, marginRight: 4 }} />
              <span style={{ display: "inline", margin: 0, padding: 0 }}>Фрилансер</span>
            </div>
          ),
          value: "freelancer",
        },
      ]}
      style={{
        background: `${token.colorBgContainer}80`,
        padding: 2,
        borderRadius: token.borderRadius,
      }}
    />
  );
}

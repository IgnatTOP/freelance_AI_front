/**
 * Переиспользуемый компонент аватара пользователя
 */

"use client";

import { Avatar } from "@mui/material";
import type { User, Profile } from "@/src/shared/lib/auth/auth.service";

interface UserAvatarProps {
  user?: User | null;
  profile?: Profile | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function UserAvatar({ user, profile, size = 40, className = "", style }: UserAvatarProps) {
  const displayName = profile?.display_name || user?.username;
  const initial = displayName?.charAt(0).toUpperCase() || "?";

  return (
    <Avatar
      className={className}
      sx={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, var(--primary-20), rgba(var(--primary-dark-rgb), 0.2))",
        border: "2px solid var(--primary-30)",
        color: "var(--primary)",
        fontSize: size * 0.4,
        fontWeight: 600,
        transition: "all 0.3s",
        ...style,
      }}
    >
      {initial}
    </Avatar>
  );
}



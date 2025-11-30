/**
 * Переиспользуемый компонент аватара пользователя
 */

"use client";

import { Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { User, Profile } from "@/src/shared/lib/auth/auth.service";

interface UserAvatarProps {
  user?: User | null;
  profile?: Profile | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function UserAvatar({ user, profile, size = 40, className = "", style }: UserAvatarProps) {
  const theme = useTheme();
  const displayName = profile?.display_name || user?.username;
  const initial = displayName?.charAt(0).toUpperCase() || "?";

  return (
    <Avatar
      className={className}
      sx={{
        width: size,
        height: size,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.2), rgba(24, 144, 255, 0.15))'
          : 'linear-gradient(135deg, rgba(24, 144, 255, 0.15), rgba(24, 144, 255, 0.1))',
        border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(24, 144, 255, 0.3)' : 'rgba(24, 144, 255, 0.2)'}`,
        color: theme.palette.primary.main,
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



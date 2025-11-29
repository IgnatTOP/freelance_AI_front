"use client";

import { Box } from "@mui/material";
import { EditProfileFeature } from "@/src/features/profile/edit-profile";

export default function ProfilePage() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <EditProfileFeature />
    </Box>
  );
}

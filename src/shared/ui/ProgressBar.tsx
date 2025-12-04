"use client";

import { AppProgressBar as NProgressBar } from "next-nprogress-bar";
import { useTheme } from "@mui/material/styles";

export function ProgressBar() {
  const theme = useTheme();

  return (
    <NProgressBar
      height="3px"
      color={theme.palette.primary.main}
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}

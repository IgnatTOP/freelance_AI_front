"use client";

import { AppProgressBar as NProgressBar } from "next-nprogress-bar";

export function ProgressBar() {
  return (
    <NProgressBar
      height="3px"
      color="var(--primary)"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}

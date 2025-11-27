"use client";

import { ReactNode } from "react";
import { Toast } from "@/src/shared/ui/Toast";

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toast />
    </>
  );
}



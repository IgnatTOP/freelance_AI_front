"use client";

import { useState } from "react";
import { Card, Typography } from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { useRouter } from "next/navigation";
import { CreatePortfolioItemForm } from "./CreatePortfolioItemForm";
import { createPortfolioItem } from "@/src/shared/api/portfolio";
import type { CreatePortfolioItemRequest } from "@/src/entities/portfolio/model/types";

export function CreatePortfolioItemFeature() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreatePortfolioItemRequest) => {
    setLoading(true);
    try {
      await createPortfolioItem(data);
      toastService.success("Работа успешно добавлена в портфолио");
      router.push("/portfolio");
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Не удалось создать работу");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Добавить работу в портфолио
      </Typography>
      <CreatePortfolioItemForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </Card>
  );
}


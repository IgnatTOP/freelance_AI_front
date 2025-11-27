"use client";

import { useState } from "react";
import { Card, Typography } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { useRouter } from "next/navigation";
import { CreatePortfolioItemForm } from "./CreatePortfolioItemForm";
import { createPortfolioItem } from "@/src/shared/api/portfolio";
import type { CreatePortfolioItemRequest } from "@/src/entities/portfolio/model/types";

const { Title } = Typography;

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
    <Card>
      <Title level={2} style={{ marginBottom: 24 }}>
        Добавить работу в портфолио
      </Title>
      <CreatePortfolioItemForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </Card>
  );
}


"use client";

import { useState, useEffect } from "react";
import { Typography, Card, Skeleton } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { useRouter, useParams } from "next/navigation";
import { CreatePortfolioItemForm } from "../../create-portfolio-item/ui/CreatePortfolioItemForm";
import { getPortfolioItem, updatePortfolioItem } from "@/src/shared/api/portfolio";
import type { CreatePortfolioItemRequest } from "@/src/entities/portfolio/model/types";

const { Title } = Typography;

export function EditPortfolioItemFeature() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<Partial<CreatePortfolioItemRequest>>();

  useEffect(() => {
    loadPortfolioItem();
  }, [id]);

  const loadPortfolioItem = async () => {
    try {
      setInitialLoading(true);
      const item = await getPortfolioItem(id);
      setInitialValues({
        title: item.title,
        description: item.description || undefined,
        cover_media_id: item.cover_media_id || undefined,
        ai_tags: item.ai_tags || [],
        external_link: item.external_link || undefined,
        media_ids: item.media?.map((m) => m.id) || [],
      });
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Не удалось загрузить работу");
      router.push("/portfolio");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data: CreatePortfolioItemRequest) => {
    setLoading(true);
    try {
      await updatePortfolioItem(id, data);
      toastService.success("Работа успешно обновлена");
      router.push("/portfolio");
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Не удалось обновить работу");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (initialLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={2} style={{ marginBottom: 24 }}>
        Редактировать работу
      </Title>
      <CreatePortfolioItemForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialValues={initialValues}
        portfolioItemId={id}
      />
    </Card>
  );
}


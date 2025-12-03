"use client";

import { PageContainer } from "@/src/shared/ui";
import { CreatePortfolioItemFeature } from "@/src/features/portfolio/create-portfolio-item/ui/CreatePortfolioItemFeature";

export default function CreatePortfolioPage() {
  return (
    <PageContainer title="Добавить работу" subtitle="Покажите свои лучшие проекты" maxWidth="lg">
      <CreatePortfolioItemFeature />
    </PageContainer>
  );
}

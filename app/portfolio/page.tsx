"use client";

import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/src/shared/ui";
import { PortfolioList } from "@/src/features/portfolio/portfolio-list/ui/PortfolioList";

export default function PortfolioPage() {
  const router = useRouter();

  return (
    <PageContainer
      title="Портфолио"
      subtitle="Покажите свои лучшие работы потенциальным заказчикам"
      maxWidth="lg"
      actions={
        <Link href="/portfolio/create" style={{ textDecoration: "none" }}>
          <Button variant="contained" startIcon={<Plus size={18} />}>
            Добавить работу
          </Button>
        </Link>
      }
    >
      <PortfolioList
        onCreateNew={() => router.push("/portfolio/create")}
        onEdit={(id) => router.push(`/portfolio/${id}/edit`)}
      />
    </PageContainer>
  );
}

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/src/shared/ui/Container";
import { CreateOrderFeature } from "@/src/features/orders/create-order";

function CreateOrderPageContent() {
  const searchParams = useSearchParams();
  const isAIMode = searchParams.get("ai") === "true";
  const title = searchParams.get("title") || undefined;
  const description = searchParams.get("description") || undefined;

  return (
    <div className="min-h-screen py-8 relative">
      <Container>
        <CreateOrderFeature
          initialTitle={title}
          initialDescription={description}
          aiMode={isAIMode}
        />
      </Container>
    </div>
  );
}

export default function CreateOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-8 relative">
        <Container>
          <div>Загрузка...</div>
        </Container>
      </div>
    }>
      <CreateOrderPageContent />
    </Suspense>
  );
}
"use client";

import { Layout } from "antd";
import { useRouter } from "next/navigation";
import { PortfolioList } from "@/src/features/portfolio/portfolio-list/ui/PortfolioList";

const { Content } = Layout;

export default function PortfolioPage() {
  const router = useRouter();

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <PortfolioList
          onCreateNew={() => router.push("/portfolio/create")}
          onEdit={(id) => router.push(`/portfolio/${id}/edit`)}
        />
      </Content>
    </Layout>
  );
}



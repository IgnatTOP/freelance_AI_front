"use client";

import { Layout } from "antd";
import { CreatePortfolioItemFeature } from "@/src/features/portfolio/create-portfolio-item/ui/CreatePortfolioItemFeature";

const { Content } = Layout;

export default function CreatePortfolioPage() {
  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <CreatePortfolioItemFeature />
      </Content>
    </Layout>
  );
}



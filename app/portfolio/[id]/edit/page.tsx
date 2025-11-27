"use client";

import { Layout } from "antd";
import { EditPortfolioItemFeature } from "@/src/features/portfolio/edit-portfolio-item/ui/EditPortfolioItemFeature";

const { Content } = Layout;

export default function EditPortfolioPage() {
  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <EditPortfolioItemFeature />
      </Content>
    </Layout>
  );
}



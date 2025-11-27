"use client";

import { Layout } from "antd";
import { EditProfileFeature } from "@/src/features/profile/edit-profile";

const { Content } = Layout;

export default function ProfilePage() {
  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content>
        <EditProfileFeature />
      </Content>
    </Layout>
  );
}

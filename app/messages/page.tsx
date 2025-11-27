"use client";

import { Container } from "@/src/shared/ui/Container";
import { MessageListFeature } from "@/src/features/messages/message-list";

export default function MessagesPage() {
  return (
    <div className="min-h-screen py-8 relative">
      <Container>
        <MessageListFeature />
      </Container>
    </div>
  );
}


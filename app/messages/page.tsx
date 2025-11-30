"use client";

import { Box, Container } from "@mui/material";
import { MessageListFeature } from "@/src/features/messages/message-list";

export default function MessagesPage() {
  return (
    <Box sx={{ minHeight: '100vh', py: 8, position: 'relative' }}>
      <Container maxWidth="lg">
        <MessageListFeature />
      </Container>
    </Box>
  );
}


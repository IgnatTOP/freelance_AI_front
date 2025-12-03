"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { authService } from "@/src/shared/lib/auth/auth.service";
import { getOrderChat } from "@/src/shared/api/conversations";

export default function OrderChatPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }

    const loadChat = async () => {
      try {
        const chatData = await getOrderChat(orderId);
        router.push(`/messages/${chatData.conversation.id}`);
      } catch (error: any) {
        console.error("Error loading chat:", error);
        const errorMessage = error.response?.data?.error || "Не удалось открыть чат";
        
        if (errorMessage.includes("нет принятого исполнителя")) {
          toastService.warning("Для этого заказа нет принятого исполнителя. Сначала примите предложение.");
        } else {
          toastService.error(errorMessage);
        }
        
        router.push(`/orders/${orderId}`);
      }
    };

    loadChat();
  }, [orderId, router]);

  return null;
}

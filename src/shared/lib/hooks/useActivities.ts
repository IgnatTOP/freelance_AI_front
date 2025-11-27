import { useState, useEffect } from "react";
import { notificationService } from "@/src/shared/lib/notifications";
import { safeJsonParse } from "@/src/shared/lib/utils/date-utils";

export interface Activity {
  id: string;
  type:
    | "order_created"
    | "proposal_sent"
    | "proposal_accepted"
    | "message_received"
    | "order_completed"
    | "profile_updated";
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export function useActivities(userRole: "client" | "freelancer" | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const notifications = await notificationService.getNotifications(10, 0, false);
        const activities: Activity[] = notifications.map((notif) => {
          const payload = safeJsonParse<any>(notif.payload, {});
          const eventType = payload.event || payload.type || "";
          let activityType: Activity["type"] = "order_created";
          let title = "Новое событие";
          let description = "";

          if (eventType === "orders.new") {
            activityType = "order_created";
            title = "Создан заказ";
            description = payload.order?.title || "Новый заказ";
          } else if (eventType === "proposals.new") {
            activityType = "proposal_sent";
            title = userRole === "client" ? "Получен отклик" : "Отправлен отклик";
            description = payload.order?.title || "Новый отклик";
            if (userRole === "client" && payload.proposal?.freelancer_name) {
              description = `${payload.proposal.freelancer_name} откликнулся на ваш заказ`;
            }
          } else if (eventType === "proposals.accepted" || eventType === "proposals.sent") {
            activityType = "proposal_accepted";
            title = "Отклик принят";
            description = payload.order?.title || "Отклик принят";
          } else if (eventType === "chat.message") {
            activityType = "message_received";
            title = "Новое сообщение";
            description = payload.order?.title || "Новое сообщение в чате";
          } else if (eventType === "orders.completed") {
            activityType = "order_completed";
            title = "Заказ завершён";
            description = payload.order?.title || "Заказ завершён";
          }

          return {
            id: notif.id,
            type: activityType,
            title,
            description,
            timestamp: notif.created_at,
            user: payload.user ? {
              name: payload.user.display_name || payload.user.name || "Пользователь",
            } : undefined,
          };
        });

        setActivities(activities);
      } catch (error) {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      loadActivities();
    }
  }, [userRole]);

  return { activities, loading };
}

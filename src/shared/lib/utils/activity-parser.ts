import { safeJsonParse } from "./date-utils";

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

interface NotificationPayload {
  event?: string;
  type?: string;
  order?: { title?: string };
  proposal?: { freelancer_name?: string };
  user?: { display_name?: string; name?: string };
}

interface RawNotification {
  id: string;
  payload: string | NotificationPayload;
  created_at: string;
}

/**
 * Parse raw notifications into Activity objects
 */
export function parseActivities(
  notifications: RawNotification[],
  userRole: "client" | "freelancer" | null
): Activity[] {
  if (!notifications || !userRole) return [];

  return notifications.map((notif) => {
    // Handle both string and object payloads
    const payload: NotificationPayload = typeof notif.payload === "string" 
      ? safeJsonParse<NotificationPayload>(notif.payload, {})
      : notif.payload || {};
    
    const eventType = payload.event || payload.type || "";
    
    let activityType: Activity["type"] = "order_created";
    let title = "Новое событие";
    let description = "";

    switch (eventType) {
      case "orders.new":
        activityType = "order_created";
        title = "Создан заказ";
        description = payload.order?.title || "Новый заказ";
        break;
      case "proposals.new":
        activityType = "proposal_sent";
        title = userRole === "client" ? "Получен отклик" : "Отправлен отклик";
        description = payload.order?.title || "Новый отклик";
        if (userRole === "client" && payload.proposal?.freelancer_name) {
          description = `${payload.proposal.freelancer_name} откликнулся на ваш заказ`;
        }
        break;
      case "proposals.accepted":
      case "proposals.sent":
        activityType = "proposal_accepted";
        title = "Отклик принят";
        description = payload.order?.title || "Отклик принят";
        break;
      case "chat.message":
        activityType = "message_received";
        title = "Новое сообщение";
        description = payload.order?.title || "Новое сообщение в чате";
        break;
      case "orders.completed":
        activityType = "order_completed";
        title = "Заказ завершён";
        description = payload.order?.title || "Заказ завершён";
        break;
    }

    return {
      id: notif.id,
      type: activityType,
      title,
      description,
      timestamp: notif.created_at,
      user: payload.user
        ? {
            name: payload.user.display_name || payload.user.name || "Пользователь",
          }
        : undefined,
    };
  });
}

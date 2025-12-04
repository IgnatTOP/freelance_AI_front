import { useState, useEffect } from "react";
import { notificationService } from "@/src/shared/lib/notifications";
import { parseActivities, type Activity } from "@/src/shared/lib/utils/activity-parser";

export type { Activity };

export function useActivities(userRole: "client" | "freelancer" | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      if (!userRole) {
        setLoading(false);
        return;
      }

      try {
        const notifications = await notificationService.getNotifications(10, 0, false);
        setActivities(parseActivities(notifications, userRole));
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [userRole]);

  return { activities, loading };
}

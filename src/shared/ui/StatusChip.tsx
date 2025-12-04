"use client";

import { Chip } from "@mui/material";
import {
  FileEdit,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Hourglass,
  Undo2,
  AlertCircle,
} from "lucide-react";

type OrderStatus = "draft" | "published" | "in_progress" | "pending_completion" | "completed" | "cancelled";
type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";
type EscrowStatus = "held" | "released" | "refunded" | "disputed";
type DisputeStatus = "open" | "under_review" | "resolved_client" | "resolved_freelancer" | "cancelled";

const orderStatusConfig: Record<OrderStatus, { label: string; color: "default" | "info" | "warning" | "success" | "error"; icon: typeof Clock }> = {
  draft: { label: "Черновик", color: "default", icon: FileEdit },
  published: { label: "Опубликован", color: "info", icon: Globe },
  in_progress: { label: "В работе", color: "warning", icon: Clock },
  pending_completion: { label: "Ожидает подтверждения", color: "warning", icon: Hourglass },
  completed: { label: "Завершён", color: "success", icon: CheckCircle },
  cancelled: { label: "Отменён", color: "error", icon: XCircle },
};

const proposalStatusConfig: Record<ProposalStatus, { label: string; color: "default" | "info" | "warning" | "success" | "error"; icon: typeof Clock }> = {
  pending: { label: "Ожидает", color: "info", icon: Hourglass },
  accepted: { label: "Принято", color: "success", icon: CheckCircle },
  rejected: { label: "Отклонено", color: "error", icon: XCircle },
  withdrawn: { label: "Отозвано", color: "default", icon: Undo2 },
};

const escrowStatusConfig: Record<EscrowStatus, { label: string; color: "default" | "info" | "warning" | "success" | "error"; icon: typeof Clock }> = {
  held: { label: "Заморожено", color: "warning", icon: Clock },
  released: { label: "Выплачено", color: "success", icon: CheckCircle },
  refunded: { label: "Возвращено", color: "info", icon: Undo2 },
  disputed: { label: "Спор", color: "error", icon: AlertCircle },
};

const disputeStatusConfig: Record<DisputeStatus, { label: string; color: "default" | "info" | "warning" | "success" | "error"; icon: typeof Clock }> = {
  open: { label: "Открыт", color: "error", icon: AlertCircle },
  under_review: { label: "На рассмотрении", color: "warning", icon: Clock },
  resolved_client: { label: "В пользу заказчика", color: "success", icon: CheckCircle },
  resolved_freelancer: { label: "В пользу исполнителя", color: "success", icon: CheckCircle },
  cancelled: { label: "Отменён", color: "default", icon: XCircle },
};

interface StatusChipProps {
  status: string;
  type?: "order" | "proposal" | "escrow" | "dispute";
  size?: "small" | "medium";
  showIcon?: boolean;
}

export function StatusChip({ status, type = "order", size = "small", showIcon = true }: StatusChipProps) {
  let config;
  
  switch (type) {
    case "order":
      config = orderStatusConfig[status as OrderStatus];
      break;
    case "proposal":
      config = proposalStatusConfig[status as ProposalStatus];
      break;
    case "escrow":
      config = escrowStatusConfig[status as EscrowStatus];
      break;
    case "dispute":
      config = disputeStatusConfig[status as DisputeStatus];
      break;
  }
  
  if (!config) {
    return (
      <Chip
        label={status}
        color="default"
        size={size}
        sx={{ fontWeight: 500 }}
      />
    );
  }

  const Icon = config.icon;

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={showIcon ? <Icon size={14} /> : undefined}
      sx={{ fontWeight: 500 }}
    />
  );
}

"use client";

import { Card, Typography, Space, Tag } from "antd";
import { Code, FileText, Sparkles } from "lucide-react";
import type { Order } from "@/src/entities/order/model/types";
import { getMediaUrl } from "@/src/shared/lib/api/axios";

const { Title, Text, Paragraph } = Typography;

interface OrderDetailContentProps {
  order: Order;
}

export function OrderDetailContent({ order }: OrderDetailContentProps) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <Card>
        <Title level={4} className="mb-4">Описание</Title>
        <Paragraph className="whitespace-pre-wrap">
          {order.description}
        </Paragraph>
      </Card>

      {/* AI Summary */}
      {(order.summary || order.ai_summary) && (
        <Card className="border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-primary" />
            <Title level={5} className="mb-0">AI Резюме</Title>
          </div>
          <Text className="text-sm">{order.summary || order.ai_summary}</Text>
        </Card>
      )}

      {/* Requirements */}
      {order.requirements && order.requirements.length > 0 && (
        <Card>
          <Title level={4} className="mb-4 flex items-center gap-2">
            <Code size={20} />
            Требуемые навыки
          </Title>
          <Space wrap>
            {order.requirements.map((req, idx) => (
              <Tag key={idx} color="blue" className="text-sm py-1 px-3">
                {req.skill}
                {req.level !== "middle" && (
                  <span className="ml-1 opacity-70">
                    ({req.level === "junior" ? "начинающий" : req.level === "senior" ? "опытный" : "средний"})
                  </span>
                )}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* Attachments */}
      {order.attachments && order.attachments.length > 0 && (
        <Card>
          <Title level={4} className="mb-4 flex items-center gap-2">
            <FileText size={20} />
            Прикрепленные файлы
          </Title>
          <div className="space-y-2">
            {order.attachments.map((att) => {
              const fileUrlRaw = att.url || att.media?.file_path;
              const filename = att.filename || att.media?.file_path?.split("/").pop() || `Файл ${att.id.substring(0, 8)}`;
              const mediaUrl = fileUrlRaw ? getMediaUrl(fileUrlRaw) ?? undefined : undefined;
              return (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 bg-background-elevated rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    <Text>{filename}</Text>
                  </div>
                  {mediaUrl && (
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Открыть
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}


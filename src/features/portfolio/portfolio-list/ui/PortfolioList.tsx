"use client";

import { useState, useEffect } from "react";
import { Card, Row, Col, Button, Empty, Skeleton, Modal, Space, Tag, Typography } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { Plus, Edit, Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMyPortfolio, deletePortfolioItem } from "@/src/shared/api/portfolio";
import type { PortfolioItem } from "@/src/entities/portfolio/model/types";
import { getMediaUrl } from "@/src/shared/lib/api/axios";

const { Text, Title, Paragraph } = Typography;

interface PortfolioListProps {
  onCreateNew?: () => void;
  onEdit?: (id: string) => void;
}

export function PortfolioList({ onCreateNew, onEdit }: PortfolioListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await getMyPortfolio();
      setPortfolio(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Не удалось загрузить портфолио");
      setPortfolio([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deletePortfolioItem(itemToDelete);
      toastService.success("Работа удалена из портфолио");
      loadPortfolio();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Не удалось удалить работу");
    }
  };

  const getCoverImageUrl = (item: PortfolioItem) => {
    if (item.cover_media_id && item.media) {
      const coverMedia = item.media.find((m) => m.id === item.cover_media_id);
      if (coverMedia) {
        return getMediaUrl(coverMedia.file_path);
      }
    }
    if (item.media && item.media.length > 0) {
      return getMediaUrl(item.media[0].file_path);
    }
    return null;
  };

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[1, 2, 3].map((i) => (
          <Col xs={24} sm={12} md={8} key={i}>
            <Card>
              <Skeleton.Image active style={{ width: "100%", height: 200 }} />
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={3} style={{ margin: 0 }}>
          Моё портфолио
        </Title>
        {onCreateNew && (
          <Button type="primary" icon={<Plus size={16} />} onClick={onCreateNew}>
            Добавить работу
          </Button>
        )}
      </div>

      {!portfolio || portfolio.length === 0 ? (
        <Card>
          <Empty
            description="У вас пока нет работ в портфолио"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {onCreateNew && (
              <Button type="primary" icon={<Plus size={16} />} onClick={onCreateNew}>
                Добавить первую работу
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {portfolio.map((item) => {
            const coverUrl = getCoverImageUrl(item);
            return (
              <Col xs={24} sm={12} md={8} key={item.id}>
                <Card
                  hoverable
                  cover={
                    coverUrl ? (
                      <div style={{ height: 200, overflow: "hidden" }}>
                        <img
                          alt={item.title}
                          src={coverUrl}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: 200,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f0f0f0",
                        }}
                      >
                        <ImageIcon size={48} color="#999" />
                      </div>
                    )
                  }
                  actions={[
                    onEdit && (
                      <Button
                        key="edit"
                        type="text"
                        icon={<Edit size={16} />}
                        onClick={() => onEdit(item.id)}
                      >
                        Редактировать
                      </Button>
                    ),
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDelete(item.id)}
                    >
                      Удалить
                    </Button>,
                  ].filter(Boolean)}
                >
                  <Card.Meta
                    title={
                      <div>
                        <Text strong style={{ fontSize: 16 }}>
                          {item.title}
                        </Text>
                        {item.external_link && (
                          <a
                            href={item.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: 8 }}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        {item.description && (
                          <Typography.Paragraph
                            ellipsis={{ rows: 2, expandable: false }}
                            type="secondary"
                            style={{ marginBottom: 8 }}
                          >
                            {item.description}
                          </Typography.Paragraph>
                        )}
                        {item.ai_tags && item.ai_tags.length > 0 && (
                          <Space wrap size={[4, 4]}>
                            {item.ai_tags.map((tag, idx) => (
                              <Tag key={idx} color="blue" style={{ margin: 0 }}>
                                {tag}
                              </Tag>
                            ))}
                          </Space>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Delete Modal */}
      <Modal
        open={deleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        okText="Удалить"
        cancelText="Отмена"
        okType="danger"
        title="Удалить работу из портфолио?"
      >
        <p>Это действие нельзя отменить.</p>
      </Modal>
    </div>
  );
}


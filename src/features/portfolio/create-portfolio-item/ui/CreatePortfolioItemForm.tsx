"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Space, Upload, Typography, Tag, Card } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { UploadOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { CheckCircle2, X } from "lucide-react";
import { uploadPhoto } from "@/src/shared/api/media";
import { getMediaUrl } from "@/src/shared/lib/api/axios";
import type { CreatePortfolioItemRequest, PortfolioItemWithMedia } from "@/src/entities/portfolio/model/types";
import { getPortfolioItem } from "@/src/shared/api/portfolio";
import { AIAssistantInline } from "@/src/shared/ui/AIAssistantInline";
import { aiService } from "@/src/shared/lib/ai/ai.service";

const { TextArea } = Input;
const { Text, Title } = Typography;

interface CreatePortfolioItemFormProps {
  onSubmit: (data: CreatePortfolioItemRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: Partial<CreatePortfolioItemRequest>;
  portfolioItemId?: string; // ID для загрузки существующих медиа
}

interface UploadedMedia {
  id: string;
  file_path: string;
  file_type: string;
  preview?: string;
}

export function CreatePortfolioItemForm({
  onSubmit,
  onCancel,
  loading,
  initialValues,
  portfolioItemId,
}: CreatePortfolioItemFormProps) {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [mediaList, setMediaList] = useState<UploadedMedia[]>([]);
  const [coverMediaId, setCoverMediaId] = useState<string | undefined>(
    initialValues?.cover_media_id
  );
  const [tags, setTags] = useState<string[]>(initialValues?.ai_tags || []);
  const [tagInput, setTagInput] = useState("");

  // Отслеживаем изменения title для реактивного обновления кнопки AI
  const title = Form.useWatch("title", form);

  // Загружаем существующие медиа файлы при редактировании
  useEffect(() => {
    if (portfolioItemId && initialValues?.media_ids && initialValues.media_ids.length > 0) {
      loadExistingMedia();
    }
  }, [portfolioItemId, initialValues?.media_ids]);

  const loadExistingMedia = async () => {
    if (!portfolioItemId) return;
    try {
      const item = await getPortfolioItem(portfolioItemId);
      if (item.media && item.media.length > 0) {
        const existingMedia: UploadedMedia[] = item.media.map((m) => ({
          id: m.id,
          file_path: m.file_path,
          file_type: m.file_type,
          preview: getMediaUrl(m.file_path) || undefined,
        }));
        setMediaList(existingMedia);
        if (item.cover_media_id && !coverMediaId) {
          setCoverMediaId(item.cover_media_id);
        }
      }
    } catch (error) {
      console.error("Failed to load existing media:", error);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const response = await uploadPhoto(file);
      const newMedia: UploadedMedia = {
        id: response.id,
        file_path: response.file_path,
        file_type: response.file_type,
        preview: getMediaUrl(response.file_path) || undefined,
      };
      setMediaList([...mediaList, newMedia]);
      if (!coverMediaId) {
        setCoverMediaId(response.id);
      }
      toastService.success("Файл успешно загружен");
      return false;
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка загрузки файла");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMediaList(mediaList.filter((m) => m.id !== mediaId));
    if (coverMediaId === mediaId) {
      setCoverMediaId(mediaList.length > 1 ? mediaList[0]?.id : undefined);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit({
        title: values.title,
        description: values.description || undefined,
        cover_media_id: coverMediaId || undefined,
        ai_tags: tags,
        external_link: values.external_link || undefined,
        media_ids: mediaList.map((m) => m.id),
      });
    } catch (error) {
      // Ошибка обрабатывается в родительском компоненте
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={initialValues}>
      <Form.Item
        name="title"
        label="Название работы"
        rules={[{ required: true, message: "Введите название работы" }]}
      >
        <Input placeholder="Например: Веб-сайт для компании X" size="large" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Описание"
        extra={
          <div style={{ marginTop: 8 }}>
            <AIAssistantInline
              onImprove={async (onChunk) => {
                const currentTitle = title || "";
                const description = form.getFieldValue("description") || "";
                if (!currentTitle || currentTitle.trim().length === 0) {
                  toastService.warning("Сначала введите название работы");
                  return;
                }
                await aiService.improvePortfolioStream(
                  {
                    title: currentTitle,
                    description: description || "Описание проекта",
                    ai_tags: tags,
                  },
                  onChunk
                );
              }}
              onApply={(text) => {
                form.setFieldValue("description", text);
              }}
              disabled={!title || title.trim().length === 0}
            />
          </div>
        }
      >
        <TextArea
          rows={4}
          placeholder="Опишите проект, используемые технологии, результаты..."
          showCount
          maxLength={2000}
        />
      </Form.Item>

      <Form.Item label="Медиа файлы">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Upload
            beforeUpload={handleFileUpload}
            fileList={[]}
            accept="image/*"
            multiple
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} disabled={uploading} loading={uploading}>
              {uploading ? "Загрузка..." : "Загрузить изображения"}
            </Button>
          </Upload>

          {mediaList.length > 0 && (
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                Выберите обложку (клик по изображению)
              </Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {mediaList.map((media) => {
                  const isCover = coverMediaId === media.id;
                  return (
                    <div
                      key={media.id}
                      style={{
                        position: "relative",
                        width: 120,
                        height: 120,
                        border: isCover ? "3px solid var(--primary)" : "1px solid #d9d9d9",
                        borderRadius: 8,
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                      onClick={() => setCoverMediaId(media.id)}
                    >
                      {media.preview && (
                        <img
                          src={media.preview}
                          alt="Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                      {isCover && (
                        <div
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            background: "var(--primary)",
                            borderRadius: "50%",
                            width: 24,
                            height: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CheckCircle2 size={16} color="white" />
                        </div>
                      )}
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        style={{
                          position: "absolute",
                          bottom: 4,
                          right: 4,
                          background: "rgba(255, 255, 255, 0.9)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMedia(media.id);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Space>
      </Form.Item>

      <Form.Item label="Теги">
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Добавить тег"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onPressEnter={handleAddTag}
            />
            <Button icon={<PlusOutlined />} onClick={handleAddTag}>
              Добавить
            </Button>
          </Space.Compact>
          {tags.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleRemoveTag(tag)}
                    color="blue"
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </Space>
      </Form.Item>

      <Form.Item name="external_link" label="Внешняя ссылка">
        <Space.Compact style={{ width: "100%" }}>
          <span style={{ display: "flex", alignItems: "center", padding: "0 11px", background: "rgba(0, 0, 0, 0.02)", border: "1px solid #d9d9d9", borderRight: "none", borderRadius: "6px 0 0 6px" }}>URL</span>
          <Input
            placeholder="https://example.com"
            style={{ flex: 1 }}
          />
        </Space.Compact>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space size={12} style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={onCancel} size="large" style={{ minWidth: 120 }}>
            Отмена
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            icon={<CheckCircle2 size={16} />}
            style={{ minWidth: 200 }}
          >
            Сохранить
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}


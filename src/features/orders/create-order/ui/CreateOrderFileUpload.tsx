"use client";

import { Upload, Button, Space, Typography, List } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import { uploadPhoto } from "@/src/shared/api/media";
import { toastService } from "@/src/shared/lib/toast";

const { Text } = Typography;

interface CreateOrderFileUploadProps {
  attachments: string[];
  onAttachmentsChange: (attachments: string[]) => void;
}

export function CreateOrderFileUpload({
  attachments,
  onAttachmentsChange,
}: CreateOrderFileUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const response = await uploadPhoto(file);
      onAttachmentsChange([...attachments, response.id]);
      toastService.success("Файл успешно загружен");
      return false; // Предотвращаем автоматическую загрузку
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка загрузки файла");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (mediaId: string) => {
    onAttachmentsChange(attachments.filter((id) => id !== mediaId));
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Upload
        beforeUpload={handleFileUpload}
        fileList={[]}
        accept="image/*,.pdf,.doc,.docx"
        multiple
        showUploadList={false}
      >
        <Button 
          icon={<UploadOutlined />} 
          disabled={uploading}
          loading={uploading}
        >
          {uploading ? 'Загрузка...' : 'Выбрать файлы'}
        </Button>
      </Upload>

      {attachments.length > 0 && (
        <List
          size="small"
          dataSource={attachments}
          renderItem={(id) => (
            <List.Item
              actions={[
                <Button
                  key="delete"
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveAttachment(id)}
                />
              ]}
            >
              <Text style={{ fontSize: '13px' }}>Файл {id.substring(0, 8)}...</Text>
            </List.Item>
          )}
          style={{
            background: 'var(--primary-05)',
            borderRadius: '8px',
            padding: '8px',
          }}
        />
      )}
    </Space>
  );
}


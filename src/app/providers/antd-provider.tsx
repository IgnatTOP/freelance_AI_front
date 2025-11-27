'use client';

import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider, theme, App } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { ReactNode } from 'react';

const darkGreenTheme = {
  token: {
    colorPrimary: '#14b8a6',
    colorSuccess: '#0d9488',
    colorWarning: '#fbbf24',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    colorBgBase: '#0a1110',
    colorBgContainer: '#0d1615',
    colorBgElevated: '#111a19',
    colorBgLayout: '#0a1110',
    colorBorder: '#1f2e2c',
    colorBorderSecondary: '#1a2725',
    colorText: '#f0fdfa',
    colorTextSecondary: '#ccfbf1',
    colorTextTertiary: '#99f6e4',
    colorTextQuaternary: '#5eead4',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 13,
    fontSizeXL: 18,
    borderRadius: 12,
    wireframe: false,
    fontFamily: 'var(--font-inter)',
  },
  components: {
    Card: {
      headerFontSize: 15,
      headerFontSizeSM: 14,
    },
    Typography: {
      titleMarginBottom: 8,
      titleMarginTop: 0,
    },
    Form: {
      labelFontSize: 13,
      itemMarginBottom: 20,
    },
    Button: {
      fontSize: 14,
      fontSizeLG: 15,
      controlHeight: 40,
      controlHeightLG: 48,
    },
    Modal: {
      contentBg: '#0d1615',
      headerBg: '#0d1615',
      titleColor: '#f0fdfa',
      titleFontSize: 16,
      titleLineHeight: 1.5,
    },
    Message: {
      contentBg: '#0d1615',
      colorBgElevated: '#111a19',
      colorText: '#f0fdfa',
      colorTextHeading: '#f0fdfa',
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      padding: 16,
    },
    Notification: {
      contentBg: '#0d1615',
      colorBgElevated: '#111a19',
      colorText: '#f0fdfa',
      colorTextHeading: '#f0fdfa',
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      padding: 16,
    },
  },
  algorithm: theme.darkAlgorithm,
};

interface AntdProviderProps {
  children: ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={darkGreenTheme}>
        <App>
          {children}
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}

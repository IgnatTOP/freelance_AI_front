/**
 * API для верификации
 */

import api from "../lib/api/axios";
import type {
  VerificationStatus,
  VerifyCodeRequest,
  VerifyCodeResponse,
  SendCodeResponse,
} from "@/src/entities/verification/model/types";

/**
 * Отправить код на email
 */
export const sendEmailCode = async (): Promise<SendCodeResponse> => {
  const response = await api.post<SendCodeResponse>("/verification/email/send");
  return response.data;
};

/**
 * Отправить код на телефон
 */
export const sendPhoneCode = async (): Promise<SendCodeResponse> => {
  const response = await api.post<SendCodeResponse>("/verification/phone/send");
  return response.data;
};

/**
 * Подтвердить код
 */
export const verifyCode = async (data: VerifyCodeRequest): Promise<VerifyCodeResponse> => {
  const response = await api.post<VerifyCodeResponse>("/verification/verify", data);
  return response.data;
};

/**
 * Получить статус верификации
 */
export const getVerificationStatus = async (): Promise<VerificationStatus> => {
  const response = await api.get<VerificationStatus>("/verification/status");
  return response.data;
};

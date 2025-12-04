/**
 * Типы данных для верификации
 */

export type VerificationType = "email" | "phone";

export interface VerificationStatus {
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified: boolean;
}

export interface VerifyCodeRequest {
  type: VerificationType;
  code: string;
}

export interface VerifyCodeResponse {
  verified: boolean;
}

export interface SendCodeResponse {
  message: string;
  code?: string; // Только в development
}

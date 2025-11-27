import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /**
     * Пропустить автоматическое показывание тоста для этого запроса
     */
    skipToast?: boolean;
  }
}



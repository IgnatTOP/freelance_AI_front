/**
 * Сервис для работы с Server-Sent Events (SSE) стримингом
 */

export interface SSEOptions {
  onMessage?: (data: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  onData?: (data: any) => void; // Для структурированных данных (event: data)
}

export class SSEService {
  /**
   * Создает SSE соединение для стриминга (GET запросы)
   * Использует fetch вместо EventSource для поддержки заголовков авторизации
   */
  async stream(
    url: string,
    options: SSEOptions = {}
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          reject(new Error("Токен не найден"));
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        const fullUrl = `${apiUrl}${url}`;

        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        if (!reader) {
          reject(new Error("Response body is not readable"));
          return;
        }

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Обрабатываем остатки буфера только если они содержат полные SSE сообщения
            if (buffer.trim()) {
              const lines = buffer.split("\n\n");
              for (const line of lines) {
                if (line.trim() && line.startsWith("data: ")) {
                  const rawData = line.slice(6).replace(/\r+$/, "").trimEnd();
                  if (rawData && rawData !== "[DONE]" && options.onMessage) {
                    options.onMessage(rawData);
                  }
                }
              }
            }
            if (options.onComplete) {
              options.onComplete();
            }
            resolve();
            break;
          }

          // Декодируем чанк (TextDecoder с stream: true правильно обрабатывает UTF-8)
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.startsWith("event: ")) {
              const eventType = line.slice(7).trim();
              const nextLine = lines[i + 1];
              
              if (nextLine?.startsWith("data: ")) {
                const data = nextLine.slice(6);
                
                if (eventType === "data") {
                  try {
                    const parsedData = JSON.parse(data);
                    if (options.onData) {
                      options.onData(parsedData);
                    }
                  } catch (e) {
                    console.error("Failed to parse SSE data:", e);
                  }
                } else if (eventType === "error") {
                  const error = new Error(data);
                  if (options.onError) {
                    options.onError(error);
                  }
                  reject(error);
                  return;
                } else if (eventType === "done") {
                  if (options.onComplete) {
                    options.onComplete();
                  }
                  resolve();
                  return;
                }
              }
              i++; // Skip the data line
            } else if (line.startsWith("data: ")) {
              // Извлекаем данные после "data: "
              const rawData = line.slice(6);
              // Убираем только завершающие символы \r и пробелы
              const data = rawData.replace(/\r+$/, "").trimEnd();
              // Пропускаем пустые данные и маркер завершения
              if (data && data !== "[DONE]" && options.onMessage) {
                // Передаем чанк как есть - бэкенд уже правильно форматирует с UTF-8
                // Каждый чанк должен просто добавляться к предыдущему тексту
                options.onMessage(data);
              }
            }
          }
        }
      } catch (error) {
        if (options.onError) {
          options.onError(error as Error);
        }
        reject(error);
      }
    });
  }

  /**
   * Создает SSE соединение для POST запросов (используя fetch)
   */
  async streamPost(
    url: string,
    body: any,
    options: SSEOptions = {}
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          reject(new Error("Токен не найден"));
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        const fullUrl = `${apiUrl}${url}`;

        const response = await fetch(fullUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          // Пытаемся прочитать сообщение об ошибке из ответа
          try {
            const errorData = await response.json();
            const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
          } catch (e) {
            // Если не удалось прочитать JSON, используем стандартное сообщение
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        if (!reader) {
          reject(new Error("Response body is not readable"));
          return;
        }

        let buffer = "";
        let hasReceivedData = false;

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Обрабатываем остатки буфера только если они содержат полные SSE сообщения
            if (buffer.trim()) {
              const lines = buffer.split("\n\n");
              for (const line of lines) {
                if (line.trim() && line.startsWith("data: ")) {
                  const rawData = line.slice(6).replace(/\r+$/, "").trimEnd();
                  if (rawData && rawData !== "[DONE]") {
                    hasReceivedData = true;
                    if (options.onMessage) {
                      options.onMessage(rawData);
                    }
                  }
                }
              }
            }
            if (!hasReceivedData) {
              console.warn("SSE stream completed without receiving any data");
            }
            if (options.onComplete) {
              options.onComplete();
            }
            resolve();
            break;
          }

          // Декодируем чанк (TextDecoder с stream: true правильно обрабатывает UTF-8)
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.startsWith("event: ")) {
              const eventType = line.slice(7).trim();
              const nextLine = lines[i + 1];
              
              if (nextLine?.startsWith("data: ")) {
                const data = nextLine.slice(6);
                
                if (eventType === "data") {
                  try {
                    const parsedData = JSON.parse(data);
                    if (options.onData) {
                      options.onData(parsedData);
                    }
                  } catch (e) {
                    console.error("Failed to parse SSE data:", e);
                  }
                } else if (eventType === "error") {
                  const error = new Error(data);
                  console.error("SSE error event received:", data);
                  if (options.onError) {
                    options.onError(error);
                  }
                  reject(error);
                  return;
                } else if (eventType === "done") {
                  if (options.onComplete) {
                    options.onComplete();
                  }
                  resolve();
                  return;
                }
              }
              i++; // Skip the data line
            } else if (line.startsWith("data: ")) {
              // Извлекаем данные после "data: "
              const rawData = line.slice(6);
              // Убираем только завершающие символы \r и пробелы
              const data = rawData.replace(/\r+$/, "").trimEnd();
              // Пропускаем пустые данные и маркер завершения
              if (data && data !== "[DONE]") {
                hasReceivedData = true;
                if (options.onMessage) {
                  // Передаем чанк как есть - бэкенд уже правильно форматирует с UTF-8
                  // Каждый чанк должен просто добавляться к предыдущему тексту
                  options.onMessage(data);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("SSE streamPost error:", error);
        if (options.onError) {
          options.onError(error as Error);
        }
        reject(error);
      }
    });
  }

  /**
   * Закрывает SSE соединение (заглушка для совместимости)
   */
  close() {
    // Соединения закрываются автоматически при завершении Promise
  }
}

export const sseService = new SSEService();


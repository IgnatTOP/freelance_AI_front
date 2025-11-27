/**
 * Утилиты для работы с AI ответами
 */

/**
 * Парсит JSON ответ от AI, обрабатывая различные форматы
 * Поддерживает:
 * - Прямой JSON
 * - JSON в markdown code blocks (```json ... ```)
 * - JSON объекты внутри текста (через баланс скобок)
 * - JSON массивы внутри текста
 */
export function parseAIResponse(response: string): any {
  let jsonStr = response.trim();
  
  // Пытаемся распарсить напрямую
  try {
    return JSON.parse(jsonStr);
  } catch {
    // Убираем markdown code blocks если есть
    if (jsonStr.includes("```")) {
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        try {
          return JSON.parse(codeBlockMatch[1].trim());
        } catch {
          // Продолжаем дальше
        }
      }
    }
    
    // Ищем JSON объект внутри текста через баланс скобок
    const jsonStart = jsonStr.indexOf("{");
    if (jsonStart !== -1) {
      let braceCount = 0;
      let lastBraceIndex = -1;
      
      for (let i = jsonStart; i < jsonStr.length; i++) {
        if (jsonStr[i] === "{") braceCount++;
        else if (jsonStr[i] === "}") {
          braceCount--;
          if (braceCount === 0) {
            lastBraceIndex = i;
            break;
          }
        }
      }
      
      // Если JSON неполный, добавляем закрывающие скобки
      if (braceCount > 0 && lastBraceIndex === -1) {
        while (braceCount > 0) {
          jsonStr += "}";
          braceCount--;
        }
        lastBraceIndex = jsonStr.length - 1;
      }
      
      if (lastBraceIndex !== -1 && lastBraceIndex > jsonStart) {
        const extractedJson = jsonStr.substring(jsonStart, lastBraceIndex + 1);
        try {
          return JSON.parse(extractedJson);
        } catch {
          // Продолжаем попытки парсинга другими способами
        }
      }
    }
    
    // Для массивов
    const arrayStart = jsonStr.indexOf("[");
    if (arrayStart !== -1) {
      let bracketCount = 0;
      let lastBracketIndex = -1;
      
      for (let i = arrayStart; i < jsonStr.length; i++) {
        if (jsonStr[i] === "[") bracketCount++;
        else if (jsonStr[i] === "]") {
          bracketCount--;
          if (bracketCount === 0) {
            lastBracketIndex = i;
            break;
          }
        }
      }
      
      if (lastBracketIndex !== -1 && lastBracketIndex > arrayStart) {
        const extractedJson = jsonStr.substring(arrayStart, lastBracketIndex + 1);
        try {
          return JSON.parse(extractedJson);
        } catch {
          // Продолжаем попытки парсинга другими способами
        }
      }
    }
  }
  
  return null;
}

/**
 * Очищает текст от UUID и других технических деталей
 * Удаляет:
 * - UUID (формат: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
 * - JSON объекты и массивы
 * - Технические ключи (recommended_order_ids и т.д.)
 */
export function cleanExplanationText(text: string): string {
  if (!text) return "";
  
  let cleaned = text;
  
  // Удаляем полные UUID (формат: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  cleaned = cleaned.replace(uuidRegex, '');
  
  // Удаляем короткие UUID без дефисов (например, "ff36781f94cd", "1a---")
  cleaned = cleaned.replace(/[0-9a-f]{8,12}/gi, '');
  cleaned = cleaned.replace(/[0-9a-f]{1,2}-{2,}/gi, '');
  
  // Удаляем JSON объекты и массивы полностью (включая вложенные)
  cleaned = cleaned.replace(/\{[\s\S]*?\}/g, '');
  cleaned = cleaned.replace(/\[[\s\S]*?\]/g, '');
  
  // Удаляем JSON-подобные структуры с пустыми строками: "" "" "" "" ""
  cleaned = cleaned.replace(/""\s*""(\s*"")*/g, '');
  
  // Удаляем ключи JSON и их значения (например: "key": "value")
  cleaned = cleaned.replace(/"[^"]*"\s*:\s*"[^"]*"/g, '');
  cleaned = cleaned.replace(/[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*"[^"]*"/g, '');
  
  // Удаляем технические ключи
  cleaned = cleaned.replace(/recommended_order_ids/gi, '');
  cleaned = cleaned.replace(/explanation/gi, '');
  
  // Удаляем одиночные кавычки и запятые, которые остались
  cleaned = cleaned.replace(/^["'\s,]+|["'\s,]+$/g, '');
  cleaned = cleaned.replace(/["']+/g, '');
  
  // Восстанавливаем пробелы между словами (убираем слипшиеся слова)
  // Добавляем пробел между строчной и заглавной буквой (но не внутри слова)
  cleaned = cleaned.replace(/([а-яёa-z])([А-ЯЁA-Z][а-яёa-z]+)/g, '$1 $2');
  // Добавляем пробел между буквой и цифрой
  cleaned = cleaned.replace(/([а-яёa-zА-ЯЁA-Z])(\d)/g, '$1 $2');
  cleaned = cleaned.replace(/(\d)([а-яёa-zА-ЯЁA-Z])/g, '$1 $2');
  // Добавляем пробел после точки/запятой, если его нет
  cleaned = cleaned.replace(/([.,:;!?])([а-яёa-zА-ЯЁA-Z])/g, '$1 $2');
  
  // Восстанавливаем пробелы в очевидных случаях
  // "Явыбрал" -> "Я выбрал", "своевремя" -> "свое время"
  cleaned = cleaned.replace(/([Яя])(выбрал|выбрала|поставил|поставила|сделал|сделала|создал|создала|написал|написала|использовал|использовала)/gi, '$1 $2');
  cleaned = cleaned.replace(/([а-яё]+)([Вв]еб|[Ээ]лектронн|[Кк]оммерц|[Пп]риложени|[Рр]азработк|[Оо]птимизац|[вв]ремя|[сс]вое|[сс]вой)/g, '$1 $2');
  
  // Удаляем множественные пробелы и переносы строк
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n\s*\n/g, '\n');
  
  // Удаляем лишние запятые и точки, которые могли остаться
  cleaned = cleaned.replace(/[,\.]\s*[,\.]+/g, '.');
  cleaned = cleaned.replace(/\s+[,\.]/g, '.');
  cleaned = cleaned.replace(/[,\.]\s+/g, ' ');
  
  // Удаляем символы в начале/конце строк
  cleaned = cleaned.replace(/^[,\.\s\-–—]+/, '');
  cleaned = cleaned.replace(/[,\.\s\-–—]+$/, '');
  
  // Удаляем множественные дефисы и тире
  cleaned = cleaned.replace(/[-–—]{2,}/g, '');
  
  return cleaned.trim();
}


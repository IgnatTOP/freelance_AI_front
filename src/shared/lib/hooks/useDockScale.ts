/**
 * Утилита для расчета масштаба элементов macOS Dock при наведении
 */

/**
 * Рассчитывает масштаб элемента dock на основе расстояния до наведенного элемента
 * 
 * @example
 * const scale = calculateDockScale(2, 1); // 1.15
 */
export function calculateDockScale(
  hoveredIndex: number | null,
  currentIndex: number
): number {
  if (hoveredIndex === null) return 1;
  
  const distance = Math.abs(hoveredIndex - currentIndex);
  
  if (distance === 0) return 1.25; // Наведенный элемент
  if (distance === 1) return 1.15; // Соседний элемент
  if (distance === 2) return 1.08; // Через один
  if (distance === 3) return 1.03; // Через два
  
  return 1;
}


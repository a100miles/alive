export function boundedIndex(index: number, length: number) {
  return Math.max(0, Math.min(index, Math.max(0, length - 1)))
}
export function nearestCenter(centers: number[], viewportCenter: number) {
  if (!centers.length) return 0
  return centers.reduce((best, value, i) => Math.abs(value - viewportCenter) < Math.abs(centers[best] - viewportCenter) ? i : best, 0)
}

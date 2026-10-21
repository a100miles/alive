import { describe, expect, it } from 'vitest'
import { boundedIndex, nearestCenter } from './navigation'
describe('gallery navigation', () => {
  it('keeps empty, first and last selections inside the collection', () => {
    expect(boundedIndex(-1, 6)).toBe(0)
    expect(boundedIndex(6, 6)).toBe(5)
    expect(boundedIndex(3, 0)).toBe(0)
  })
  it('finds the nearest image for mixed portrait and landscape widths', () => {
    expect(nearestCenter([260, 900, 1260], 1120)).toBe(2)
    expect(nearestCenter([260, 900, 1260], 1000)).toBe(1)
    expect(nearestCenter([], 100)).toBe(0)
  })
})

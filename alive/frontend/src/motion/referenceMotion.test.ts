import { describe, expect, it } from 'vitest'
import { aperturePath, discPose, modulo, reelPose, relativeIndex } from './referenceMotion'
describe('reconstructed spatial behavior',()=>{
  it('keeps the current release at the origin and changes depth along the diagonal',()=>{
    const current=discPose(0,1440,812)
    expect(current.x).toBeCloseTo(0);expect(current.y).toBeCloseTo(0);expect(current.scale).toBe(1)
    const previous=discPose(-1,1440,812), next=discPose(1,1440,812)
    expect(previous.x).toBeLessThan(0);expect(previous.y).toBeGreaterThan(0);expect(previous.scale).toBeLessThan(1)
    expect(next.x).toBeGreaterThan(0);expect(next.y).toBeLessThan(0);expect(next.scale).toBeGreaterThan(1)
  })
  it('changes the mobile neighbor topology, not just the desktop scale',()=>{
    const neighbor=discPose(1,390,768)
    expect(neighbor.x).toBeGreaterThan(0);expect(neighbor.y).toBeGreaterThan(0);expect(neighbor.scale).toBeLessThan(.5)
  })
  it('wraps negative reel positions and keeps adjacent planes continuous at the seam',()=>{
    expect(modulo(-1,6)).toBe(5)
    expect(relativeIndex(0,5.9,6)).toBeCloseTo(.1)
    expect(relativeIndex(5,.1,6)).toBeCloseTo(-1.1)
    expect(relativeIndex(0,0,0)).toBe(0)
    const before=reelPose(-1,1440,812), after=reelPose(1,1440,812)
    expect(before.x).toBeGreaterThan(0);expect(before.y).toBeLessThan(0)
    expect(after.x).toBeLessThan(0);expect(after.y).toBeGreaterThan(0)
  })
  it('starts with a closed aperture and covers all corners at completion',()=>{
    expect(aperturePath(0,1440,900)).toContain('M720.00,450.00')
    const points=aperturePath(1,1440,900).match(/-?\d+\.\d+/g)!.map(Number)
    const xs=points.filter((_,i)=>i%2===0),ys=points.filter((_,i)=>i%2===1)
    expect(Math.min(...xs)).toBeLessThan(0);expect(Math.max(...xs)).toBeGreaterThan(1440)
    expect(Math.min(...ys)).toBeLessThan(0);expect(Math.max(...ys)).toBeGreaterThan(900)
  })
})

// Original reconstruction. Bounds/curves are calibrated estimates from the
// recorded WebGL output; see docs/reference-interactions.md, not vendor source.
export const motion = { settle: 1.05, follow: .14, projectionMs: 150, portal: .8 } as const
export const modulo = (value: number, count: number) => count > 0 ? ((value % count) + count) % count : 0
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
export function relativeIndex(index: number, position: number, count: number) {
  if (count < 2) return 0
  return modulo(index - position + count / 2, count) - count / 2
}

export function discPose(offset: number, width: number, height: number) {
  const mobile = width < 700
  const depth = mobile ? Math.exp(-Math.abs(offset) * .76) : Math.pow(offset < 0 ? 1.25 : 1.19, offset)
  const receding = clamp(offset, -1, 0)
  return {
    x: mobile ? offset * width * .5 : width * .428 * (Math.pow(1.4, offset) - 1) / .4,
    y: mobile ? Math.abs(offset) * height * .12 : -height * .24 * (Math.pow(1.7, offset) - 1) / .7,
    scale: clamp(depth, .15, 2),
    rotationX: 49 - receding * 3,
    rotationY: -31 - receding * 13,
    rotationZ: -23,
    zIndex: 20 + Math.round(offset * 2),
    opacity: Math.abs(offset) > 3 ? 0 : 1,
  }
}

export function reelPose(offset: number, width: number, height: number) {
  const magnitude = Math.abs(offset)
  const spread = Math.sign(offset) * (1 - Math.exp(-magnitude * 1.8)) / (1 - Math.exp(-1.8))
  const turn = Math.min(magnitude, 1)
  return {
    x: -spread * width * (width < 700 ? .5 : .14),
    y: spread * height * (width < 700 ? .52 : offset < 0 ? .48 : .59),
    rotationY: -turn * 25,
    rotationZ: turn * 9,
    rotationX: -Math.sign(offset) * turn * 5,
    scale: 1 - Math.max(0, magnitude - 1) * .035,
    zIndex: 20 - Math.round(magnitude * 4),
    opacity: magnitude > 3.25 ? 0 : 1,
  }
}

export function aperturePath(progress: number, width: number, height: number) {
  const radius = Math.hypot(width / 2, height / 1.84) * 1.16 * progress
  const waviness = Math.sin(progress * Math.PI) * .08
  const points = Array.from({ length: 96 }, (_, index) => {
    const angle = index / 96 * Math.PI * 2
    const r = radius * (1 + waviness * (Math.sin(angle * 3 + progress * 3) + .5 * Math.sin(angle * 5 - progress * 2)))
    return `${index === 0 ? 'M' : 'L'}${(width / 2 + Math.cos(angle) * r).toFixed(2)},${(height / 2 + Math.sin(angle) * r * .92).toFixed(2)}`
  })
  return points.join(' ') + 'Z'
}

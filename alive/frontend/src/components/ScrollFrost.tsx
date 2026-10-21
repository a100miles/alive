import { useEffect, useRef } from 'react'

export function ScrollFrost() {
  const layer = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const draw = () => {
      frame = 0
      if (layer.current) layer.current.style.opacity = String(Math.min(1, Math.max(0, window.scrollY / 180)))
    }
    const scroll = () => { if (!frame) frame = requestAnimationFrame(draw) }
    draw()
    window.addEventListener('scroll', scroll, { passive: true })
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', scroll) }
  }, [])
  return <div ref={layer} className="scroll-frost" aria-hidden="true"/>
}

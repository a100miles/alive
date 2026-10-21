import { useEffect, useRef } from 'react'
import './atmosphere.css'

export function FilmGrain() {
  const overlay = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = overlay.current
    if (!element) return
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 192
    const context = canvas.getContext('2d')
    if (!context) return
    const noise = context.createImageData(192, 192)
    for (let index = 0; index < noise.data.length; index += 4) {
      const shade = Math.random() > .5 ? 255 : 0
      noise.data[index] = noise.data[index + 1] = noise.data[index + 2] = shade
      noise.data[index + 3] = Math.floor(Math.random() * 44)
    }
    context.putImageData(noise, 0, 0)
    element.style.backgroundImage = `url(${canvas.toDataURL()})`
    const visibility = () => { element.style.animationPlayState = document.hidden ? 'paused' : 'running' }
    visibility(); document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [])
  return <div ref={overlay} className="film-grain" aria-hidden="true"/>
}

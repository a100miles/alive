import { useState } from 'react'

interface Props { src: string; alt: string; width?: number; height?: number; className?: string; eager?: boolean }
export function MediaImage({ src, alt, width, height, className = '', eager = false }: Props) {
  const [failed, setFailed] = useState(false)
  if (failed || !src) return <div className={`image-missing ${className}`} role="img" aria-label={alt}>Image unavailable<span>{alt}</span></div>
  return <img className={className} src={src} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" onError={() => setFailed(true)} draggable={false} />
}

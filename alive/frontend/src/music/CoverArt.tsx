import { useState } from 'react';

export function CoverArt({ src, className, width = 640, height = 640, loading = 'lazy' }: {
  src?: string;
  className: string;
  width?: number;
  height?: number;
  loading?: 'eager' | 'lazy';
}) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!src || failedSource === src) return <span className={`${className} music-cover-fallback`} aria-hidden="true" />;
  return <img className={className} src={src} alt="" draggable="false" width={width} height={height} loading={loading} onError={() => setFailedSource(src)} />;
}

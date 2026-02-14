import React, { useEffect, useState } from 'react'
import styles from './VimeoEmbeded.module.css'
export function VimeoEmbed({ url, vimeoId }: { url: string; vimeoId: string }) {
  const [ratio, setRatio] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data?.width && data?.height) setRatio(data.width / data.height)
      })
      .catch(() => {
        // if oEmbed fails, fallback to 16/9
        if (!cancelled) setRatio(16 / 9)
      })

    return () => {
      cancelled = true
    }
  }, [url])

  return (
    <div className={styles.vimeoResponsive} style={{ aspectRatio: ratio ?? '16 / 9' }}>
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0&dnt=1`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo video"
      />
    </div>
  )
}

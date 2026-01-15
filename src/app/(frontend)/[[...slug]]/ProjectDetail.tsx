'use client'
import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import styles from './ProjectDetail.module.css'

export default function ProjectDetail({
  post,
  currentLang,
}: {
  post: any
  currentLang: 'en' | 'de'
}) {
  const extractVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/)
    return match ? match[1] : null
  }

  const customConverters: any = {
    text: ({ node }: any) => {
      let text = node.text

      // Lexical bitwise formats:
      // 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript
      if (node.format & 1) text = <strong key="b">{text}</strong>
      if (node.format & 2) text = <em key="i">{text}</em>
      if (node.format & 4) text = <s key="s">{text}</s>
      if (node.format & 8) text = <u key="u">{text}</u>
      if (node.format & 16)
        text = (
          <code className={styles.inlineCode} key="c">
            {text}
          </code>
        )
      if (node.format & 32) text = <sub key="sub">{text}</sub>
      if (node.format & 64) text = <sup key="sup">{text}</sup>

      return text
    },

    linebreak: () => <br />,
    paragraph: ({ nodesToJSX, node }: any) => (
      <p className={styles.paragraph}>{nodesToJSX({ nodes: node.children })}</p>
    ),
    heading: ({ nodesToJSX, node }: any) => {
      const Tag = node.tag || 'h2'
      return <Tag className={styles[Tag]}>{nodesToJSX({ nodes: node.children })}</Tag>
    },

    upload: ({ node }: any) => {
      const val = node.value
      if (!val?.url) return null
      const sizePreset = node.fields?.size || 'full'
      const isVideo = val.mimeType?.includes('video')

      return (
        <div className={`${styles.mediaContainer} ${styles[sizePreset]}`}>
          {isVideo ? (
            <div className={styles.videoWrapper}>
              <video controls playsInline preload="metadata" className={styles.videoElement}>
                <source src={val.url} type={val.mimeType} />
              </video>
            </div>
          ) : (
            <img src={val.url} alt={val.alt || ''} className={styles.imageOnly} />
          )}
        </div>
      )
    },

    blocks: {
      mediaGrid: ({ node }: any) => {
        const { images, columns } = node.fields
        if (!images) return null
        return (
          <div
            className={styles.imageGrid}
            style={{ gridTemplateColumns: `repeat(${columns || 2}, 1fr)` }}
          >
            {images.map((item: any, i: number) => {
              const imgData = item.image
              if (!imgData?.url) return null
              return (
                <div key={i} className={styles.gridItem}>
                  <img src={imgData.url} className={styles.gridImage} alt="" />
                  {item.caption && <p className={styles.gridCaption}>{item.caption}</p>}
                </div>
              )
            })}
          </div>
        )
      },
    },

    unknown: ({ nodesToJSX, node }: any) => {
      if (node.children) return nodesToJSX({ nodes: node.children })
      return <span>{node.text}</span>
    },
  }

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h2 className={styles.title}>{post.title}</h2>
        <time className={styles.displayYear}>[{post.displayYear}]</time>
      </header>
      <div className={styles.richTextBody}>
        {post.content && <RichText data={post.content} converters={customConverters} />}
      </div>
    </article>
  )
}

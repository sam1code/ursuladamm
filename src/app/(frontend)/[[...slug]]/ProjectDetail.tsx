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
  const customConverters: any = {
    // 1. IMPORTANT: Handle the basic text node (This is why everything says unknown)
    text: ({ node }: any) => {
      let text = <span key={node.version}>{node.text}</span>
      if (node.format & 1) text = <strong key={node.version}>{text}</strong> // Bold
      if (node.format & 2) text = <em key={node.version}>{text}</em> // Italic
      if (node.format & 8) text = <u key={node.version}>{text}</u> // Underline
      return text
    },
    // 2. Standard Layout Nodes
    paragraph: ({ nodesToJSX, node }: any) => {
      return <p className={styles.paragraph}>{nodesToJSX({ nodes: node.children })}</p>
    },
    heading: ({ nodesToJSX, node }: any) => {
      const Tag = node.tag
      return <Tag className={styles[node.tag]}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    list: ({ nodesToJSX, node }: any) => {
      const Tag = node.tag === 'ol' ? 'ol' : 'ul'
      return <Tag className={styles.list}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    listitem: ({ nodesToJSX, node }: any) => {
      return <li className={styles.listItem}>{nodesToJSX({ nodes: node.children })}</li>
    },
    link: ({ nodesToJSX, node }: any) => {
      return (
        <a
          href={node.fields.url}
          className={styles.link}
          target={node.fields.newTab ? '_blank' : '_self'}
        >
          {nodesToJSX({ nodes: node.children })}
        </a>
      )
    },
    // 3. Media Nodes (Video/Audio/Image)
    upload: ({ node }: any) => {
      const src = node.value?.url
      const mimeType = node.value?.mimeType || ''
      if (!src) return null

      if (mimeType.includes('video')) {
        return (
          <div className={styles.mediaContainer}>
            <video
              controls
              className={styles.videoPlayer}
              playsInline
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            >
              <source src={src} type={mimeType} />
            </video>
          </div>
        )
      }

      if (mimeType.includes('audio')) {
        return (
          <div className={styles.mediaContainer}>
            <audio
              controls
              className={styles.audioPlayer}
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            >
              <source src={src} type={mimeType} />
            </audio>
          </div>
        )
      }

      return (
        <div className={styles.mediaContainer}>
          <img src={src} alt={node.value?.alt || ''} className={styles.contentImage} />
        </div>
      )
    },
  }

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <time className={styles.date}>{post.displayYear}</time>
          <span className={styles.separator}>—</span>
          <div className={styles.categories}>
            {post.categories?.map((cat: any, i: number) => (
              <span key={cat.id}>
                {currentLang === 'de' ? cat.name_de : cat.name_en}
                {i < post.categories.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
        <h1 className={styles.title}>{post.title}</h1>
      </header>

      <div className={styles.contentWrapper}>
        <section className={styles.richTextBody}>
          <RichText data={post.content} converters={customConverters} />
        </section>

        {post.alternateVersion && (
          <footer className={styles.footer}>
            <div className={styles.divider} />
            <a
              href={
                currentLang === 'en'
                  ? `/de/${post.alternateVersion.slug}`
                  : `/${post.alternateVersion.slug}`
              }
              className={styles.langSwitch}
              style={{
                color: 'black',
              }}
            >
              {currentLang === 'en' ? 'Read in German →' : 'Auf Deutsch lesen →'}
            </a>
          </footer>
        )}
      </div>
    </article>
  )
}

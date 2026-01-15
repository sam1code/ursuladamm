'use client'
import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import styles from './NewsPage.module.css'

export default function NewsPage({
  articles,
  currentLang,
}: {
  articles: any[]
  currentLang: string
}) {
  const customConverters: any = {
    // 1. Text handling
    text: ({ node }: any) => {
      let text = <span key={node.version}>{node.text}</span>
      if (node.format & 1) text = <strong key={node.version}>{text}</strong>
      if (node.format & 2) text = <em key={node.version}>{text}</em>
      return text
    },
    // 2. Paragraphs
    paragraph: ({ nodesToJSX, node }: any) => (
      <p className={styles.paragraph}>{nodesToJSX({ nodes: node.children })}</p>
    ),
    // 3. THE LIST FIX (Handles both UL and OL)
    list: ({ nodesToJSX, node }: any) => {
      // Lexical uses 'listType' (bullet or check or number)
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return <Tag className={styles.list}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    // 4. THE LIST ITEM FIX
    listitem: ({ nodesToJSX, node }: any) => (
      <li className={styles.listItem}>{nodesToJSX({ nodes: node.children })}</li>
    ),
    // 5. Links
    link: ({ nodesToJSX, node }: any) => (
      <a
        href={node.fields?.url}
        className={styles.link}
        target={node.fields?.newTab ? '_blank' : '_self'}
      >
        {nodesToJSX({ nodes: node.children })}
      </a>
    ),
    // 6. Uploads (Images)
    upload: ({ node }: any) => {
      if (!node.value?.url) return null
      return (
        <div className={styles.imageWrapper}>
          <img src={node.value.url} alt={node.value.alt || ''} className={styles.inlineImage} />
        </div>
      )
    },
    // 7. Embeds (Videos)
    embed: ({ node }: any) => {
      const url = node.fields?.url || node.url
      if (!url) return null
      return (
        <div className={styles.embedContainer}>
          <iframe
            src={url.replace('watch?v=', 'embed/')}
            className={styles.iframe}
            allowFullScreen
          />
        </div>
      )
    },
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLang === 'de' ? 'de-DE' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.pageTitle}>
        {currentLang === 'en' ? 'Recent Activities' : 'Neuigkeiten'}
      </h1>

      <div className={styles.feed}>
        {articles.map((article) => (
          <article key={article.id} className={styles.newsItem}>
            <div className={styles.row}>
              <span className={styles.date}>{formatDate(article.date)}</span>
              <div className={styles.contentColumn}>
                <h2 className={styles.headline}>{article.headline}</h2>
                <div className={styles.description}>
                  <RichText data={article.description} converters={customConverters} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

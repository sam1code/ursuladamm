'use client'
import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import styles from './NewsPage.module.css'

export default function NewsPage({
  articles = [],
  currentLang,
}: {
  articles: any[]
  currentLang: string
}) {
  const customConverters: any = {
    text: ({ node }: any) => {
      let text = <span key={node.version}>{node.text}</span>
      if (node.format & 1) text = <strong key={node.version}>{text}</strong>
      if (node.format & 2) text = <em key={node.version}>{text}</em>
      return text
    },
    linebreak: () => <br />,
    paragraph: ({ nodesToJSX, node }: any) => (
      <p className={styles.paragraph}>{nodesToJSX({ nodes: node.children })}</p>
    ),
    heading: ({ nodesToJSX, node }: any) => {
      const Tag = node.tag || 'h2'
      return <Tag className={styles.heading}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    list: ({ nodesToJSX, node }: any) => {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return <Tag className={styles.list}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    listitem: ({ nodesToJSX, node }: any) => (
      <li className={styles.listItem}>{nodesToJSX({ nodes: node.children })}</li>
    ),
    link: ({ nodesToJSX, node }: any) => (
      <a href={node.fields?.url || node.url} className={styles.link}>
        {nodesToJSX({ nodes: node.children })}
      </a>
    ),
    upload: ({ node }: any) => {
      if (!node.value?.url) return null
      return (
        <div className={styles.imageWrapper}>
          <img src={node.value.url} alt={node.value.alt || ''} className={styles.inlineImage} />
        </div>
      )
    },
    // ADD THIS: Catch-all to stop the "unknown node" text and log the culprit
    unknown: ({ node }: any) => {
      console.warn('Unknown node type detected:', node.type)
      return null
    },
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  return (
    <main className={styles.container}>
      <div className={styles.feed}>
        {articles?.map((article) => (
          <article key={article.id} className={styles.newsItem}>
            <div className={styles.row}>
              <div className={styles.contentColumn}>
                <h2 className={styles.headline}>{article.headline || article.title}</h2>
                <div className={styles.description}>
                  <RichText data={article.description} converters={customConverters} />
                </div>
              </div>
              {/* Date is now placed AFTER contentColumn */}
              <div className={styles.dateSide}>{formatDate(article.date)}</div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

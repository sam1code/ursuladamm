'use client'
import React, { useState } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import styles from './InfoPage.module.css'

export default function InfoPage({
  infoEntries,
  currentLang,
}: {
  infoEntries: any[]

  currentLang: string
}) {
  const [openDocId, setOpenDocId] = useState<string | null>()

  const customConverters: any = {
    // 1. Basic Text
    text: ({ node }: any) => {
      let text = <span key={node.version}>{node.text}</span>
      if (node.format & 1) text = <strong key={node.version}>{text}</strong>
      return text
    },
    // 2. Paragraphs
    paragraph: ({ nodesToJSX, node }: any) => (
      <p className={styles.paragraph}>{nodesToJSX({ nodes: node.children })}</p>
    ),
    // 3. Links (Often the cause of unknown node if not handled)
    link: ({ nodesToJSX, node }: any) => (
      <a
        href={node.fields.url}
        className={styles.link}
        target={node.fields.newTab ? '_blank' : '_self'}
      >
        {nodesToJSX({ nodes: node.children })}
      </a>
    ),
    // 4. Uploads (Images inside RichText)
    upload: ({ node }: any) => {
      if (!node.value?.url) return null
      return (
        <div className={styles.imageWrapper}>
          <img src={node.value.url} alt={node.value.alt || ''} className={styles.inlineImage} />
        </div>
      )
    },
    // 5. Video Embeds
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
    // 6. Horizontal Lines
    horizontalrule: () => <hr className={styles.hr} />,

    // 7. Lists
    list: ({ nodesToJSX, node }: any) => {
      const Tag = node.tag === 'ol' ? 'ol' : 'ul'
      return <Tag className={styles.list}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    listitem: ({ nodesToJSX, node }: any) => (
      <li className={styles.listItem}>{nodesToJSX({ nodes: node.children })}</li>
    ),
  }

  return (
    <main className={styles.container}>
      {infoEntries.map((doc) => {
        const isOpen = openDocId === doc.id
        return (
          <div key={doc.id} className={styles.docGroup}>
            <button className={styles.header} onClick={() => setOpenDocId(isOpen ? null : doc.id)}>
              <h1 className={styles.title}>{doc.title}</h1>
              <span className={styles.status}>{isOpen ? 'Close [-]' : 'Open [+]'}</span>
            </button>

            {isOpen && (
              <div className={styles.content}>
                {doc.sections?.map((section: any, idx: number) => (
                  <div key={idx} className={styles.section}>
                    <h2 className={styles.sectionLabel}>{section.label}</h2>
                    <div className={styles.details}>
                      {/* Pass converters here */}
                      <RichText data={section.details} converters={customConverters} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </main>
  )
}

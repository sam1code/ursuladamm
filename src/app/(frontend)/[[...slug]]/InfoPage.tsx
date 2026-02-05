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
  const [openDocId, setOpenDocId] = useState<string | null>(null)

  const customConverters: any = {
    // 1. Basic Text & Linebreaks
    text: ({ node }: any) => {
      let text = <span key={node.version}>{node.text}</span>
      if (node.format & 1) text = <strong key={node.version}>{text}</strong>
      if (node.format & 2) text = <em key={node.version}>{text}</em>
      return text
    },
    linebreak: () => <br />,

    // 2. Paragraphs
    paragraph: ({ nodesToJSX, node }: any) => (
      <p className={styles.paragraph}>{nodesToJSX({ nodes: node.children })}</p>
    ),

    // 3. Headings (MISSING IN YOUR ORIGINAL - Likely the cause of the error)
    heading: ({ nodesToJSX, node }: any) => {
      const Tag = node.tag || 'h2'
      return <Tag className={styles.heading}>{nodesToJSX({ nodes: node.children })}</Tag>
    },

    // 4. Links
    link: ({ nodesToJSX, node }: any) => (
      <a
        href={node.fields?.url || node.url}
        className={styles.link}
        target={node.fields?.newTab ? '_blank' : '_self'}
      >
        {nodesToJSX({ nodes: node.children })}
      </a>
    ),

    // 5. Lists (Corrected 'node.tag' to 'node.listType')
    list: ({ nodesToJSX, node }: any) => {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return <Tag className={styles.list}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    listitem: ({ nodesToJSX, node }: any) => (
      <li className={styles.listItem}>{nodesToJSX({ nodes: node.children })}</li>
    ),

    // 6. Uploads
    upload: ({ node }: any) => {
      if (!node.value?.url) return null
      return (
        <div className={styles.imageWrapper}>
          <img src={node.value.url} alt={node.value.alt || ''} className={styles.inlineImage} />
        </div>
      )
    },

    // 7. Horizontal Rule
    horizontalrule: () => <hr className={styles.hr} />,
  }

  return (
    <main className={styles.container}>
      {infoEntries?.map((doc) => {
        const isOpen = openDocId === doc.id
        // Format date for the sidebar (as seen in your screenshot)

        return (
          <div key={doc.id} className={styles.docGroup}>
            {/* Added the date column to match your design */}

            <div className={styles.mainColumn}>
              <button
                className={styles.header}
                onClick={() => setOpenDocId(isOpen ? null : doc.id)}
              >
                <h1 className={styles.title}>{doc.title}</h1>
                <span className={styles.status}>{isOpen ? 'Close [-]' : 'Open [+]'}</span>
              </button>

              {isOpen && (
                <div className={styles.content}>
                  {doc.sections?.map((section: any, idx: number) => (
                    <div key={idx} className={styles.section}>
                      {section.label && <h2 className={styles.sectionLabel}>{section.label}</h2>}
                      <div className={styles.details}>
                        <RichText data={section.details} converters={customConverters} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </main>
  )
}

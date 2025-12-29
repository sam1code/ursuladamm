'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import styles from './Footer.module.css'

export default function Footer({ currentLang }: { currentLang: 'en' | 'de' }) {
  const router = useRouter()

  const handleNav = (path: string) => {
    const target = currentLang === 'de' ? `/de${path}` : path
    router.push(target)
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.column}>
          <span className={styles.brand}>Ursula Damm</span>
          <p className={styles.copyright}>© {new Date().getFullYear()}</p>
        </div>{' '}
      </div>
    </footer>
  )
}

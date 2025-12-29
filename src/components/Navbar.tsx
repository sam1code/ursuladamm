'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar({ currentLang }: { currentLang: 'en' | 'de' }) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // UPDATED: Logic to handle language prefixing for all routes
  const handleNavigation = (path: string) => {
    // If path is root '/', we handle it specifically
    const base = path === '/' ? '' : path

    // Redirect to /de/path if German, otherwise /path
    const targetPath = currentLang === 'de' ? `/de${base}` : `${path}`

    router.push(targetPath)
    setIsMenuOpen(false)
  }

  const changeLanguage = (newLang: 'en' | 'de') => {
    // This allows switching language on the home page
    if (newLang === 'de') {
      router.push('/de')
    } else {
      router.push('/')
    }
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => handleNavigation('/')}>
          Ursula Damm
        </div>

        <div className={styles.desktopMenu}>
          {/* Use '/' for artworks as it represents the main portfolio grid */}
          <button onClick={() => handleNavigation('/')}>ARTWORKS</button>
          <button onClick={() => handleNavigation('/info')}>INFO</button>
          <button onClick={() => handleNavigation('/news')}>NEWS</button>

          <div className={styles.langSwitch}>
            <span
              className={currentLang === 'en' ? styles.activeLang : ''}
              onClick={() => changeLanguage('en')}
            >
              EN
            </span>
            <span className={styles.separator}>/</span>
            <span
              className={currentLang === 'de' ? styles.activeLang : ''}
              onClick={() => changeLanguage('de')}
            >
              DE
            </span>
          </div>
        </div>

        <button className={styles.mobileToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      <div className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.menuVisible : ''}`}>
        <button onClick={() => handleNavigation('/')}>ARTWORKS</button>
        <button onClick={() => handleNavigation('/info')}>INFO</button>
        <button onClick={() => handleNavigation('/news')}>NEWS</button>
        <div className={styles.mobileLang}>
          <span
            onClick={() => changeLanguage('en')}
            className={currentLang === 'en' ? styles.activeLang : ''}
          >
            EN
          </span>
          <span>/</span>
          <span
            onClick={() => changeLanguage('de')}
            className={currentLang === 'de' ? styles.activeLang : ''}
          >
            DE
          </span>
        </div>
      </div>
    </>
  )
}

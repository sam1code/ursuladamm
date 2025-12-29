'use client'
import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import styles from './Navbar.module.css'

interface NavbarProps {
  currentLang: 'en' | 'de'
  translationSlug?: string
}

export default function Navbar({ currentLang, translationSlug }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const routeMap = {
    info: { en: 'info', de: 'informationen' },
    news: { en: 'news', de: 'neuigkeiten' },
  }

  const handleNavigation = (type: 'home' | 'info' | 'news') => {
    let target = '/'
    if (type === 'info')
      target = `/category/${currentLang === 'de' ? routeMap.info.de : routeMap.info.en}`
    if (type === 'news')
      target = `/category/${currentLang === 'de' ? routeMap.news.de : routeMap.news.en}`

    const finalPath = currentLang === 'de' ? `/de${target === '/' ? '' : target}` : target
    router.push(finalPath)
    setIsMenuOpen(false)
  }

  const changeLanguage = (newLang: 'en' | 'de') => {
    if (newLang === currentLang) return

    // 1. Handle specific translations or fallbacks
    if (translationSlug) {
      if (translationSlug === 'HOME_FALLBACK') {
        router.push(newLang === 'de' ? '/de' : '/')
      } else {
        router.push(newLang === 'de' ? `/de/${translationSlug}` : `/${translationSlug}`)
      }
      setIsMenuOpen(false)
      return
    }

    // 2. Dynamic path switching
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] === 'de') segments.shift()

    const updatedSegments = segments.map((seg) => {
      if (seg === routeMap.info.en || seg === routeMap.info.de) return routeMap.info[newLang]
      if (seg === routeMap.news.en || seg === routeMap.news.de) return routeMap.news[newLang]
      return seg
    })

    const newPath = updatedSegments.join('/')
    const finalTarget = newLang === 'de' ? `/de/${newPath}` : `/${newPath}`
    router.push(finalTarget.replace(/\/$/, '') || (newLang === 'de' ? '/de' : '/'))
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => handleNavigation('home')}>
          Ursula Damm
        </div>

        {/* Desktop Links */}
        <div className={styles.desktopMenu}>
          <button onClick={() => handleNavigation('home')}>ARTWORKS</button>
          <button onClick={() => handleNavigation('info')}>INFO</button>
          <button onClick={() => handleNavigation('news')}>NEWS</button>
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

        {/* Mobile Toggle Button */}
        <button className={styles.mobileToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.menuVisible : ''}`}>
        <button onClick={() => handleNavigation('home')}>ARTWORKS</button>
        <button onClick={() => handleNavigation('info')}>INFO</button>
        <button onClick={() => handleNavigation('news')}>NEWS</button>
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

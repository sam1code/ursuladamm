'use client'
import React, { useState, useMemo } from 'react'
import styles from './Portfolio.module.css'
import { useRouter } from 'next/navigation'

export default function PortfolioClient({ initialArtworks, allCategories, currentLang }: any) {
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const router = useRouter()

  const toggleCategory = (cat: string) => {
    setSelectedCats((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
  }

  const filteredProjects = useMemo(() => {
    if (selectedCats.length === 0) return initialArtworks
    return initialArtworks.filter((p: any) =>
      p.categories.some((c: any) => selectedCats.includes(c)),
    )
  }, [selectedCats, initialArtworks])

  return (
    <div className={styles.wrapper}>
      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.introText}></div>
          <button className={styles.filterToggle} onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
            Filters{' '}
            {selectedCats.length > 0 && (
              <span className={styles.activeCount}>({selectedCats.length})</span>
            )}
          </button>
        </header>

        <div className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}>
          <div className={styles.drawerActions}>
            {selectedCats.length > 0 && (
              <button className={styles.clearBtn} onClick={() => setSelectedCats([])}>
                Clear All
              </button>
            )}
          </div>
          <div className={styles.checkboxGrid}>
            {allCategories.map((cat: string) => (
              <label key={cat} className={styles.label}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  onChange={() => toggleCategory(cat)}
                  checked={selectedCats.includes(cat)}
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        <section className={styles.artisticList}>
          {filteredProjects.map((project: any) => {
            const projectImages = project.images || (project.img ? [project.img] : [])

            return (
              <div
                key={project.id}
                className={styles.projectTile}
                onClick={() =>
                  router.push(currentLang === 'de' ? `/de/${project.slug}` : `/${project.slug}`)
                }
              >
                <div className={styles.tileHeader}>
                  <div className={styles.titleInfo}>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                  </div>
                  <div className={styles.yearWrapper}>
                    <span className={styles.artYear}>[{project.displayYear}]</span>
                  </div>
                </div>

                <div className={styles.imageStrip}>
                  {projectImages.map((url: string, idx: number) => (
                    <div key={idx} className={styles.imgFrame}>
                      <img src={url} alt="" className={styles.galleryImg} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      </main>
    </div>
  )
}

import { CollectionSlug, getPayload } from 'payload'
import configPromise from '@/payload.config'
import PortfolioClient from './PortfolioClient'
import ProjectDetail from './ProjectDetail'
import InfoPage from './InfoPage'
import NewsPage from './NewsPage'
import Navbar from '@/components/Navbar'
import Footer from './Footer'
import { notFound } from 'next/navigation'
import layoutStyles from './MainLayout.module.css'
import Link from 'next/link'

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params
  const slug = resolvedParams?.slug || []
  const payload = await getPayload({ config: configPromise })

  // 1. Language & Route Detection
  const isGerman = slug[0] === 'de'
  const currentLang: 'en' | 'de' = isGerman ? 'de' : 'en'

  const isCategoryInfo = slug.some(
    (s, i) => s === 'category' && (slug[i + 1] === 'info' || slug[i + 1] === 'informationen'),
  )
  const isCategoryNews = slug.some(
    (s, i) => s === 'category' && (slug[i + 1] === 'news' || slug[i + 1] === 'neuigkeiten'),
  )
  const isImpressum = slug.some((s) => s === 'impressum')
  const isHome = slug.length === 0 || (isGerman && slug.length === 1)

  // Wrapper function to keep the layout consistent
  const LayoutWrapper = ({ children, tSlug }: { children: React.ReactNode; tSlug?: string }) => (
    <div className={layoutStyles.mainWrapper}>
      <Navbar currentLang={currentLang} translationSlug={tSlug} />
      <main className={layoutStyles.contentContainer}>{children}</main>
      <Footer currentLang={currentLang} />
    </div>
  )

  // --- SCENARIO: INFO ---
  if (isCategoryInfo) {
    const infoData = await payload.find({
      collection: 'info' as CollectionSlug,
      where: { language: { equals: currentLang }, _status: { equals: 'published' } },
    })
    return (
      <LayoutWrapper>
        <div className={layoutStyles.sheet}>
          <InfoPage infoEntries={infoData.docs} currentLang={currentLang} />
        </div>
      </LayoutWrapper>
    )
  }

  // --- SCENARIO: NEWS ---
  if (isCategoryNews) {
    const newsData = await payload.find({
      collection: 'news' as CollectionSlug,
      where: { language: { equals: currentLang }, _status: { equals: 'published' } },
      sort: '-date',
    })
    return (
      <LayoutWrapper>
        <div className={layoutStyles.sheet}>
          <NewsPage articles={newsData.docs} currentLang={currentLang} />
        </div>
      </LayoutWrapper>
    )
  }

  // --- SCENARIO: IMPRESSUM ---
  if (isImpressum) {
    return (
      <LayoutWrapper>
        <div className={layoutStyles.sheet}>
          <h1>{currentLang === 'de' ? 'Impressum' : 'Imprint'}</h1>
          <div style={{ lineHeight: '1.7', fontSize: '1.1rem' }}>
            <p>Email: studio@ursuladamm.de</p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  // --- SCENARIO: HOME (GRID) ---
  if (isHome) {
    const categoriesData = await payload.find({ collection: 'categories', limit: 100 })
    const artworksData = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' }, language: { equals: currentLang } },
      limit: 100,
    })

    const artworks = artworksData.docs.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      categories:
        post.categories?.map((cat: any) => (currentLang === 'de' ? cat.name_de : cat.name_en)) ||
        [],
      // CHANGED: Instead of a single 'img' string, send 'images' as an array
      images: post.featuredImages?.map((img: any) => img.url) || [],
      displayYear: post.displayYear,
    }))

    // --- DESCENDING SORT: LATEST FIRST ---
    artworks.sort((a: any, b: any) => {
      const extractYear = (val: any) => {
        const match = val ? val.toString().match(/\d{4}/) : null
        return match ? parseInt(match[0], 10) : 0
      }
      const startYearA = extractYear(a.displayYear)
      const startYearB = extractYear(b.displayYear)
      if (startYearB !== startYearA) return startYearB - startYearA
      return (b.displayYear || '').localeCompare(a.displayYear || '')
    })

    return (
      <LayoutWrapper>
        <PortfolioClient
          initialArtworks={artworks}
          allCategories={categoriesData.docs.map((cat: any) =>
            currentLang === 'de' ? cat.name_de : cat.name_en,
          )}
          currentLang={currentLang}
        />
      </LayoutWrapper>
    )
  }

  // --- SCENARIO: PROJECT DETAIL ---
  const projectSlug = slug[slug.length - 1]
  const postData = await payload.find({
    collection: 'posts',
    where: { slug: { equals: projectSlug }, language: { equals: currentLang } },
    limit: 1,
    depth: 2, // High depth is important to expand the media objects in the array
  })

  const post = postData.docs[0]
  if (!post) return notFound()

  // Safely extract the slug from the relationship
  const alternateVersion = post?.alternateVersion
  let otherVersionSlug: string = 'HOME_FALLBACK'

  if (alternateVersion && typeof alternateVersion === 'object') {
    otherVersionSlug = (alternateVersion as any).slug || 'HOME_FALLBACK'
  }

  return (
    <LayoutWrapper tSlug={otherVersionSlug}>
      {/* post.featuredImages is now passed as an array to ProjectDetail */}
      <ProjectDetail post={post} currentLang={currentLang} />
    </LayoutWrapper>
  )
}

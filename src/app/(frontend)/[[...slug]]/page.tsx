import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import PortfolioClient from './PortfolioClient'
import ProjectDetail from './ProjectDetail'
import InfoPage from './InfoPage'
import NewsPage from './NewsPage'
import Navbar from '@/components/Navbar'
import Footer from './Footer'
import { notFound } from 'next/navigation'
import layoutStyles from './MainLayout.module.css'

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

  // Wrapper function to keep the "Normal" layout consistent across all views
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
      collection: 'info',
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
      collection: 'news',
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
            <p>
              <strong>Ursula Damm</strong>
            </p>
            <p>
              Studio Address Line 1<br />
              12345 City, Germany
            </p>
            <p>Email: studio@ursuladamm.de</p>
            <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />
            <p>
              {currentLang === 'de'
                ? 'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV...'
                : 'Responsible for content according to local regulations...'}
            </p>
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
    })

    const artworks = artworksData.docs.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      categories:
        post.categories?.map((cat: any) => (currentLang === 'de' ? cat.name_de : cat.name_en)) ||
        [],
      img: post.featuredImage?.url || '',
      displayYear: post.displayYear,
    }))

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
    depth: 2,
  })

  const post = postData.docs[0]
  if (!post) return notFound()

  // 1. Safely extract the slug from the relationship
  const alternateVersion = post?.alternateVersion
  // We force the fallback if the result is null, undefined, or an empty string
  let otherVersionSlug: string = 'HOME_FALLBACK'

  if (alternateVersion && typeof alternateVersion === 'object') {
    // Use '??' or '||' to ensure a null slug becomes 'HOME_FALLBACK'
    otherVersionSlug = alternateVersion.slug || 'HOME_FALLBACK'
  }

  // 2. Pass it to the Navbar
  return (
    <LayoutWrapper tSlug={otherVersionSlug}>
      <ProjectDetail post={post} currentLang={currentLang} />
    </LayoutWrapper>
  )
}

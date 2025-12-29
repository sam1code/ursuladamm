import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import PortfolioClient from './PortfolioClient'
import ProjectDetail from './ProjectDetail' // Import the new component
import Navbar from '@/components/Navbar'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params
  const payload = await getPayload({ config: configPromise })

  const isGerman = slug[0] === 'de'
  const currentLang: 'en' | 'de' = isGerman ? 'de' : 'en'
  const actualSlug = isGerman ? slug[1] : slug[0]

  // --- SCENARIO A: GRID VIEW ---
  if (!actualSlug || (isGerman && slug.length === 1)) {
    const categoriesData = await payload.find({ collection: 'categories', limit: 100 })
    const artworksData = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' }, language: { equals: currentLang } },
      depth: 1,
    })

    const categoryNames = categoriesData.docs.map((cat: any) =>
      currentLang === 'de' ? cat.name_de : cat.name_en,
    )

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
      <>
        <Navbar currentLang={currentLang} />
        <PortfolioClient
          initialArtworks={artworks}
          allCategories={categoryNames}
          currentLang={currentLang}
        />
      </>
    )
  }

  // --- SCENARIO B: DETAIL VIEW ---
  const postData = await payload.find({
    collection: 'posts',
    where: { slug: { equals: actualSlug }, language: { equals: currentLang } },
    limit: 1,
    depth: 2,
  })

  const post = postData.docs[0]
  if (!post) return notFound()

  return (
    <>
      <Navbar currentLang={currentLang} />
      <ProjectDetail post={post} currentLang={currentLang} />
    </>
  )
}

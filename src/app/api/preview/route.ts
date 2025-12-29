// app/api/preview/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const collection = searchParams.get('collection') || 'posts'

  if (!slug) {
    return new Response('No slug provided', { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  // Find the document to ensure it exists
  const result = await payload.find({
    collection: collection as any,
    draft: true, // Look for drafts
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const post = result.docs[0]

  if (!post) {
    return new Response('Post not found', { status: 404 })
  }

  // 1. Enable Draft Mode (Sets the cookie)
  const draft = await draftMode()
  draft.enable()

  // 2. Redirect to the actual frontend page
  // Adjust this path if your blog posts live at /posts/ or just /
  redirect(`/blog/${slug}`)
}

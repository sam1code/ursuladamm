import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'YOUR_SAFE_LOCAL_SECRET_KEY',

  // REMOVED: localization block.
  // This removes the "globe" icons and locale tabs from the admin panel,
  // letting you manage EN and DE as separate rows/documents.

  admin: {
    user: 'users',
    dateFormat: 'dd.MM.yyyy HH:mm',
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.db',
    },
  }),
  editor: lexicalEditor({}),
  collections: [
    {
      slug: 'users',
      auth: true,
      access: {
        create: ({ req: { user } }) => (user ? true : { id: { exists: false } }),
        read: ({ req: { user } }) => Boolean(user),
      },
      fields: [],
    },
    {
      slug: 'media',
      upload: true,
      access: {
        read: () => true, // Allows anyone to view images
      },
      fields: [{ name: 'alt', type: 'text', required: true }], // Removed localized: true
    },
    {
      slug: 'categories',
      admin: { useAsTitle: 'name_en' }, // Uses the English name as the label in Admin
      fields: [
        {
          type: 'row', // Puts them side-by-side
          fields: [
            {
              name: 'name_en',
              label: 'Name (English)',
              type: 'text',
              required: true,
            },
            {
              name: 'name_de',
              label: 'Name (German)',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      slug: 'posts',
      admin: {
        useAsTitle: 'title',
        preview: (doc) =>
          `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/preview?slug=${doc.slug}`,
      },
      versions: { drafts: true },
      fields: [
        { name: 'title', type: 'text', required: true }, // Removed localized: true
        { name: 'slug', type: 'text', unique: true, admin: { position: 'sidebar' } },
        {
          name: 'language',
          type: 'select',
          required: true,
          defaultValue: 'en', // Defaults new posts to English
          options: [
            { label: 'English', value: 'en' },
            { label: 'German', value: 'de' },
          ],
          admin: { position: 'sidebar' },
        },
        {
          name: 'alternateVersion',
          type: 'relationship',
          relationTo: 'posts',
          admin: {
            position: 'sidebar',
            description: 'Link the other language version here',
          },
        },
        { name: 'publishedDate', type: 'date', required: true, admin: { position: 'sidebar' } },
        {
          name: 'displayYear',
          type: 'text',
          admin: { description: 'e.g., 2023-2025', position: 'sidebar' },
        },
        {
          name: 'categories',
          type: 'relationship',
          relationTo: 'categories',
          hasMany: true,
          admin: { position: 'sidebar' },
        },
        { name: 'featuredImage', type: 'upload', relationTo: 'media' },
        { name: 'content', type: 'richText', required: true }, // Removed localized: true
      ],
    },
    {
      slug: 'news',
      versions: { drafts: true },
      admin: { useAsTitle: 'headline' },
      fields: [
        { name: 'headline', type: 'text', required: true },
        { name: 'date', type: 'date', required: true, admin: { position: 'sidebar' } },
        { name: 'description', type: 'richText', required: true },
        {
          name: 'language',
          type: 'select',
          required: true,
          defaultValue: 'en',
          options: [
            { label: 'English', value: 'en' },
            { label: 'German', value: 'de' },
          ],
          admin: { position: 'sidebar' },
        },
      ],
    },
    {
      slug: 'info',
      versions: { drafts: true },
      admin: { useAsTitle: 'title' },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'sections',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'details', type: 'richText', required: true },
          ],
        },
        {
          name: 'language',
          type: 'select',
          required: true,
          defaultValue: 'en',
          options: [
            { label: 'English', value: 'en' },
            { label: 'German', value: 'de' },
          ],
          admin: { position: 'sidebar' },
        },
      ],
    },
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
})

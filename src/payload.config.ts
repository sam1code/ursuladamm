import { sqliteAdapter } from '@payloadcms/db-sqlite'
import {
  lexicalEditor,
  BlocksFeature,
  UploadFeature,
  HTMLConverterFeature,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'YOUR_SAFE_LOCAL_SECRET_KEY',

  admin: {
    user: 'users',
    dateFormat: 'dd.MM.yyyy HH:mm',
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.db',
    },
  }),

  // UPDATED EDITOR CONFIG
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      // 1. Adds a "Size" dropdown to every single image upload
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: 'size',
                type: 'select',
                options: [
                  { label: 'Small', value: 'small' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Full Width', value: 'full' },
                ],
                defaultValue: 'full',
              },
            ],
          },
        },
      }),
      // 2. Adds the ability to insert a Grid of multiple images
      BlocksFeature({
        blocks: [
          {
            slug: 'mediaGrid',
            labels: {
              singular: 'Media Grid',
              plural: 'Media Grids',
            },
            fields: [
              {
                name: 'columns',
                type: 'select',
                defaultValue: '2',
                options: [
                  { label: '2 Columns', value: '2' },
                  { label: '3 Columns', value: '3' },
                  { label: '4 Columns', value: '4' },
                ],
              },
              {
                name: 'images',
                type: 'array',
                fields: [
                  {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                  },
                  {
                    name: 'caption',
                    type: 'text',
                  },
                ],
              },
            ],
          },
        ],
      }),
    ],
  }),

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
        read: () => true,
      },
      fields: [{ name: 'alt', type: 'text', required: true }],
    },
    {
      slug: 'categories',
      admin: { useAsTitle: 'name_en' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name_en', label: 'Name (English)', type: 'text', required: true },
            { name: 'name_de', label: 'Name (German)', type: 'text', required: true },
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
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', unique: true, admin: { position: 'sidebar' } },
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
        {
          name: 'alternateVersion',
          type: 'relationship',
          relationTo: 'posts',
          admin: { position: 'sidebar', description: 'Link the other language version here' },
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
        {
          name: 'featuredImages',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          label: 'Featured Images',
        },
        { name: 'content', type: 'richText', required: true },
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

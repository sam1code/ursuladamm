import React from 'react'
import localFont from 'next/font/local'
import './styles.css'

const iaWriterDuo = localFont({
  src: [
    { path: './fonts/iAWriterDuospace-Regular.otf', weight: '400', style: 'normal' },
    { path: './fonts/iAWriterDuospace-RegularItalic.otf', weight: '400', style: 'italic' },
    { path: './fonts/iAWriterDuospace-Bold.otf', weight: '700', style: 'normal' },
    { path: './fonts/iAWriterDuospace-BoldItalic.otf', weight: '700', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-ia',
})

export const metadata = {
  title: 'Ursula Damm',
  description: 'Ursula Damm',
  icons: {
    icon: '/favicon/favicon-32x32.jpg', // default favicon
    apple: '/favicon/apple-touch-icon.jpg', // iOS icon
    shortcut: '/favicon/favicon-192x192.jpg', // Android/desktop
    other: [
      {
        rel: 'msapplication-TileImage',
        url: '/favicon/mstile-300x300.jpg', // Windows tile
      },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={iaWriterDuo.variable}>
      <body>
        <main className="font-ia">{children}</main>
      </body>
    </html>
  )
}

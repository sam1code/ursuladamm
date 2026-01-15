import React from 'react'
import localFont from 'next/font/local'
import './styles.css'

export const metadata = {
  description: 'Ursula Damm',
  title: 'Ursula Damm',
}

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

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={iaWriterDuo.variable}>
      <body>
        <main className="font-ia">{children}</main>
      </body>
    </html>
  )
}

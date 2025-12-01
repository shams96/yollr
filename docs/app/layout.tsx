import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DocsProvider } from '../components/DocsProvider'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { ErrorBoundary } from '../components/error/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Yollr Platform Documentation',
  description: 'Complete API documentation and developer guides for the Yollr platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-white`}>
        <ErrorBoundary>
          <DocsProvider>
            <div className="flex h-full">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </DocsProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
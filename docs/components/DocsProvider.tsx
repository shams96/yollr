'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface DocsContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedSection: string
  setSelectedSection: (section: string) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (isOpen: boolean) => void
}

const DocsContext = createContext<DocsContextType | undefined>(undefined)

export function DocsProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      setSelectedSection(hash)
      const element = document.getElementById(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [selectedSection])

  return (
    <DocsContext.Provider value={{ 
      searchQuery, 
      setSearchQuery, 
      selectedSection, 
      setSelectedSection,
      isMobileMenuOpen,
      setIsMobileMenuOpen
    }}>
      {children}
    </DocsContext.Provider>
  )
}

export function useDocs() {
  const context = useContext(DocsContext)
  if (context === undefined) {
    throw new Error('useDocs must be used within a DocsProvider')
  }
  return context
}
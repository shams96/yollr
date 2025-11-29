'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon, X } from 'lucide-react'
import Fuse from 'fuse.js'
import { searchIndex, fuseOptions } from '@/lib/search-index'
import { useDocs } from './DocsProvider'

interface SearchResult {
  item: typeof searchIndex[0]
  score: number
}

export function Search() {
  const router = useRouter()
  const { searchQuery, setSearchQuery } = useDocs()
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Create Fuse instance once with useMemo for performance
  const fuse = useMemo(() => {
    return new Fuse(searchIndex, fuseOptions)
  }, [])

  // Handle clicks outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      if (event.key === 'Escape') {
        setIsOpen(false)
        setSearchQuery('')
        setResults([])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setSearchQuery])

  // Debounced search implementation
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    const timeoutId = setTimeout(() => {
      try {
        const searchResults = fuse.search(searchQuery)
        // Filter out results without scores and map to our SearchResult type
        const validResults = searchResults
          .filter((result) => result.score !== undefined)
          .map(result => ({
            item: result.item,
            score: result.score!
          }))
        setResults(validResults)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery, fuse])

  const handleResultClick = (url: string) => {
    router.push(url)
    setIsOpen(false)
    setSearchQuery('')
    setResults([])
  }

  const clearSearch = () => {
    setSearchQuery('')
    setResults([])
    setIsOpen(false)
  }

  const relevancePercentage = (score: number) => {
    // Convert Fuse score (0-1, where 0 is perfect match) to percentage
    return Math.round((1 - Math.min(score, 1)) * 100)
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search documentation... (Cmd/Ctrl + K)"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (searchQuery || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-pulse">Searching...</div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map(({ item, score }) => (
                <button
                  key={item.url}
                  onClick={() => handleResultClick(item.url)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2 ${
                          item.type === 'page' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </span>
                      </div>
                      {item.section && (
                        <p className="text-xs text-gray-500 mt-1 ml-16">
                          in {item.section}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <div className="flex items-center">
                        <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${relevancePercentage(score)}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          {relevancePercentage(score)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-4 text-center text-gray-500">
              <p>No results found for "{searchQuery}"</p>
              <p className="text-sm mt-1">Try different keywords or check spelling</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
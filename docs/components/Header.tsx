'use client'

import { Search, X } from 'lucide-react'
import { useDocs } from './DocsProvider'
import Link from 'next/link'

export function Header() {
  const { searchQuery, setSearchQuery, searchResults, isSearching, searchError } = useDocs()

  return (
    <div className="sticky top-0 z-20 flex-shrink-0">
      {/* Mobile Search */}
      <div className="flex h-16 bg-white border-b border-gray-200 lg:hidden">
        <div className="flex-1 px-4 flex justify-between sm:px-6 lg:px-8">
          <div className="flex-1 flex">
            <div className="w-full flex md:ml-0">
              <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <Search className="h-5 w-5" aria-hidden="true" />
                </div>
                <input
                  id="search-field-mobile"
                  className="block w-full h-full pl-8 pr-10 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                  placeholder="Search documentation..."
                  type="search"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Search */}
      <div className="hidden lg:flex h-16 bg-white border-b border-gray-200">
        <div className="flex-1 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Yollr Documentation</h1>
          </div>
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="search-field-desktop"
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                placeholder="Search documentation..."
                type="search"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Press / to search</span>
          </div>
        </div>
      </div>
      
      {/* Search Results Dropdown */}
      {searchQuery && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg max-h-96 overflow-y-auto">
          <div className="py-2">
            {searchError ? (
              <div className="px-4 py-3 text-sm text-red-600">
                {searchError}
              </div>
            ) : isSearching ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                No results found for "{searchQuery}"
              </div>
            ) : (
              searchResults.map((result) => (
                <Link
                  key={result.url}
                  href={result.url}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => setSearchQuery('')}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {result.description}
                      </div>
                      {result.score !== undefined && (
                        <div className="text-xs text-gray-400 mt-1">
                          Relevance: {((1 - result.score) * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                    <span className={`ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                      result.type === 'page'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {result.type}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
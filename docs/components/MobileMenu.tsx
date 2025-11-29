'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { 
  Home, 
  BookOpen, 
  Key, 
  Database, 
  Zap, 
  Code, 
  Settings, 
  AlertCircle,
  LifeBuoy
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'API Reference', href: '/api', icon: BookOpen },
  { name: 'Authentication', href: '/authentication', icon: Key },
  { name: 'Database Schema', href: '/database', icon: Database },
  { name: 'Edge Functions', href: '/edge-functions', icon: Zap },
  { name: 'Webhooks & Real-time', href: '/webhooks', icon: Code },
  { name: 'Developer Setup', href: '/setup', icon: Settings },
  { name: 'Error Handling', href: '/errors', icon: AlertCircle },
  { name: 'Support', href: '/support', icon: LifeBuoy },
]

interface MobileMenuProps {
  onClose: () => void
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleLinkClick = () => {
    setIsOpen(false)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
        onClick={handleLinkClick}
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl z-50 lg:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={handleLinkClick}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`group flex items-center px-3 py-3 text-base font-medium rounded-lg ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <p>Yollr Platform Documentation</p>
              <p className="mt-1">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BookOpen, 
  Key, 
  Database, 
  Code, 
  Zap, 
  Settings, 
  AlertCircle,
  Home,
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 pb-4 bg-white overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">Yollr Docs</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
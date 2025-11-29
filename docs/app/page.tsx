import Link from 'next/link'
import { 
  BookOpen, 
  Key, 
  Database, 
  Code, 
  Zap, 
  Settings, 
  AlertCircle,
  ArrowRight 
} from 'lucide-react'

const features = [
  {
    name: 'API Reference',
    description: 'Complete API documentation with endpoints, request/response formats, and authentication details.',
    href: '/api',
    icon: BookOpen,
    color: 'bg-blue-500',
  },
  {
    name: 'Authentication Guide',
    description: 'Learn how to implement phone-based OTP authentication and session management.',
    href: '/authentication',
    icon: Key,
    color: 'bg-green-500',
  },
  {
    name: 'Database Schema',
    description: 'Comprehensive database documentation with tables, relationships, and data flow patterns.',
    href: '/database',
    icon: Database,
    color: 'bg-purple-500',
  },
  {
    name: 'Edge Functions',
    description: 'High-performance serverless functions for campus detection and feed ranking.',
    href: '/edge-functions',
    icon: Zap,
    color: 'bg-yellow-500',
  },
  {
    name: 'Webhooks & Real-time',
    description: 'Real-time event subscriptions and webhook configurations for live updates.',
    href: '/webhooks',
    icon: Code,
    color: 'bg-red-500',
  },
  {
    name: 'Developer Setup',
    description: 'Step-by-step guide to set up your development environment and get started.',
    href: '/setup',
    icon: Settings,
    color: 'bg-indigo-500',
  },
  {
    name: 'Error Handling',
    description: 'Common error scenarios, troubleshooting guides, and best practices.',
    href: '/errors',
    icon: AlertCircle,
    color: 'bg-gray-500',
  },
]

export default function Home() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Yollr Platform Documentation
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Complete API documentation and developer guides for building gamified campus social experiences
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.name}
                href={feature.href}
                className="group relative bg-white border border-gray-200 rounded-lg px-6 py-8 shadow-sm hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${feature.color} rounded-md p-3`}>
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500">{feature.description}</p>
                <div className="mt-6 flex items-center text-sm font-medium text-blue-600">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900">Quick Start</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900">New to Yollr?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Start with our developer setup guide to get your environment configured and start building.
              </p>
              <Link
                href="/setup"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Explore the API</h3>
              <p className="mt-2 text-sm text-gray-600">
                Dive into our comprehensive API reference to understand all available endpoints.
              </p>
              <Link
                href="/api"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                View API Docs
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
          <div className="mt-6 prose prose-blue max-w-none">
            <p className="text-lg text-gray-600">
              Yollr is a gamified campus social platform that combines the best of social media, gaming, and campus life. 
              Our platform features a single vertical feed, weekly heists, real-time polls, and comprehensive gamification 
              features designed to drive engagement and build community.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-8">Key Features</h3>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li><strong>Single Vertical Feed:</strong> Algorithmically ranked content combining moments, polls, and heists</li>
              <li><strong>Weekly Heists:</strong> Campus-wide challenges with 5-phase lifecycle (submitting, voting, won, executing, completed)</li>
              <li><strong>Real-time Polls:</strong> Time-limited polls with urgency-based scoring</li>
              <li><strong>Gamification:</strong> XP system, streaks, mystery boxes, and leaderboards</li>
              <li><strong>Campus Isolation:</strong> Content and users are isolated by campus for community building</li>
              <li><strong>Real-time Updates:</strong> Live feed updates, notifications, and presence features</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mt-8">Technology Stack</h3>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li><strong>Frontend:</strong> Next.js 15, React 19, TypeScript, Tailwind CSS</li>
              <li><strong>Backend:</strong> Supabase (PostgreSQL, Auth, Storage, Realtime)</li>
              <li><strong>Edge Functions:</strong> Vercel Edge Runtime for performance-critical operations</li>
              <li><strong>Authentication:</strong> Phone-based OTP with Supabase Auth</li>
              <li><strong>Real-time:</strong> WebSocket-based subscriptions with Supabase Realtime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
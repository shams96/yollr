import { BookOpen, Code, Key, Server, Zap } from 'lucide-react'

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    icon: BookOpen,
    content: [
      'Yollr is a gamified campus social platform with a single vertical feed, weekly heists, real-time polls, and comprehensive gamification features. This API documentation covers all endpoints, authentication, and integration patterns.',
      'Base URL: https://your-project.supabase.co'
    ]
  },
  {
    id: 'authentication',
    title: 'Authentication',
    icon: Key,
    content: [
      'All API requests require authentication using Supabase Auth. Include the JWT token in the Authorization header:',
      'Authorization: Bearer <jwt_token>'
    ]
  },
  {
    id: 'endpoints',
    title: 'API Endpoints',
    icon: Server,
    endpoints: [
      {
        name: 'Phone OTP Authentication',
        methods: [
          { type: 'POST', path: '/auth/v1/otp', description: 'Send OTP to phone' },
          { type: 'POST', path: '/auth/v1/verify', description: 'Verify OTP and sign in' }
        ]
      },
      {
        name: 'Campus Management',
        methods: [
          { type: 'GET', path: '/rest/v1/campuses', description: 'List all campuses' },
          { type: 'POST', path: '/functions/v1/geo-infer-campus', description: 'Find campuses by location' }
        ]
      },
      {
        name: 'Feed Management',
        methods: [
          { type: 'POST', path: '/functions/v1/rank-feed-page', description: 'Get ranked feed items' },
          { type: 'GET', path: '/rest/v1/moments', description: 'List moments' },
          { type: 'POST', path: '/rest/v1/moments', description: 'Create new moment' }
        ]
      },
      {
        name: 'Polls',
        methods: [
          { type: 'GET', path: '/rest/v1/polls', description: 'List active polls' },
          { type: 'POST', path: '/rest/v1/polls', description: 'Create new poll' },
          { type: 'POST', path: '/rest/v1/poll_votes', description: 'Cast vote' }
        ]
      },
      {
        name: 'Heists',
        methods: [
          { type: 'GET', path: '/rest/v1/heists', description: 'List active heists' },
          { type: 'POST', path: '/rest/v1/heist_submissions', description: 'Submit entry' },
          { type: 'POST', path: '/rest/v1/heist_votes', description: 'Cast vote' }
        ]
      }
    ]
  },
  {
    id: 'realtime',
    title: 'Real-time Subscriptions',
    icon: Zap,
    content: [
      'Subscribe to feed updates, heist phase changes, and other real-time events using Supabase Realtime.'
    ]
  },
  {
    id: 'sdks',
    title: 'SDK Examples',
    icon: Code,
    content: [
      'JavaScript/TypeScript, Python, and cURL examples available for all endpoints.'
    ]
  }
]

export default function APIDocs() {
  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            API Documentation
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Complete reference for Yollr platform APIs
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="flex items-center mb-6">
                <section.icon className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              
              <div className="prose prose-lg max-w-none">
                {section.content?.map((paragraph, idx) => (
                  <p key={idx} className="text-gray-600 mb-4">{paragraph}</p>
                ))}
              </div>

              {section.endpoints && (
                <div className="mt-6 space-y-6">
                  {section.endpoints.map((endpointGroup) => (
                    <div key={endpointGroup.name} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{endpointGroup.name}</h3>
                      <div className="space-y-3">
                        {endpointGroup.methods.map((method) => (
                          <div key={method.path} className="flex items-center justify-between bg-white rounded-md p-3 border border-gray-200">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                method.type === 'GET' ? 'bg-green-100 text-green-800' :
                                method.type === 'POST' ? 'bg-blue-100 text-blue-800' :
                                method.type === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {method.type}
                              </span>
                              <code className="ml-3 text-sm font-mono text-gray-900">{method.path}</code>
                            </div>
                            <span className="text-sm text-gray-500">{method.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            For API support, please contact our developer community or reach out to our support team.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:support@yollr.com"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Email Support
            </a>
            <a
              href="https://discord.gg/yollr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
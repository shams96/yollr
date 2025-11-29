import { 
  Code, 
  Database, 
  Settings, 
  Terminal, 
  GitBranch,
  Zap,
  Shield,
  LifeBuoy
} from 'lucide-react'

const prerequisites = {
  system: [
    'Node.js 18.0.0 or higher',
    'npm 9.0.0 or higher',
    'Git 2.30.0 or higher',
    'Supabase CLI (latest)',
    'Vercel CLI (latest)'
  ],
  accounts: [
    'Supabase Account (supabase.com)',
    'Vercel Account (vercel.com)',
    'Firebase Account (firebase.google.com)',
    'GitHub Account'
  ]
}

const quickStart = [
  {
    step: 1,
    title: 'Clone Repository',
    command: 'git clone <repository-url>\ncd yollr',
    description: 'Clone the Yollr repository and navigate to the project directory'
  },
  {
    step: 2,
    title: 'Install Dependencies',
    command: 'npm install',
    description: 'Install all required packages including Next.js 15, React 19, TypeScript, Supabase, and Tailwind CSS'
  },
  {
    step: 3,
    title: 'Environment Setup',
    command: 'cp .env.local.example .env.local',
    description: 'Copy the environment template and edit with your credentials'
  },
  {
    step: 4,
    title: 'Supabase Setup',
    command: 'supabase init\nsupabase start',
    description: 'Initialize and start local Supabase instance'
  },
  {
    step: 5,
    title: 'Run Development Server',
    command: 'npm run dev',
    description: 'Start the development server at http://localhost:3000'
  }
]

const environmentVariables = [
  {
    category: 'Supabase Configuration',
    vars: [
      { name: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Your Supabase project URL' },
      { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Supabase anonymous key' },
      { name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase service role key (server-side only)' }
    ]
  },
  {
    category: 'Firebase Cloud Messaging',
    vars: [
      { name: 'NEXT_PUBLIC_FIREBASE_API_KEY', description: 'Firebase API key' },
      { name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', description: 'Firebase auth domain' },
      { name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', description: 'Firebase project ID' },
      { name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', description: 'Firebase sender ID' },
      { name: 'NEXT_PUBLIC_FIREBASE_APP_ID', description: 'Firebase app ID' },
      { name: 'NEXT_PUBLIC_FIREBASE_VAPID_KEY', description: 'Firebase VAPID key for web push' }
    ]
  },
  {
    category: 'Optional: Analytics & Monitoring',
    vars: [
      { name: 'NEXT_PUBLIC_GA_MEASUREMENT_ID', description: 'Google Analytics measurement ID' },
      { name: 'SENTRY_DSN', description: 'Sentry DSN for error tracking' }
    ]
  }
]

const commands = [
  {
    category: 'Development',
    commands: [
      { command: 'npm run dev', description: 'Start development server' },
      { command: 'npm run build', description: 'Build for production' },
      { command: 'npm run start', description: 'Start production server' },
      { command: 'npm run lint', description: 'Run ESLint' }
    ]
  },
  {
    category: 'Testing',
    commands: [
      { command: 'npm test', description: 'Run all tests' },
      { command: 'npm run test:watch', description: 'Run tests in watch mode' },
      { command: 'npm run test:coverage', description: 'Run tests with coverage report' }
    ]
  },
  {
    category: 'Supabase',
    commands: [
      { command: 'npm run supabase:start', description: 'Start local Supabase' },
      { command: 'npm run supabase:stop', description: 'Stop local Supabase' },
      { command: 'npm run supabase:status', description: 'Check Supabase status' }
    ]
  },
  {
    category: 'Database',
    commands: [
      { command: 'npm run db:reset', description: 'Reset database' },
      { command: 'npm run db:migrate', description: 'Run migrations' },
      { command: 'npm run db:seed', description: 'Seed database with sample data' }
    ]
  }
]

const projectStructure = `yollr/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── feed/              # Feed page
│   │   ├── login/             # Login page
│   │   └── onboarding/        # Onboarding flow
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── feed/              # Feed components
│   │   └── navigation/        # Navigation components
│   ├── lib/                   # Utilities and clients
│   │   ├── supabase/          # Supabase clients
│   │   ├── validation/        # Validation schemas
│   │   └── crdt/              # CRDT implementation
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript types
├── supabase/
│   ├── functions/             # Edge Functions
│   ├── schema.sql            # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
├── scripts/                  # Utility scripts
└── docs/                     # Documentation`

export default function SetupDocs() {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Developer Setup Guide
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Step-by-step guide to set up your Yollr development environment
          </p>
        </div>

        <section id="prerequisites" className="mb-12">
          <div className="flex items-center mb-6">
            <Settings className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Prerequisites</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Requirements</h3>
              <ul className="space-y-2">
                {prerequisites.system.map((item) => (
                  <li key={item} className="flex items-center">
                    <Terminal className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Accounts</h3>
              <ul className="space-y-2">
                {prerequisites.accounts.map((item) => (
                  <li key={item} className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="quick-start" className="mb-12">
          <div className="flex items-center mb-6">
            <Zap className="h-8 w-8 text-yellow-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Start</h2>
          </div>
          
          <div className="space-y-6">
            {quickStart.map((step) => (
              <div key={step.step} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold mr-4">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                    <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100">
                        <code>{step.command}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="environment" className="mb-12">
          <div className="flex items-center mb-6">
            <Code className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Environment Variables</h2>
          </div>
          
          <div className="space-y-6">
            {environmentVariables.map((category) => (
              <div key={category.category} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
                <div className="space-y-3">
                  {category.vars.map((envVar) => (
                    <div key={envVar.name} className="flex items-start">
                      <code className="flex-shrink-0 bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-600 mr-3">
                        {envVar.name}
                      </code>
                      <span className="text-gray-600">{envVar.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="commands" className="mb-12">
          <div className="flex items-center mb-6">
            <Terminal className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Key Commands</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {commands.map((category) => (
              <div key={category.category} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
                <div className="space-y-4">
                  {category.commands.map((cmd) => (
                    <div key={cmd.command}>
                      <div className="bg-gray-900 rounded p-3">
                        <code className="text-sm text-gray-100">{cmd.command}</code>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{cmd.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="structure" className="mb-12">
          <div className="flex items-center mb-6">
            <GitBranch className="h-8 w-8 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Project Structure</h2>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-gray-100">
              <code>{projectStructure}</code>
            </pre>
          </div>
        </section>

        <section id="support" className="mb-12">
          <div className="bg-blue-50 rounded-lg p-8">
            <div className="flex items-center mb-4">
              <LifeBuoy className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Need Help?</h2>
            </div>
            <p className="text-gray-600 mb-6">
              If you encounter any issues during setup, check our troubleshooting guides or reach out to the community.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/errors"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Troubleshooting Guide
              </a>
              <a
                href="https://discord.gg/yollr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Join Discord Community
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
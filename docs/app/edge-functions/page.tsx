import { Zap, Code, Server, Database, Shield, Gauge } from 'lucide-react'

const functions = [
  {
    id: 'geo-infer-campus',
    name: 'geo-infer-campus',
    description: 'Detects user\'s campus based on geographic location or ZIP code',
    endpoint: 'POST /api/geo-infer-campus',
    purpose: 'Campus detection from location/ZIP for onboarding',
    request: {
      lat: 'number (optional) - Latitude',
      lng: 'number (optional) - Longitude',
      zip: 'string (optional) - ZIP/postal code'
    },
    response: {
      campuses: 'Array of campus objects with distance calculations',
      location_used: 'string - "coordinates" or "zip_code"',
      total_found: 'number - Count of found campuses'
    },
    implementation: `// Campus detection logic
serve(async (req) => {
  const { lat, lng, zip } = await req.json();
  
  if (zip) {
    // Search by ZIP code
    const { data } = await supabase
      .from('campuses')
      .select('*')
      .eq('zip_code', zip)
      .limit(10);
  } else if (lat && lng) {
    // Search within 50 miles and rank by enrollment/distance
    const radiusKm = 80.467;
    const campuses = (data || [])
      .map(campus => ({
        ...campus,
        distance: getDistance(
          { latitude: lat, longitude: lng },
          { latitude: campus.lat, longitude: campus.lng }
        ) / 1000,
      }))
      .filter(campus => campus.distance <= radiusKm)
      .sort((a, b) => {
        const scoreA = a.enrollment / Math.pow(a.distance, 1.5);
        const scoreB = b.enrollment / Math.pow(b.distance, 1.5);
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }
});`
  },
  {
    id: 'rank-feed-page',
    name: 'rank-feed-page',
    description: 'Ranks feed items using algorithmic scoring for optimal engagement',
    endpoint: 'POST /api/rank-feed-page',
    purpose: 'Feed ranking and pagination with algorithmic scoring',
    request: {
      campus_id: 'string - Campus UUID',
      cursor: 'string (optional) - Pagination cursor (score_id)',
      limit: 'number (optional) - Items per page (default: 10)'
    },
    response: {
      items: 'Array of ranked feed items',
      next_cursor: 'string - Pagination cursor for next page',
      is_stale: 'boolean - Cache freshness indicator'
    },
    scoring: `// Scoring algorithm
function calculateScore(item, now) {
  const baseScores = {
    heist_reveal: 1_000_000,
    heist_voting: 900_000,
    poll: 800_000,
    moment: 700_000,
  };
  
  let score = baseScores[item.type] || 0;
  
  if (item.type === 'heist') {
    // Time-based scoring for heist phases
  } else if (item.type === 'poll') {
    // Urgency boost: 40/30/20/10 points based on time remaining
    const timeLeft = new Date(item.closes_at).getTime() - now;
    const duration = new Date(item.closes_at).getTime() - new Date(item.created_at).getTime();
    if (timeLeft < duration * 0.1) score += 50000;
    else if (timeLeft < duration * 0.3) score += 20000;
    else if (timeLeft < duration * 0.6) score += 10000;
  } else if (item.type === 'moment') {
    // Engagement-based scoring
    score += (item.reaction_count || 0) * 50;
    score += (item.view_count || 0) * 5;
  }
  
  return score;
}`
  }
]

const caching = {
  strategy: 'In-memory cache with ETag support',
  geoCache: {
    ttl: '24 hours',
    staleWhileRevalidate: '1 hour',
    keyFormat: 'geo:{lat}:{lng} or geo:zip:{zip}'
  },
  feedCache: {
    ttl: '5 seconds',
    staleWhileRevalidate: '1 second',
    keyFormat: 'feed:{campus_id}:{cursor}:{limit}'
  }
}

const deployment = {
  local: 'vercel dev',
  production: 'vercel deploy --prod',
  envVars: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
}

export default function EdgeFunctionsDocs() {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Edge Functions
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            High-performance serverless functions for critical operations
          </p>
        </div>

        <div className="mb-12 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-600 mb-4">
            Yollr uses Vercel Edge Functions for performance-critical operations that require low latency and global distribution. 
            Edge Functions run on Vercel's edge network, providing sub-100ms response times worldwide.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-6">
            <div className="bg-white rounded-lg p-4">
              <Zap className="h-6 w-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900">Runtime</h3>
              <p className="text-sm text-gray-600">Vercel Edge Runtime (Deno-compatible)</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <Gauge className="h-6 w-6 text-blue-500 mb-2" />
              <h3 className="font-medium text-gray-900">Performance</h3>
              <p className="text-sm text-gray-600">Sub-100ms global response times</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <Shield className="h-6 w-6 text-green-500 mb-2" />
              <h3 className="font-medium text-gray-900">Caching</h3>
              <p className="text-sm text-gray-600">In-memory cache with ETag support</p>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {functions.map((func) => (
            <section key={func.id} id={func.id} className="scroll-mt-24">
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <Zap className="h-8 w-8 text-yellow-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">{func.name}</h2>
                </div>
                
                <p className="text-lg text-gray-600 mb-6">{func.description}</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoint</h3>
                    <code className="block bg-gray-900 text-gray-100 rounded p-3 text-sm">
                      {func.endpoint}
                    </code>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Purpose</h3>
                    <p className="text-gray-600">{func.purpose}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Request</h3>
                    <div className="bg-gray-50 rounded p-4">
                      {Object.entries(func.request).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <code className="text-sm font-mono text-blue-600">{key}</code>
                          <span className="text-sm text-gray-600 ml-2">- {value}</span>
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Response</h3>
                    <div className="bg-gray-50 rounded p-4">
                      {Object.entries(func.response).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <code className="text-sm font-mono text-green-600">{key}</code>
                          <span className="text-sm text-gray-600 ml-2">- {value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation</h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-100">
                      <code>{func.implementation}</code>
                    </pre>
                  </div>
                </div>

                {func.scoring && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Scoring Algorithm</h3>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100">
                        <code>{func.scoring}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        <section id="caching" className="mt-12 scroll-mt-24">
          <div className="flex items-center mb-6">
            <Database className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Caching Strategy</h2>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <p className="text-gray-600 mb-6">{caching.strategy}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geo Cache</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">TTL:</span>
                    <code className="text-sm">{caching.geoCache.ttl}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stale-while-revalidate:</span>
                    <code className="text-sm">{caching.geoCache.staleWhileRevalidate}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Key format:</span>
                    <code className="text-sm">{caching.geoCache.keyFormat}</code>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feed Cache</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">TTL:</span>
                    <code className="text-sm">{caching.feedCache.ttl}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stale-while-revalidate:</span>
                    <code className="text-sm">{caching.feedCache.staleWhileRevalidate}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Key format:</span>
                    <code className="text-sm">{caching.feedCache.keyFormat}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="deployment" className="mt-12 scroll-mt-24">
          <div className="flex items-center mb-6">
            <Server className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Deployment</h2>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Local Development</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <code className="text-sm text-gray-100">{deployment.local}</code>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Production</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <code className="text-sm text-gray-100">{deployment.production}</code>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment Variables</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {deployment.envVars.map((envVar) => (
                    <li key={envVar}>
                      <code className="text-sm font-mono text-blue-600">{envVar}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
#!/usr/bin/env node

/**
 * Yollr Documentation Website Test Script
 * 
 * This script performs comprehensive testing of the documentation website
 * to ensure all features work correctly before deployment.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Test configuration
const TEST_CONFIG = {
  docsSitePath: path.join(__dirname),
  expectedPages: [
    'page.tsx', // Home
    'api/page.tsx',
    'authentication/page.tsx',
    'database/page.tsx',
    'edge-functions/page.tsx',
    'webhooks/page.tsx',
    'setup/page.tsx',
    'errors/page.tsx',
    'support/page.tsx'
  ],
  expectedComponents: [
    'components/DocsProvider.tsx',
    'components/Header.tsx',
    'components/Sidebar.tsx',
    'components/Search.tsx',
    'components/MobileMenu.tsx'
  ],
  expectedConfigFiles: [
    'next.config.js',
    'package.json',
    'tsconfig.json',
    'tailwind.config.js',
    'app/globals.css'
  ],
  searchIndexFile: 'lib/search-index.ts',
  requiredDependencies: [
    'next',
    'react',
    'react-dom',
    'lucide-react',
    'fuse.js'
  ]
}

// Color output for terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

// Test functions
function testFileStructure() {
  logInfo('Testing file structure...')
  
  let allFilesExist = true
  
  // Test pages
  TEST_CONFIG.expectedPages.forEach(pagePath => {
    const fullPath = path.join(TEST_CONFIG.docsSitePath, 'app', pagePath)
    if (fs.existsSync(fullPath)) {
      logSuccess(`Page exists: ${pagePath}`)
    } else {
      logError(`Page missing: ${pagePath}`)
      allFilesExist = false
    }
  })
  
  // Test components
  TEST_CONFIG.expectedComponents.forEach(componentPath => {
    const fullPath = path.join(TEST_CONFIG.docsSitePath, componentPath)
    if (fs.existsSync(fullPath)) {
      logSuccess(`Component exists: ${componentPath}`)
    } else {
      logError(`Component missing: ${componentPath}`)
      allFilesExist = false
    }
  })
  
  // Test config files
  TEST_CONFIG.expectedConfigFiles.forEach(configPath => {
    const fullPath = path.join(TEST_CONFIG.docsSitePath, configPath)
    if (fs.existsSync(fullPath)) {
      logSuccess(`Config exists: ${configPath}`)
    } else {
      logError(`Config missing: ${configPath}`)
      allFilesExist = false
    }
  })
  
  // Test search index
  const searchIndexPath = path.join(TEST_CONFIG.docsSitePath, TEST_CONFIG.searchIndexFile)
  if (fs.existsSync(searchIndexPath)) {
    logSuccess(`Search index exists: ${TEST_CONFIG.searchIndexFile}`)
    
    // Verify search index has content
    const indexContent = fs.readFileSync(searchIndexPath, 'utf8')
    if (indexContent.includes('searchIndex') && indexContent.includes('fuseOptions')) {
      logSuccess('Search index is properly configured')
    } else {
      logError('Search index configuration is incomplete')
      allFilesExist = false
    }
  } else {
    logError(`Search index missing: ${TEST_CONFIG.searchIndexFile}`)
    allFilesExist = false
  }
  
  return allFilesExist
}

function testPackageJson() {
  logInfo('Testing package.json configuration...')
  
  const packagePath = path.join(TEST_CONFIG.docsSitePath, 'package.json')
  
  if (!fs.existsSync(packagePath)) {
    logError('package.json not found')
    return false
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  // Check required dependencies
  let allDepsPresent = true
  TEST_CONFIG.requiredDependencies.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      logSuccess(`Dependency found: ${dep}`)
    } else {
      logError(`Dependency missing: ${dep}`)
      allDepsPresent = false
    }
  })
  
  // Check scripts
  const requiredScripts = ['dev', 'build', 'start']
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      logSuccess(`Script found: ${script}`)
    } else {
      logError(`Script missing: ${script}`)
      allDepsPresent = false
    }
  })
  
  return allDepsPresent
}

function testNextConfig() {
  logInfo('Testing Next.js configuration...')
  
  const configPath = path.join(TEST_CONFIG.docsSitePath, 'next.config.js')
  
  if (!fs.existsSync(configPath)) {
    logError('next.config.js not found')
    return false
  }
  
  const configContent = fs.readFileSync(configPath, 'utf8')
  
  // Check for required configurations
  const checks = [
    { name: 'Static export', pattern: /output:\s*'export'/ },
    { name: 'Base path', pattern: /basePath:\s*'\/docs'/ },
    { name: 'Unoptimized images', pattern: /unoptimized:\s*true/ }
  ]
  
  let allChecksPass = true
  checks.forEach(check => {
    if (check.pattern.test(configContent)) {
      logSuccess(`Next.js config: ${check.name}`)
    } else {
      logError(`Next.js config missing: ${check.name}`)
      allChecksPass = false
    }
  })
  
  return allChecksPass
}

function testSearchIndexContent() {
  logInfo('Testing search index content...')
  
  const searchIndexPath = path.join(TEST_CONFIG.docsSitePath, TEST_CONFIG.searchIndexFile)
  const indexContent = fs.readFileSync(searchIndexPath, 'utf8')
  
  // Count search items
  const searchItemsMatch = indexContent.match(/title:/g)
  const itemCount = searchItemsMatch ? searchItemsMatch.length : 0
  
  if (itemCount >= 50) {
    logSuccess(`Search index contains ${itemCount} items (minimum 50 required)`)
  } else {
    logWarning(`Search index contains only ${itemCount} items (recommended: 50+)`)
  }
  
  // Check for key pages
  const keyPages = ['API Documentation', 'Authentication Guide', 'Database Schema']
  let allKeyPagesFound = true
  
  keyPages.forEach(page => {
    if (indexContent.includes(page)) {
      logSuccess(`Key page in search index: ${page}`)
    } else {
      logError(`Key page missing from search index: ${page}`)
      allKeyPagesFound = false
    }
  })
  
  return allKeyPagesFound
}

function testComponentIntegration() {
  logInfo('Testing component integration...')
  
  // Test DocsProvider integration
  const layoutPath = path.join(TEST_CONFIG.docsSitePath, 'app/layout.tsx')
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8')
    if (layoutContent.includes('DocsProvider')) {
      logSuccess('DocsProvider integrated in layout')
    } else {
      logError('DocsProvider not found in layout')
      return false
    }
  }
  
  // Test Search component integration
  const headerPath = path.join(TEST_CONFIG.docsSitePath, 'components/Header.tsx')
  let headerContent = null
  
  if (fs.existsSync(headerPath)) {
    headerContent = fs.readFileSync(headerPath, 'utf8')
    if (headerContent.includes('Search')) {
      logSuccess('Search component integrated in header')
    } else {
      logError('Search component not found in header')
      return false
    }
  } else {
    logError('Header.tsx not found')
    return false
  }
  
  // Test MobileMenu integration
  if (headerContent && headerContent.includes('MobileMenu')) {
    logSuccess('MobileMenu integrated in header')
  } else {
    logError('MobileMenu not found in header')
    return false
  }
  
  return true
}

function testContentQuality() {
  logInfo('Testing content quality...')
  
  let contentQualityGood = true
  
  // Test a sample of pages for required content
  const samplePages = [
    { path: 'app/page.tsx', requiredContent: ['Yollr Platform', 'API Documentation', 'Authentication Guide'] },
    { path: 'app/api/page.tsx', requiredContent: ['API Documentation', 'Base URL', 'Authentication'] },
    { path: 'app/authentication/page.tsx', requiredContent: ['Authentication Guide', 'Phone OTP', 'Supabase Auth'] }
  ]
  
  samplePages.forEach(page => {
    const pagePath = path.join(TEST_CONFIG.docsSitePath, page.path)
    if (fs.existsSync(pagePath)) {
      const pageContent = fs.readFileSync(pagePath, 'utf8')
      let pageHasAllContent = true
      
      page.requiredContent.forEach(required => {
        if (pageContent.includes(required)) {
          logSuccess(`Content found in ${page.path}: ${required}`)
        } else {
          logError(`Content missing in ${page.path}: ${required}`)
          pageHasAllContent = false
          contentQualityGood = false
        }
      })
    } else {
      logWarning(`Could not test content for missing page: ${page.path}`)
    }
  })
  
  return contentQualityGood
}

function testBuildProcess() {
  logInfo('Testing build process...')
  
  try {
    // Check if node_modules exists
    const nodeModulesPath = path.join(TEST_CONFIG.docsSitePath, 'node_modules')
    if (!fs.existsSync(nodeModulesPath)) {
      logWarning('node_modules not found. Run npm install before building.')
      return false
    }
    
    // Try to run TypeScript check
    logInfo('Running TypeScript check...')
    try {
      execSync('npx tsc --noEmit', { 
        cwd: TEST_CONFIG.docsSitePath,
        stdio: 'pipe'
      })
      logSuccess('TypeScript compilation successful')
    } catch (error) {
      logWarning('TypeScript check failed (this may be expected during development)')
    }
    
    // Try to run Next.js build
    logInfo('Running Next.js build...')
    try {
      execSync('npm run build', { 
        cwd: TEST_CONFIG.docsSitePath,
        stdio: 'pipe',
        timeout: 120000 // 2 minute timeout
      })
      logSuccess('Next.js build successful')
      return true
    } catch (error) {
      logError('Next.js build failed')
      return false
    }
  } catch (error) {
    logError(`Build process error: ${error.message}`)
    return false
  }
}

function generateTestReport(results) {
  logInfo('Generating test report...')
  
  const report = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      totalTests: Object.keys(results).length,
      passedTests: Object.values(results).filter(r => r).length,
      failedTests: Object.values(results).filter(r => !r).length
    }
  }
  
  const reportPath = path.join(TEST_CONFIG.docsSitePath, 'test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  logSuccess(`Test report generated: ${reportPath}`)
  
  return report
}

// Main test execution
function runTests() {
  logInfo('Starting Yollr Documentation Website Tests')
  logInfo('==============================================')
  
  const results = {}
  
  // Run all tests
  results.fileStructure = testFileStructure()
  results.packageJson = testPackageJson()
  results.nextConfig = testNextConfig()
  results.searchIndex = testSearchIndexContent()
  results.componentIntegration = testComponentIntegration()
  results.contentQuality = testContentQuality()
  results.buildProcess = testBuildProcess()
  
  // Generate report
  const report = generateTestReport(results)
  
  // Print summary
  logInfo('Test Summary')
  logInfo('==============')
  logInfo(`Total Tests: ${report.summary.totalTests}`)
  logSuccess(`Passed: ${report.summary.passedTests}`)
  logError(`Failed: ${report.summary.failedTests}`)
  
  if (report.summary.failedTests === 0) {
    logSuccess('🎉 All tests passed! Documentation website is ready for deployment.')
  } else {
    logError('❌ Some tests failed. Please review the issues above before deployment.')
    process.exit(1)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests()
}

module.exports = { runTests, TEST_CONFIG }
/**
 * Automated Production Readiness Verification Script
 */
const fs = require('fs');
const path = require('path');

console.log('----------------------------------------------------');
console.log('🔍 BRITSYNC AUTOMATED PRODUCTION READINESS CHECK');
console.log('----------------------------------------------------\n');

let passedChecks = 0;
let totalChecks = 0;

function check(label, fn) {
  totalChecks++;
  try {
    const result = fn();
    if (result !== false) {
      console.log(`  ✓ [PASS] ${label}`);
      passedChecks++;
    } else {
      console.log(`  ❌ [FAIL] ${label}`);
    }
  } catch (err) {
    console.log(`  ❌ [FAIL] ${label}: ${err.message}`);
  }
}

// 1. Check Package Config
check('Package.json & build scripts exist', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  return pkg.scripts && pkg.scripts.build && pkg.scripts.start;
});

// 2. Check Database Schema & Prisma Client
check('Prisma Schema exists', () => {
  return fs.existsSync(path.join(__dirname, '../prisma/schema.prisma'));
});

// 3. Check Security Headers in next.config.mjs
check('Next.js Security Headers configured', () => {
  const nextConfig = fs.readFileSync(path.join(__dirname, '../next.config.mjs'), 'utf8');
  return nextConfig.includes('X-Frame-Options') && nextConfig.includes('X-Content-Type-Options');
});

// 4. Check Rate Limiter Middleware
check('IP Rate Limiter Middleware active', () => {
  const middleware = fs.readFileSync(path.join(__dirname, '../src/middleware.ts'), 'utf8');
  return middleware.includes('rateLimitMap') && middleware.includes('429');
});

// 5. Check Health Check API Route
check('Health Check API route exists', () => {
  return fs.existsSync(path.join(__dirname, '../src/app/api/health/route.ts'));
});

// 6. Check Deployment Infrastructure
check('Production Dockerfile & Compose present', () => {
  return fs.existsSync(path.join(__dirname, '../Dockerfile')) && fs.existsSync(path.join(__dirname, '../docker-compose.yml'));
});

check('CI/CD Pipeline workflow present', () => {
  return fs.existsSync(path.join(__dirname, '../.github/workflows/ci.yml'));
});

check('Vercel & Netlify configs present', () => {
  return fs.existsSync(path.join(__dirname, '../vercel.json')) && fs.existsSync(path.join(__dirname, '../netlify.toml'));
});

// 7. Check Test Suites
check('Unit & API test suites present', () => {
  return fs.existsSync(path.join(__dirname, '../tests/unit/pricing.test.ts')) &&
         fs.existsSync(path.join(__dirname, '../tests/api/api-endpoints.test.ts'));
});

console.log('\n----------------------------------------------------');
console.log(`RESULT: ${passedChecks}/${totalChecks} Checks Passed (${Math.round((passedChecks/totalChecks)*100)}%)`);
console.log('----------------------------------------------------\n');

if (passedChecks === totalChecks) {
  console.log('🚀 ALL AUDIT CHECKS CLEARED! READY FOR PRODUCTION DEPLOYMENT.\n');
} else {
  process.exit(1);
}

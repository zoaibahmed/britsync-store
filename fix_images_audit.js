const { PrismaClient } = require('@prisma/client');
const http = require('http');
const https = require('https');
const prisma = new PrismaClient();

function testUrl(url) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return resolve({ url, status: 'INVALID_URL' });
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 4000 }, (res) => {
      resolve({ url, status: res.statusCode });
    });
    req.on('error', (e) => resolve({ url, status: `ERROR: ${e.message}` }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT' }); });
    req.end();
  });
}

async function auditAllImages() {
  console.log("=== AUDITING ALL IMAGE URLS ACROSS PLATFORM ===");

  const media = await prisma.media.findMany();
  console.log(`Auditing ${media.length} media records...`);
  
  const brokenList = [];
  const validList = [];

  for (const m of media) {
    let url = m.storageKey;
    if (!url.includes('?')) {
      // Append Unsplash params if missing
      url += '?auto=format&fit=crop&q=80&w=800';
    }
    const res = await testUrl(url);
    if (res.status !== 200 && res.status !== 301 && res.status !== 302) {
      brokenList.push({ id: m.id, original: m.storageKey, url: res.url, status: res.status });
    } else {
      validList.push({ id: m.id, original: m.storageKey });
    }
  }

  console.log(`\nResults: ${validList.length} valid images, ${brokenList.length} broken/failing images.`);
  if (brokenList.length > 0) {
    console.log("\nBroken Image URLs:");
    brokenList.forEach(b => console.log(`- ID ${b.id}: status=${b.status} | URL=${b.original}`));
  }

  await prisma.$disconnect();
}

auditAllImages().catch(err => {
  console.error(err);
  prisma.$disconnect();
});

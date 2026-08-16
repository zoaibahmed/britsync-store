// Run this after seed.js to add all missing lookup codes and seed RBAC operational staff users
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = 'britsync_salt_2026_secure';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

async function main() {
  console.log('Adding missing lookup codes & RBAC operational staff for BritSync production workflow...');

  // 1. User Role Lookups
  const roles = [
    { code: 'SUPER_ADMIN', description: 'Platform owner with ultimate system authority' },
    { code: 'ADMIN', description: 'Operations administrator' },
    { code: 'CEO', description: 'Governance Secretariat & Chief Executive' },
    { code: 'ACCREDITATION_OFFICER', description: 'Artisan application & studio identity reviewer' },
    { code: 'INSPECTOR', description: 'Guild Inspector & physical workshop auditor' },
    { code: 'CATALOG_CURATOR', description: 'Product quality & catalog moderation officer' },
    { code: 'FINANCE_OFFICER', description: 'Escrow, maker payouts & transaction ledger administrator' },
    { code: 'FULFILLMENT_OFFICER', description: 'Order shipping & courier dispatch monitor' },
    { code: 'CONCIERGE', description: 'Patron relation & bespoke custom commission specialist' },
    { code: 'PROVENANCE_OFFICER', description: 'Cryptographic provenance passport & wax seal authority' },
    { code: 'BI_OFFICER', description: 'Business intelligence & executive analytics officer' },
    { code: 'PLATFORM_ADMIN', description: 'Technical system configuration & user role manager' },
    { code: 'INTERNAL_AUDITOR', description: 'Compliance & immutable audit log auditor' },
    { code: 'MAKER', description: 'Master Artisan & Studio Owner' },
    { code: 'STUDIO_MANAGER', description: 'Studio manager / fulfillment delegate' },
    { code: 'BUYER', description: 'Global Patron & collector' },
  ];

  for (const role of roles) {
    await prisma.userRoleLookup.upsert({
      where: { code: role.code },
      create: role,
      update: { description: role.description },
    });
  }
  console.log(`✓ UserRoleLookup: ${roles.length} roles seeded.`);

  // 2. Verification Tier Lookups
  const newVerificationCodes = [
    { code: 'GENERAL', description: 'Digital identity and material checks' },
    { code: 'GUILD_VERIFIED', description: 'Full Guild verification — product submission unlocked' },
    { code: 'ROYAL_CHARTER', description: 'Elite invitation status — 12.5% commission, Gold Crest, priority placement' },
    { code: 'INCOMPLETE', description: 'Accreditation wizard started but not completed' },
    { code: 'PENDING_AUDIT', description: 'Application submitted — awaiting Guild Secretariat review' },
    { code: 'UNDER_REVIEW', description: 'Application under active review' },
    { code: 'REVISION_REQUIRED', description: 'Secretariat has requested changes to application' },
    { code: 'REJECTED', description: 'Application not approved' },
  ];

  for (const code of newVerificationCodes) {
    await prisma.verificationTierLookup.upsert({
      where: { code: code.code },
      create: code,
      update: { description: code.description },
    });
  }
  console.log(`✓ VerificationTierLookup seeded.`);

  // 3. Product Status Lookups
  const newProductStatusCodes = [
    { code: 'DRAFT', description: 'Draft listing in progress' },
    { code: 'SUBMITTED_FOR_REVIEW', description: 'Maker submitted product for CEO catalog review' },
    { code: 'CATALOG_REVIEW', description: 'Curator is actively reviewing this product' },
    { code: 'APPROVED', description: 'Approved for catalog' },
    { code: 'PUBLISHED', description: 'Live on storefront' },
    { code: 'REVISION_REQUIRED', description: 'Curator has requested changes to this product listing' },
    { code: 'REJECTED', description: 'Product rejected' },
  ];

  for (const code of newProductStatusCodes) {
    await prisma.productStatusLookup.upsert({
      where: { code: code.code },
      create: code,
      update: { description: code.description },
    });
  }
  console.log(`✓ ProductStatusLookup seeded.`);

  // 4. Order Status Lookups
  const newOrderStatuses = [
    { code: 'PENDING', description: 'Awaiting payment confirmation' },
    { code: 'CONFIRMED', description: 'Paid, funds held in transit ledger' },
    { code: 'ACCEPTED', description: 'Order accepted by maker, preparing to pack' },
    { code: 'PREPARING', description: 'Order being prepared and packed' },
    { code: 'PACKED', description: 'Order packed and ready for collection' },
    { code: 'SHIPPED', description: 'In transit in custom crating' },
    { code: 'DELIVERED', description: 'Delivered, escrow hold active' },
    { code: 'COMPLETED', description: 'Completed, funds released to Maker' },
    { code: 'DISPUTED', description: 'Held pending dispute resolution' },
  ];

  for (const code of newOrderStatuses) {
    await prisma.orderStatusLookup.upsert({
      where: { code: code.code },
      create: code,
      update: { description: code.description },
    });
  }
  console.log(`✓ OrderStatusLookup seeded.`);

  // 5. Seed RBAC Staff User Accounts (password: password123)
  const staffUsers = [
    { email: 'ceo@britsync.com', name: 'Alastair Sterling (CEO)', role: 'CEO' },
    { email: 'accreditation@britsync.com', name: 'Helena Vance (Accreditation Officer)', role: 'ACCREDITATION_OFFICER' },
    { email: 'inspector@britsync.com', name: 'Rupert Thorne (Guild Inspector)', role: 'INSPECTOR' },
    { email: 'curator@britsync.com', name: 'Evander Sinclair (Catalog Curator)', role: 'CATALOG_CURATOR' },
    { email: 'finance@britsync.com', name: 'Gideon Vance (Finance Officer)', role: 'FINANCE_OFFICER' },
    { email: 'logistics@britsync.com', name: 'Marcus Brody (Fulfillment Officer)', role: 'FULFILLMENT_OFFICER' },
    { email: 'concierge@britsync.com', name: 'Lady Genevieve (Patron Concierge)', role: 'CONCIERGE' },
    { email: 'provenance@britsync.com', name: 'Dr. Arthur Pendelton (Provenance Officer)', role: 'PROVENANCE_OFFICER' },
    { email: 'bi@britsync.com', name: 'Eleanor Frost (BI Analytics Officer)', role: 'BI_OFFICER' },
    { email: 'admin@britsync.com', name: 'Britsync Admin (Platform Admin)', role: 'ADMIN' },
    { email: 'auditor@britsync.com', name: 'Clara Oswald (Internal Auditor)', role: 'INTERNAL_AUDITOR' },
  ];

  for (const u of staffUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: hashPassword('password123'),
        isEmailVerified: true,
      },
      update: {
        role: u.role,
        isEmailVerified: true,
      }
    });
    console.log(`✓ User Account: ${u.email} (${u.role})`);
  }

  // 6. Seed Operational Tasks for "Requires Attention" Queue
  const sampleTasks = [
    {
      taskType: 'ACCREDITATION_REVIEW',
      targetRole: 'ACCREDITATION_OFFICER',
      referenceId: 'app-001',
      title: 'Review Studio Accreditation: Highgrove Glassworks',
      description: 'Step 1-4 completed. Identity and workshop photos ready for review.',
      priority: 'HIGH',
      status: 'OPEN',
      dueDate: new Date(Date.now() + 2 * 86400000),
    },
    {
      taskType: 'INSPECTION_ASSIGNED',
      targetRole: 'INSPECTOR',
      referenceId: 'audit-002',
      title: 'Field Audit Assigned: CotswoldsJoinery Studio',
      description: 'Physical GPS geofenced audit required for protected appellation verification.',
      priority: 'URGENT',
      status: 'OPEN',
      dueDate: new Date(Date.now() + 1 * 86400000),
    },
    {
      taskType: 'CATALOG_MODERATION',
      targetRole: 'CATALOG_CURATOR',
      referenceId: 'prod-003',
      title: 'Product Curation Review: Obsidian & Gold Goblet',
      description: 'Submitted by Artisan Tariq. Materials and 12.5% Royal Charter pricing require validation.',
      priority: 'MEDIUM',
      status: 'OPEN',
      dueDate: new Date(Date.now() + 3 * 86400000),
    },
    {
      taskType: 'PAYOUT_APPROVAL',
      targetRole: 'FINANCE_OFFICER',
      referenceId: 'payout-004',
      title: 'Payout Request Pending: £4,850.00 — Heritage Ceramics',
      description: 'Cleared balance available after 14-day escrow hold period.',
      priority: 'HIGH',
      status: 'OPEN',
      dueDate: new Date(Date.now() + 1 * 86400000),
    },
    {
      taskType: 'COMMISSION_REQUEST',
      targetRole: 'CONCIERGE',
      referenceId: 'bespoke-005',
      title: 'Bespoke Request: 22k Gold Filigree Crown Box',
      description: 'Submitted by Patron Lord Harrington (£12,500 budget). Match with Master Jeweler.',
      priority: 'HIGH',
      status: 'OPEN',
      dueDate: new Date(Date.now() + 2 * 86400000),
    },
  ];

  for (const t of sampleTasks) {
    const existing = await prisma.operationTask.findFirst({ where: { referenceId: t.referenceId } });
    if (!existing) {
      await prisma.operationTask.create({ data: t });
    }
  }
  console.log(`✓ Operational Tasks: Seeded sample Attention Queue tasks.`);

  console.log('\n✅ All RBAC staff users, lookups & operational tasks seeded successfully.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

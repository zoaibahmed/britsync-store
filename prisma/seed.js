const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const STORIES_DATA = require('./stories_data');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const COUNTRIES = [
  { name: 'Pakistan', code: 'PAK', markup: 5 },
  { name: 'Bangladesh', code: 'BGD', markup: 5 },
  { name: 'India', code: 'IND', markup: 5 },
  { name: 'Turkey', code: 'TUR', markup: 0 },
  { name: 'Morocco', code: 'MAR', markup: 0 },
  { name: 'Kenya', code: 'KEN', markup: 0 },
  { name: 'Ghana', code: 'GHA', markup: 0 },
  { name: 'Peru', code: 'PER', markup: 0 },
  { name: 'Mexico', code: 'MEX', markup: 0 },
  { name: 'Indonesia', code: 'IDN', markup: 0 }
];

const CATEGORIES = ['Ceramics', 'Textiles', 'Jewelry', 'Woodwork', 'Leather', 'Home Decor', 'Fashion', 'Art'];
const VERIFICATIONS = ['GENERAL', 'VERIFIED', 'ELITE', 'GI'];

const ARTISAN_IMAGES = [
  'https://images.unsplash.com/photo-1544256718-3bcf237f3974',
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e',
  'https://images.unsplash.com/photo-1581456495146-65a71b2c8e52',
  'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1',
  'https://images.unsplash.com/photo-1570114668478-439564cbacda'
];

const WORKSHOP_IMAGES = [
  'https://images.unsplash.com/photo-1588615419951-dc668b59fa87',
  'https://images.unsplash.com/photo-1452860606245-08befc0ff44b',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f',
  'https://images.unsplash.com/photo-1601662528567-526cd06f6582',
  'https://images.unsplash.com/photo-1560963503-455b88cb54a3'
];

const PRODUCT_BASE = {
  Ceramics: [
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61',
    'https://images.unsplash.com/photo-1565193566173-7a0cb3d162cc',
    'https://images.unsplash.com/photo-1576020799627-aeac76d580dc',
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f'
  ],
  Textiles: [
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d',
    'https://images.unsplash.com/photo-1528255915607-9012fda0f838',
    'https://images.unsplash.com/photo-1584852957448-f58c70a2cb93',
    'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2',
    'https://images.unsplash.com/photo-1544816155-12df9643f363'
  ],
  Jewelry: [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338',
    'https://images.unsplash.com/photo-1599643478524-fb52445cbf92',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e',
    'https://images.unsplash.com/photo-1611591475143-be232938b292'
  ],
  Woodwork: [
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126',
    'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7',
    'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1',
    'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7'
  ],
  Leather: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    'https://images.unsplash.com/photo-1584916201218-f4242ceb4809',
    'https://images.unsplash.com/photo-1590736704728-f4730bb30770',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
    'https://images.unsplash.com/photo-1563784462041-5f97ac9523dd'
  ],
  'Home Decor': [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f',
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5',
    'https://images.unsplash.com/photo-1505693314120-0d443867891c',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92'
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
    'https://images.unsplash.com/photo-1550614000-4b95d466f654',
    'https://images.unsplash.com/photo-1485230405346-71acb9518d9c',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105'
  ],
  Art: [
    'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
    'https://images.unsplash.com/photo-1579762715111-a6e1905e0721',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119',
    'https://images.unsplash.com/photo-1582562124811-c09040d0a901'
  ]
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const formatUrl = (id) => `${id}?auto=format&fit=crop&q=80&w=800`;

async function main() {
  console.log('Seeding Version 3 database for MySQL XAMPP environment...');

  // Disable FK constraints for clean, fast table truncates
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;').catch(() => {});

  const tables = [
    'UserRoleLookup', 'VerificationTierLookup', 'ProductStatusLookup', 'OrderStatusLookup',
    'LocationTranslation', 'Location', 'Country', 'MediaVariant', 'MediaMetadata',
    'MediaProcessingJob', 'Media', 'User', 'MakerProfile', 'InspectorProfile',
    'CategoryTranslation', 'Category', 'Product', 'ProductTranslation', 'ProductMediaMap',
    'InventoryLedger', 'StockReservation', 'PricingRule', 'PricingSnapshot',
    'MarkupHistory', 'ExchangeRate', 'LedgerEntry', 'LedgerTransaction',
    'LedgerAccount', 'Order', 'OrderItem', 'PaymentProvider', 'PaymentAccount',
    'PaymentTransaction', 'WalletTransaction', 'Wallet', 'ShipmentPackage',
    'ShipmentTracking', 'ShipmentEvent', 'Shipment', 'ReturnItem', 'ReturnRequest',
    'Refund', 'RefundReason', 'ReviewMedia', 'Review', 'SellerResponse',
    'WishlistItem', 'Wishlist', 'PassportEvent', 'PassportMedia', 'PassportSignature',
    'PassportHistory', 'ProductPassport', 'StoryTranslation', 'StoryMedia',
    'StoryVersion', 'MakerStory', 'NotificationTemplate', 'Notification',
    'NotificationLog', 'AiMessage', 'AiConversation', 'AiMemory', 'AiFeedback',
    'AiTrainingEvent', 'FraudSignal', 'ExecutedFraudDecision', 'FraudCase',
    'LoginHistory', 'SecurityEvent', 'ApiAccessLog', 'AdminAction', 'EventOutbox',
    'DailySales', 'DailyRevenue', 'ProductMetrics', 'MakerMetrics', 'Certificate',
    'SavedMaker', 'ShippingAddress', 'SupportTicket', 'VerificationRequest', 'InspectionReport',
    'CartItem', 'SupportTicketReply', 'ReviewHelpfulVote', 'ReviewReport'
  ];

  for (const t of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM \`${t}\`;`);
    } catch (e) {
      // Table might not exist or already be empty
    }
  }

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;').catch(() => {});

  // 1. Seed Lookups
  await prisma.userRoleLookup.createMany({
    data: [
      { code: 'SUPER_ADMIN', description: 'Platform owner with full system control' },
      { code: 'ADMIN', description: 'Operator managing listings and inspectors' },
      { code: 'INSPECTOR', description: 'Field curator conducting physical audits' },
      { code: 'BUYER', description: 'Premium customer/patron' },
      { code: 'MAKER', description: 'Artisan/creator' },
      { code: 'FINANCE', description: 'Finance administrator' },
      { code: 'STORY_TEAM', description: 'Editorial copywriter and photographer' }
    ]
  });

  await prisma.verificationTierLookup.createMany({
    data: [
      { code: 'GENERAL', description: 'Digital identity and material checks' },
      { code: 'VERIFIED', description: 'Verified business registration' },
      { code: 'ELITE', description: 'Physical GPS geofenced audit passed' },
      { code: 'GI', description: 'Legally certified Protected Appellation' }
    ]
  });

  await prisma.productStatusLookup.createMany({
    data: [
      { code: 'DRAFT', description: 'In progress creator listing' },
      { code: 'PENDING_REVIEW', description: 'Awaiting Admin curation approval' },
      { code: 'APPROVED', description: 'Approved but not yet visible on store' },
      { code: 'REJECTED', description: 'Curation checks failed' },
      { code: 'PUBLISHED', description: 'Visible and purchaseable' },
      { code: 'ARCHIVED', description: 'Removed from public catalogue' }
    ]
  });

  await prisma.orderStatusLookup.createMany({
    data: [
      { code: 'PENDING', description: 'Awaiting payment confirmation' },
      { code: 'CONFIRMED', description: 'Paid, funds held in transit ledger' },
      { code: 'SHIPPED', description: 'In transit in custom crating' },
      { code: 'DELIVERED', description: 'Delivered, safety buffer active' },
      { code: 'COMPLETED', description: 'Completed, funds released to Maker' },
      { code: 'DISPUTED', description: 'Held pending curator review' },
      { code: 'REFUNDED', description: 'Reversed payment' },
      { code: 'CANCELLED', description: 'Order cancelled before shipping' }
    ]
  });

  // 2. Seed Geography Location Tree (Materialized path ltree alternative)
  const rootLoc = await prisma.location.create({
    data: {
      path: 'globe',
      locationType: 'CONTINENT'
    }
  });

  const asiaLoc = await prisma.location.create({
    data: {
      parentId: rootLoc.id,
      path: 'globe.asia',
      locationType: 'CONTINENT'
    }
  });

  const europeLoc = await prisma.location.create({
    data: {
      parentId: rootLoc.id,
      path: 'globe.europe',
      locationType: 'CONTINENT'
    }
  });

  // Seed countries in lookup & location table
  const countryMap = {};
  for (const c of COUNTRIES) {
    const parentLoc = c.name === 'Turkey' || c.name === 'Morocco' || c.name === 'Kenya' || c.name === 'Ghana' ? rootLoc : asiaLoc;
    const pathNode = `globe.${parentLoc.path.split('.')[1]}.${c.name.toLowerCase()}`;
    
    const loc = await prisma.location.create({
      data: {
        parentId: parentLoc.id,
        path: pathNode,
        locationType: 'COUNTRY'
      }
    });

    const country = await prisma.country.create({
      data: {
        id: loc.id, // Primary key shared or linked
        name: c.name,
        code: c.code,
        markupModifierPercent: c.markup
      }
    });

    await prisma.locationTranslation.create({
      data: {
        locationId: loc.id,
        languageCode: 'en',
        name: c.name,
        description: `Authentic crafts originating from historical regions of ${c.name}.`
      }
    });

    countryMap[c.name] = loc;
  }

  // Create default villages for makers
  const villageMap = {};
  for (const cName of Object.keys(countryMap)) {
    const countryLoc = countryMap[cName];
    const pathNode = `${countryLoc.path}.rural_village`;
    const loc = await prisma.location.create({
      data: {
        parentId: countryLoc.id,
        path: pathNode,
        locationType: 'VILLAGE'
      }
    });
    await prisma.locationTranslation.create({
      data: {
        locationId: loc.id,
        languageCode: 'en',
        name: `${cName} Craft Village`,
        description: 'Generational workshop settlement'
      }
    });
    villageMap[cName] = loc;
  }

  // 3. Create Media Items for Curation
  const mediaItems = [];
  const allImages = [...ARTISAN_IMAGES, ...WORKSHOP_IMAGES];
  for (let i = 0; i < allImages.length; i++) {
    const med = await prisma.media.create({
      data: {
        originalFilename: `image_${i}.jpg`,
        mimeType: 'image/jpeg',
        fileSize: 452000,
        storageProvider: 'GCS',
        storageKey: allImages[i]
      }
    });
    mediaItems.push(med);
  }

  // 4. Create Users (Admin, Buyer, Inspectors, and Makers)
  const admin = await prisma.user.create({
    data: { email: 'admin@britsync.com', passwordHash: hashPassword('password123'), name: 'Britsync Admin', role: 'ADMIN' }
  });
  const buyer = await prisma.user.create({
    data: { email: 'buyer@example.com', passwordHash: hashPassword('password123'), name: 'Premium Collector', role: 'BUYER' }
  });

  // Create Wishlist for Buyer
  await prisma.wishlist.create({
    data: { buyerUserId: buyer.id }
  });

  // Create Inspectors
  const inspectors = [
    { email: 'tariq@britsync.com', name: 'Tariq M.', region: 'South Asia (Pakistan, India)' },
    { email: 'elena@britsync.com', name: 'Elena K.', region: 'Mediterranean (Turkey, Morocco)' }
  ];
  const inspectorProfiles = [];
  for (const ins of inspectors) {
    const u = await prisma.user.create({
      data: { email: ins.email, passwordHash: hashPassword('password123'), name: ins.name, role: 'INSPECTOR' }
    });
    const ip = await prisma.inspectorProfile.create({
      data: { userId: u.id, regionScope: ins.region }
    });
    inspectorProfiles.push(ip);
  }

  // Create categories & translations
  const categoryMap = {};
  for (const catName of CATEGORIES) {
    const cat = await prisma.category.create({ data: {} });
    await prisma.categoryTranslation.create({
      data: {
        categoryId: cat.id,
        languageCode: 'en',
        name: catName,
        description: `Generational masterworks under the ${catName} designation.`
      }
    });
    categoryMap[catName] = cat;
  }

  // 5. Generate 35 Makers & Profiles
  const makerProfiles = [];
  for (let i = 1; i <= 35; i++) {
    const countryName = getRandom(COUNTRIES).name;
    const countryLoc = countryMap[countryName];
    const verification = getRandom(VERIFICATIONS);

    const u = await prisma.user.create({
      data: { email: `maker${i}@example.com`, passwordHash: hashPassword('password123'), name: `Master Artisan ${i}`, role: 'MAKER' }
    });

    const maker = await prisma.makerProfile.create({
      data: {
        userId: u.id,
        businessName: `Heritage Studio ${i}`,
        locationId: countryLoc.id,
        verificationStatus: verification,
        yearsInBusiness: Math.floor(Math.random() * 50) + 1,
        employeeCount: Math.floor(Math.random() * 40) + 2,
        coverMediaId: getRandom(mediaItems).id,
        founderMediaId: getRandom(mediaItems).id,
        geofence: JSON.stringify([[40.7128, -74.0060], [40.7130, -74.0062], [40.7125, -74.0068]])
      }
    });

    // Create Maker Wallet
    await prisma.wallet.create({
      data: { makerProfileId: maker.id, clearedBalance: 0.00 }
    });

    makerProfiles.push(maker);
  }

  // 6. Generate 110 Products & Translations
  for (let i = 1; i <= 110; i++) {
    const maker = getRandom(makerProfiles);
    const categoryName = getRandom(CATEGORIES);
    const category = categoryMap[categoryName];
    
    // Reverse-lookup country name from location
    const parentCountryLoc = await prisma.location.findUnique({
      where: { id: maker.locationId }
    });
    const cName = COUNTRIES.find(c => parentCountryLoc.path.includes(c.name.toLowerCase()))?.name || 'Pakistan';
    const villageLoc = villageMap[cName];

    const isEliteOrGI = i % 2 === 0;
    const vStatus = isEliteOrGI ? (Math.random() > 0.5 ? 'ELITE' : 'GI') : 'GENERAL';
    const priceBase = isEliteOrGI ? (Math.floor(Math.random() * 800) + 300) : (Math.floor(Math.random() * 150) + 30);

    const product = await prisma.product.create({
      data: {
        makerProfileId: maker.id,
        categoryId: category.id,
        locationId: villageLoc.id,
        desiredPrice: priceBase,
        inventory: Math.floor(Math.random() * 15) + 1,
        verificationStatus: vStatus,
        status: 'PUBLISHED'
      }
    });

    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        languageCode: 'en',
        name: `Authentic ${categoryName} Masterpiece ${i}`,
        description: `A stunning handcrafted masterpiece representing traditional regional methods.`,
        story: `Passed down through multiple generations, this craft reflects the heritage of ${cName}.`,
        careInstructions: 'Spot clean only. Do not expose to direct heat.',
        shippingInfo: isEliteOrGI ? 'Premium Crated Cargo (5-8 days)' : 'Standard tracked air mail',
        returnPolicy: '30-day return policy'
      }
    });

    // Map 5 Product Media Images per product from category pool
    const catImgs = PRODUCT_BASE[categoryName] || PRODUCT_BASE['Textiles'];
    for (let imgIdx = 0; imgIdx < catImgs.length; imgIdx++) {
      const med = await prisma.media.create({
        data: {
          originalFilename: `seed_prod_${i}_img_${imgIdx}.jpg`,
          mimeType: 'image/jpeg',
          fileSize: 452000,
          storageProvider: 'GCS',
          storageKey: `${catImgs[imgIdx]}?auto=format&fit=crop&q=80&w=800`
        }
      });

      await prisma.productMediaMap.create({
        data: {
          productId: product.id,
          mediaId: med.id,
          isHero: imgIdx === 0,
          sortOrder: imgIdx
        }
      });
    }

    // Seed stock card replenishment
    await prisma.inventoryLedger.create({
      data: {
        productId: product.id,
        quantityDelta: product.inventory,
        referenceType: 'STOCK_IN'
      }
    });

    // Generate Passport for ELITE or GI products
    if (['ELITE', 'GI'].includes(product.verificationStatus)) {
      const passport = await prisma.productPassport.create({
        data: {
          passportSerial: `BS-PASSPORT-${i}-${product.id.slice(0, 8).toUpperCase()}`,
          productId: product.id
        }
      });

      await prisma.passportEvent.create({
        data: {
          productPassportId: passport.id,
          eventType: 'CREATED',
          description: 'Provenance passport initialized at workshop creation.'
        }
      });
    }

    // Generate Reviews
    if (Math.random() > 0.3) {
      await prisma.review.create({
        data: {
          productId: product.id,
          buyerUserId: buyer.id,
          rating: 5,
          comment: 'Outstanding quality and story documentation. Truly a rare treasure.',
          isVerifiedPurchase: true,
          moderationStatus: 'APPROVED'
        }
      });
    }
  }

  // 7. Seed Maker Stories
  console.log('Generating 30 unique Maker Stories...');
  const shuffledMakers = [...makerProfiles].sort(() => 0.5 - Math.random());
  for (let i = 0; i < STORIES_DATA.length; i++) {
    const sData = STORIES_DATA[i];
    const maker = shuffledMakers[i];
    if (!maker) break;
    const cName = sData.country || 'Pakistan';
    const villageLoc = villageMap[cName] || getRandom(Object.values(villageMap));

    const story = await prisma.makerStory.create({
      data: {
        makerProfileId: maker.id,
        villageId: villageLoc.id,
        heroMediaId: getRandom(mediaItems).id,
        isPublished: true
      }
    });

    await prisma.storyTranslation.create({
      data: {
        makerStoryId: story.id,
        languageCode: 'en',
        title: sData.title,
        excerpt: sData.excerpt,
        content: sData.content,
        craftType: sData.craft
      }
    });
  }

  console.log('Database seeded successfully with dynamic lookup trees, accounts, and catalog products.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

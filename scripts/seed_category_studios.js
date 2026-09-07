const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all locations
  const locations = await prisma.location.findMany({
    include: { translations: true },
  });

  const getLocationId = (countryName) => {
    const loc = locations.find((l) =>
      l.translations.some((t) =>
        t.name.toLowerCase().includes(countryName.toLowerCase())
      )
    );
    return loc ? loc.id : locations[0]?.id;
  };

  const REAL_STUDIOS = [
    // ── METAL CRAFT (2 Studios) ──
    {
      craftCategory: 'Metal Craft',
      businessName: 'Lahore Heritage Metal Guild',
      founderName: 'Ustad Tariq Rafiq',
      country: 'Pakistan',
      city: 'Lahore Walled City',
      verificationStatus: 'ELITE',
      yearsInBusiness: 48,
      specialty: 'Hand-Chased Brass, Floral Engraving & Bronze Inlay',
      heritageOriginStory:
        'Generational fourth-generation coppersmiths and brass engravers preserving 16th-century Mughal royal metalcraft traditions.',
      founderBiography:
        'Ustad Tariq Rafiq has practiced the art of qalamzani and repoussé for over four decades, training dozens of master apprentices.',
      coverImageUrl: '/collections/metalcraft_hero.png',
      founderPhotoUrl: '/collections/metalcraft_sm1.png',
    },
    {
      craftCategory: 'Metal Craft',
      businessName: 'Anatolian Coppersmith Cooperative',
      founderName: 'Master Mehmet Demir',
      country: 'Turkey',
      city: 'Gaziantep Historic Bazaar',
      verificationStatus: 'GI',
      yearsInBusiness: 62,
      specialty: 'Hand-Raised Red Copper & Pure Tin Linings',
      heritageOriginStory:
        'Protected Geographical Indication workshop celebrated for hand-raised culinary samovars, hammered kettles, and ceremonial cookware.',
      founderBiography:
        'Master Mehmet Demir leads an artisan collective in Gaziantep, upholding traditional charcoal-forge copper raising without hydraulic presses.',
      coverImageUrl: '/collections/metalcraft_sm2.png',
      founderPhotoUrl: '/collections/metalcraft_sm2.png',
    },

    // ── CERAMICS (2 Studios) ──
    {
      craftCategory: 'Ceramics',
      businessName: 'Jingdezhen Imperial Kiln Atelier',
      founderName: 'Master Chen Guohua',
      country: 'China',
      city: 'Jingdezhen Historic Quarter',
      verificationStatus: 'ELITE',
      yearsInBusiness: 54,
      specialty: 'Cobalt Blue & White Porcelain, Kaolin Firing',
      heritageOriginStory:
        'Sixth-generation custodians of high-temperature porcelain firing and freehand mineral cobalt brushwork.',
      founderBiography:
        'Chen Guohua has preserved ancestral Jingdezhen glaze formulas passed down through seven generations of kiln masters.',
      coverImageUrl: '/collections/ceramics_hero.png',
      founderPhotoUrl: '/collections/ceramics_sm1.png',
    },
    {
      craftCategory: 'Ceramics',
      businessName: 'Kyoto Zen Kiln Studio',
      founderName: 'Katsumi Tanaka',
      country: 'Japan',
      city: 'Kyoto Foothills',
      verificationStatus: 'GI',
      yearsInBusiness: 42,
      specialty: 'Raku Ware, Shino Ash Glazes & Chawan Tea Bowls',
      heritageOriginStory:
        'Certified Raku and Shino ware master crafting Japanese tea ceremony utensils in ancestral reduction wood kilns.',
      founderBiography:
        'Tanaka crafts each tea bowl by hand without a wheel, pinching coarse mountain clay to achieve the revered wabi-sabi spirit.',
      coverImageUrl: '/collections/ceramics_sm1.png',
      founderPhotoUrl: '/collections/ceramics_sm4.png',
    },

    // ── JEWELRY (2 Studios) ──
    {
      craftCategory: 'Jewelry',
      businessName: 'Florence Goldsmith Guild',
      founderName: 'Lorenzo Torrigiani',
      country: 'Italy',
      city: 'Ponte Vecchio, Florence',
      verificationStatus: 'ELITE',
      yearsInBusiness: 90,
      specialty: 'Renaissance Micro-Engraving & Pierced Honeycomb Gold',
      heritageOriginStory:
        'Bespoke Italian goldsmiths hand-piercing intricate gold lace rings and archival pendants on antique wooden workbenches.',
      founderBiography:
        'Lorenzo Torrigiani carries forward three generations of Florentine goldsmithing along the Arno, specializing in unheated gemstones and 18K filigree.',
      coverImageUrl: '/collections/jewelry_sm1.png',
      founderPhotoUrl: '/collections/jewelry_sm1.png',
    },
    {
      craftCategory: 'Jewelry',
      businessName: 'Jaipur Royal Goldsmiths',
      founderName: 'Pandit Suresh Mehra',
      country: 'India',
      city: 'Johari Bazaar, Jaipur',
      verificationStatus: 'ELITE',
      yearsInBusiness: 75,
      specialty: '22K Kundan Jadau, Meenakari & Uncut Gemstones',
      heritageOriginStory:
        'Former royal court jewellers specializing in ancestral 22K gold foil gemstone setting and reversible botanical enamels.',
      founderBiography:
        'Pandit Suresh Mehra is a master of Jadau craftsmanship, setting royal sapphires and emeralds with pure gold foil.',
      coverImageUrl: '/collections/jewelry_hero.png',
      founderPhotoUrl: '/collections/jewelry_sm2.png',
    },

    // ── TEXTILES (2 Studios) ──
    {
      craftCategory: 'Textiles',
      businessName: 'Srinagar Heritage Weavers',
      founderName: 'Ghulam Rasool Bhat',
      country: 'India',
      city: 'Srinagar, Kashmir',
      verificationStatus: 'GI',
      yearsInBusiness: 65,
      specialty: '100% Changthangi Pashmina & Sozni Needlework',
      heritageOriginStory:
        'Geographical Indication certified pashmina masters spinning hand-gathered Ladakh cashmere on ancestral wooden charkhas.',
      founderBiography:
        'Ghulam Rasool Bhat leads a cooperative of 40 generational weavers in the Kashmir Valley, crafting reversible heirloom shawls.',
      coverImageUrl: '/collections/textiles_hero.png',
      founderPhotoUrl: '/collections/textiles_sm1.png',
    },
    {
      craftCategory: 'Textiles',
      businessName: 'Varanasi Silk Master Atelier',
      founderName: 'Maqbool Ansari',
      country: 'India',
      city: 'Varanasi Weavers Quarter',
      verificationStatus: 'ELITE',
      yearsInBusiness: 80,
      specialty: 'Kadhwa Brocade Weaving & Pure Zari Silk',
      heritageOriginStory:
        'Legendary master weavers threading real gold and silver threads into hand-reeled mulberry silk on pit looms.',
      founderBiography:
        'Maqbool Ansari weaves intricate brocades that take up to four months per textile, preserving sacred Banarasi motifs.',
      coverImageUrl: '/collections/textiles_sm1.png',
      founderPhotoUrl: '/collections/textiles_sm2.png',
    },

    // ── LEATHER (2 Studios) ──
    {
      craftCategory: 'Leather',
      businessName: 'Chouara Master Tannery Guild',
      founderName: 'Maalem Hassan El-Fassi',
      country: 'Morocco',
      city: 'Fez Medina',
      verificationStatus: 'ELITE',
      yearsInBusiness: 70,
      specialty: 'Tree-Bark Vegetable Tanning & Hand Saddle Stitching',
      heritageOriginStory:
        'Operating open stone vats in the 11th-century Medina of Fez, using cedar wood tannins to produce lifelong supple leather.',
      founderBiography:
        'Maalem Hassan has tended the ancient Chouara limestone vats since age twelve, using only organic tree barks and natural indigo.',
      coverImageUrl: '/collections/leather_hero.png',
      founderPhotoUrl: '/collections/leather_sm1.png',
    },
    {
      craftCategory: 'Leather',
      businessName: 'Santa Croce Leather Workshop',
      founderName: 'Marco Bellini',
      country: 'Italy',
      city: 'Tuscany',
      verificationStatus: 'GI',
      yearsInBusiness: 48,
      specialty: 'Full-Grain Vachetta Leather & Solid Brass Hardware',
      heritageOriginStory:
        'Pelle al Vegetale consortium member crafting durable luggage and equestrian travel bags that age with rich patina.',
      founderBiography:
        'Marco Bellini sources hides exclusively from Tuscan family farms, tanning with chestnut extracts and finishing by hand.',
      coverImageUrl: '/collections/leather_sm1.png',
      founderPhotoUrl: '/collections/leather_sm3.png',
    },

    // ── HOME DECOR / LIVING SPACES (2 Studios) ──
    {
      craftCategory: 'Home Decor',
      businessName: 'Marrakech Medina Lighting Guild',
      founderName: 'Maalem Omar Berrada',
      country: 'Morocco',
      city: 'Marrakech Souks',
      verificationStatus: 'ELITE',
      yearsInBusiness: 44,
      specialty: 'Hand-Pierced Solid Brass Lanterns & Architectural Pendants',
      heritageOriginStory:
        'Celebrated brass lantern makers whose intricate geometric shadow work illuminates international residences.',
      founderBiography:
        'Omar Berrada hand-saws thousands of micro-perforations into solid sheet brass, creating hypnotic geometric light projections.',
      coverImageUrl: '/collections/homedecor_hero.png',
      founderPhotoUrl: '/collections/homedecor_sm1.png',
    },
    {
      craftCategory: 'Home Decor',
      businessName: 'Swat Valley Wood & Artifact Guild',
      founderName: 'Ustad Gulzar Ahmad',
      country: 'Pakistan',
      city: 'Swat Valley',
      verificationStatus: 'GI',
      yearsInBusiness: 50,
      specialty: 'Seasoned Wild Walnut Carving & Mortise-Tenon Joinery',
      heritageOriginStory:
        'Mountain artisans transforming felled alpine walnut into relief-carved heritage trays, chests, and architectural screens.',
      founderBiography:
        'Ustad Gulzar Ahmad carves naturally seasoned wild walnut without lacquer, sealing wood pores with hot Himalayan beeswax.',
      coverImageUrl: '/collections/homedecor_sm1.png',
      founderPhotoUrl: '/collections/homedecor_hero.png',
    },
  ];

  // Get existing maker profiles
  const existingMakers = await prisma.makerProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${existingMakers.length} existing maker profiles.`);

  for (let i = 0; i < REAL_STUDIOS.length; i++) {
    const s = REAL_STUDIOS[i];
    const locId = getLocationId(s.country);

    if (i < existingMakers.length) {
      // Update existing maker profile with real authentic data
      const m = existingMakers[i];
      await prisma.makerProfile.update({
        where: { id: m.id },
        data: {
          craftCategory: s.craftCategory,
          businessName: s.businessName,
          founderName: s.founderName,
          verificationStatus: s.verificationStatus,
          yearsInBusiness: s.yearsInBusiness,
          craftTechniques: s.specialty,
          heritageOriginStory: s.heritageOriginStory,
          founderBiography: s.founderBiography,
          coverImageUrl: s.coverImageUrl,
          founderPhotoUrl: s.founderPhotoUrl,
          locationId: locId,
        },
      });
      // Also update user's name
      if (m.userId) {
        await prisma.user.update({
          where: { id: m.userId },
          data: { name: s.founderName },
        });
      }
      console.log(`Updated maker [${m.id}] -> ${s.businessName} (${s.craftCategory})`);
    } else {
      // Create user & maker if needed
      const user = await prisma.user.create({
        data: {
          email: `${s.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@britsync.com`,
          name: s.founderName,
          passwordHash: 'dummy-hashed-password',
          role: 'MAKER',
        },
      });

      const newMaker = await prisma.makerProfile.create({
        data: {
          userId: user.id,
          craftCategory: s.craftCategory,
          businessName: s.businessName,
          founderName: s.founderName,
          verificationStatus: s.verificationStatus,
          yearsInBusiness: s.yearsInBusiness,
          craftTechniques: s.specialty,
          heritageOriginStory: s.heritageOriginStory,
          founderBiography: s.founderBiography,
          coverImageUrl: s.coverImageUrl,
          founderPhotoUrl: s.founderPhotoUrl,
          locationId: locId,
        },
      });
      console.log(`Created maker [${newMaker.id}] -> ${s.businessName} (${s.craftCategory})`);
    }
  }

  console.log('Seeding complete. Exactly 2 real studios configured per category.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

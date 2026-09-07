import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import CategoryClient, { AtelierStudioItem } from './CategoryClient';

export const dynamic = 'force-dynamic';

// Curated Master Studios by Craft Discipline
const DISCIPLINE_STUDIOS: Record<
  string,
  {
    title: string;
    tagline: string;
    description: string;
    defaultStudios: AtelierStudioItem[];
  }
> = {
  'metal craft': {
    title: 'Metal Craft',
    tagline: 'Hand-Forged Damascus Steel, Chased Brass & Hammered Copper',
    description:
      'Verified master metalcraft studios, forge ateliers, and coppersmith guilds. Every workshop is on-site audited with GPS provenance and direct artisan patron escrow.',
    defaultStudios: [
      {
        id: 'studio-lahore-01',
        businessName: 'Lahore Heritage Metal Guild',
        founderName: 'Ustad Tariq Rafiq',
        country: 'Pakistan',
        city: 'Lahore Walled City',
        verificationStatus: 'ELITE',
        yearsInBusiness: 48,
        registeredWorksCount: 18,
        specialty: 'Hand-Chased Brass, Floral Engraving & Bronze Inlay',
        shortIntro:
          'Generational fourth-generation coppersmiths and brass engravers preserving 16th-century Mughal royal metalcraft traditions.',
        heroImage: '/collections/metalcraft_hero.png',
        logo: '/collections/metalcraft_sm1.png',
      },
      {
        id: 'studio-anatolia-01',
        businessName: 'Anatolian Coppersmith Cooperative',
        founderName: 'Master Mehmet Demir',
        country: 'Turkey',
        city: 'Gaziantep Historic Bazaar',
        verificationStatus: 'GI',
        yearsInBusiness: 62,
        registeredWorksCount: 15,
        specialty: 'Hand-Raised Red Copper & Pure Tin Linings',
        shortIntro:
          'Protected Geographical Indication workshop celebrated for hand-raised culinary samovars, hammered kettles, and ceremonial cookware.',
        heroImage: '/collections/metalcraft_sm2.png',
        logo: '/collections/metalcraft_sm2.png',
      },
      {
        id: 'studio-toledo-01',
        businessName: 'Toledo Armoury & Steel Guild',
        founderName: 'Don Carlos Mendoza',
        country: 'Spain',
        city: 'Toledo Historic Quarter',
        verificationStatus: 'ELITE',
        yearsInBusiness: 85,
        registeredWorksCount: 12,
        specialty: 'Pattern-Welded Damascus Steel & Damascening',
        shortIntro:
          'Heirloom master bladesmiths and geometric steel engravers upholding Spanish pattern-welding and gold wire damascening techniques.',
        heroImage: '/collections/metalcraft_sm3.png',
        logo: '/collections/metalcraft_sm3.png',
      },
      {
        id: 'studio-moradabad-01',
        businessName: 'Moradabad Brass Custodians',
        founderName: 'Artisan Zameer Ansari',
        country: 'India',
        city: 'Moradabad',
        verificationStatus: 'VERIFIED',
        yearsInBusiness: 36,
        registeredWorksCount: 22,
        specialty: 'Lost-Wax Cast Solid Brass & Architectural Finials',
        shortIntro:
          'Specialists in heavyweight lost-wax cast architectural candleholders, openwork vessels, and decorative temple brassware.',
        heroImage: '/collections/metalcraft_sm4.png',
        logo: '/collections/metalcraft_sm4.png',
      },
      {
        id: 'studio-isfahan-01',
        businessName: 'Isfahan Metalworks Guild',
        founderName: 'Ustad Reza Esfahani',
        country: 'Iran',
        city: 'Naqsh-e Jahan Atelier',
        verificationStatus: 'ELITE',
        yearsInBusiness: 50,
        registeredWorksCount: 14,
        specialty: 'Qalamzani Chasing & Bell Bronze Etching',
        shortIntro:
          'Ancestral workshop crafting intricately chiseled bronze ceremonial platters and repoussé vessels with microscopic arabesques.',
        heroImage: '/collections/metalcraft_sm1.png',
        logo: '/collections/metalcraft_hero.png',
      },
      {
        id: 'studio-fez-01',
        businessName: 'Place Seffarine Brass Atelier',
        founderName: 'Maalem Abdelkader',
        country: 'Morocco',
        city: 'Fez Medina',
        verificationStatus: 'VERIFIED',
        yearsInBusiness: 42,
        registeredWorksCount: 16,
        specialty: 'Hammered Brass Cauldrons & Moorish Lantern Plates',
        shortIntro:
          'Echoing the centuries-old rhythm of Place Seffarine, hand-raising massive architectural vessels from solid raw sheet brass.',
        heroImage: '/collections/metalcraft_hero.png',
        logo: '/collections/metalcraft_sm3.png',
      },
    ],
  },
  ceramics: {
    title: 'Ceramics',
    tagline: 'Wheel-Thrown Porcelain, Celadon Glazes & Ancestral Climbing Kilns',
    description:
      'Certified master ceramicists, porcelain workshops, and wood-fired kiln studios. Discover generational ceramicists crafting enduring art with verifiable origin passports.',
    defaultStudios: [
      {
        id: 'studio-jingde-01',
        businessName: 'Jingdezhen Imperial Kiln Atelier',
        founderName: 'Master Chen Guohua',
        country: 'China',
        city: 'Jingdezhen Historic Quarter',
        verificationStatus: 'ELITE',
        yearsInBusiness: 54,
        registeredWorksCount: 26,
        specialty: 'Cobalt Blue & White Porcelain, Kaolin Firing',
        shortIntro:
          'Sixth-generation custodians of high-temperature porcelain firing and freehand mineral cobalt brushwork.',
        heroImage: '/collections/ceramics_hero.png',
        logo: '/collections/ceramics_sm1.png',
      },
      {
        id: 'studio-kyoto-01',
        businessName: 'Kyoto Zen Kiln Studio',
        founderName: 'Katsumi Tanaka',
        country: 'Japan',
        city: 'Kyoto Foothills',
        verificationStatus: 'GI',
        yearsInBusiness: 42,
        registeredWorksCount: 19,
        specialty: 'Raku Ware, Shino Ash Glazes & Chawan Tea Bowls',
        shortIntro:
          'Certified Raku and Shino ware master crafting Japanese tea ceremony utensils in ancestral reduction wood kilns.',
        heroImage: '/collections/ceramics_sm1.png',
        logo: '/collections/ceramics_sm4.png',
      },
      {
        id: 'studio-arita-01',
        businessName: 'Arita Heritage Porcelain',
        founderName: 'Shinji Sakaida',
        country: 'Japan',
        city: 'Arita, Saga Prefecture',
        verificationStatus: 'ELITE',
        yearsInBusiness: 68,
        registeredWorksCount: 21,
        specialty: 'Overglaze Enamels & Eggshell Thin Porcelain',
        shortIntro:
          'Upholding 400 years of Imari and Arita porcelain traditions with handcrafted lidded jars and delicate tableware.',
        heroImage: '/collections/ceramics_sm2.png',
        logo: '/collections/ceramics_sm2.png',
      },
      {
        id: 'studio-longquan-01',
        businessName: 'Longquan Celadon Masters',
        founderName: 'Master Zhang Ming',
        country: 'China',
        city: 'Zhejiang',
        verificationStatus: 'GI',
        yearsInBusiness: 38,
        registeredWorksCount: 15,
        specialty: 'Jade Iron-Reduction Celadon Glazes',
        shortIntro:
          'Dedicated to reviving Song Dynasty celadon formulas, famous for jade-like thick glazes and subtle crackle lines.',
        heroImage: '/collections/ceramics_sm3.png',
        logo: '/collections/ceramics_sm3.png',
      },
    ],
  },
  jewelry: {
    title: 'Jewellery',
    tagline: 'Royal Filigree, Uncut Gemstones & 22K Granulation',
    description:
      'Heirloom master goldsmiths, filigree ateliers, and gemstone cutters. Authenticated with spectrographic metal assays and direct fair-mined verification.',
    defaultStudios: [
      {
        id: 'studio-jaipur-01',
        businessName: 'Jaipur Royal Goldsmiths',
        founderName: 'Pandit Suresh Mehra',
        country: 'India',
        city: 'Johari Bazaar, Jaipur',
        verificationStatus: 'ELITE',
        yearsInBusiness: 75,
        registeredWorksCount: 31,
        specialty: '22K Kundan Jadau, Meenakari & Uncut Gemstones',
        shortIntro:
          'Former royal court jewellers specializing in ancestral 22K gold foil gemstone setting and reversible botanical enamels.',
        heroImage: '/collections/jewelry_hero.png',
        logo: '/collections/jewelry_sm1.png',
      },
      {
        id: 'studio-florence-01',
        businessName: 'Florence Goldsmith Guild',
        founderName: 'Lorenzo Torrigiani',
        country: 'Italy',
        city: 'Ponte Vecchio, Florence',
        verificationStatus: 'ELITE',
        yearsInBusiness: 90,
        registeredWorksCount: 24,
        specialty: 'Renaissance Micro-Engraving & Pierced Honeycomb Gold',
        shortIntro:
          'Bespoke Italian goldsmiths hand-piercing intricate gold lace rings and archival pendants on antique wooden workbenches.',
        heroImage: '/collections/jewelry_sm1.png',
        logo: '/collections/jewelry_sm1.png',
      },
      {
        id: 'studio-cordoba-01',
        businessName: 'Cordoba Goldsmith Atelier',
        founderName: 'Rafael Gomez',
        country: 'Spain',
        city: 'Cordoba Historic Center',
        verificationStatus: 'VERIFIED',
        yearsInBusiness: 45,
        registeredWorksCount: 18,
        specialty: 'Mudejar Gold Filigree & Chiseled Bangles',
        shortIntro:
          'Drawing 18K solid gold wire through fine diamond dies to create architectural Spanish filigree bracelets and earrings.',
        heroImage: '/collections/jewelry_sm2.png',
        logo: '/collections/jewelry_sm3.png',
      },
    ],
  },
  textiles: {
    title: 'Textiles',
    tagline: 'Hand-Loomed Pashmina, Mulberry Silk & Natural Indigo',
    description:
      'Centuries-old weaving collectives, master dyers, and embroidery ateliers preserving organic fibers and wooden fly-shuttle looms.',
    defaultStudios: [
      {
        id: 'studio-srinagar-01',
        businessName: 'Srinagar Heritage Weavers',
        founderName: 'Ghulam Rasool Bhat',
        country: 'India',
        city: 'Srinagar, Kashmir',
        verificationStatus: 'GI',
        yearsInBusiness: 65,
        registeredWorksCount: 24,
        specialty: '100% Changthangi Pashmina & Sozni Needlework',
        shortIntro:
          'Geographical Indication certified pashmina masters spinning hand-gathered Ladakh cashmere on ancestral wooden charkhas.',
        heroImage: '/collections/textiles_hero.png',
        logo: '/collections/textiles_sm1.png',
      },
      {
        id: 'studio-varanasi-01',
        businessName: 'Varanasi Silk Master Atelier',
        founderName: 'Maqbool Ansari',
        country: 'India',
        city: 'Varanasi Weavers Quarter',
        verificationStatus: 'ELITE',
        yearsInBusiness: 80,
        registeredWorksCount: 29,
        specialty: 'Kadhwa Brocade Weaving & Pure Zari Silk',
        shortIntro:
          'Legendary master weavers threading real gold and silver threads into hand-reeled mulberry silk on pit looms.',
        heroImage: '/collections/textiles_sm1.png',
        logo: '/collections/textiles_sm2.png',
      },
      {
        id: 'studio-fergana-01',
        businessName: 'Fergana Valley Weavers Guild',
        founderName: 'Mirza Alimov',
        country: 'Uzbekistan',
        city: 'Margilan',
        verificationStatus: 'VERIFIED',
        yearsInBusiness: 52,
        registeredWorksCount: 17,
        specialty: 'Abrbandi Cloud Silk & Natural Plant Indigo',
        shortIntro:
          'Central Asian Silk Road artisans hand-tying and dyeing raw silk threads before weaving intricate geometric ikat textiles.',
        heroImage: '/collections/textiles_sm3.png',
        logo: '/collections/textiles_sm4.png',
      },
    ],
  },
  leather: {
    title: 'Leather',
    tagline: 'Vegetable-Tanned Hides, Hand Saddle-Stitching & Patina Craft',
    description:
      'Historic stone-vat tanneries, saddle workshops, and bespoke leather ateliers using bark tannins and two-needle hand stitching.',
    defaultStudios: [
      {
        id: 'studio-chouara-01',
        businessName: 'Chouara Master Tannery Guild',
        founderName: 'Maalem Hassan El-Fassi',
        country: 'Morocco',
        city: 'Fez Medina',
        verificationStatus: 'ELITE',
        yearsInBusiness: 70,
        registeredWorksCount: 28,
        specialty: 'Tree-Bark Vegetable Tanning & Hand Saddle Stitching',
        shortIntro:
          'Operating open stone vats in the 11th-century Medina of Fez, using cedar wood tannins to produce lifelong supple leather.',
        heroImage: '/collections/leather_hero.png',
        logo: '/collections/leather_sm1.png',
      },
      {
        id: 'studio-santacroce-01',
        businessName: 'Santa Croce Leather Workshop',
        founderName: 'Marco Bellini',
        country: 'Italy',
        city: 'Tuscany',
        verificationStatus: 'GI',
        yearsInBusiness: 48,
        registeredWorksCount: 22,
        specialty: 'Full-Grain Vachetta Leather & Solid Brass Hardware',
        shortIntro:
          'Pelle al Vegetale consortium member crafting durable luggage and equestrian travel bags that age with rich patina.',
        heroImage: '/collections/leather_sm1.png',
        logo: '/collections/leather_sm3.png',
      },
      {
        id: 'studio-cordovan-01',
        businessName: 'Cordovan Leather Guild',
        founderName: 'Javier Castillo',
        country: 'Spain',
        city: 'Cordoba',
        verificationStatus: 'ELITE',
        yearsInBusiness: 60,
        registeredWorksCount: 19,
        specialty: 'Equine Shell Cordovan & Hand-Burnished Waxed Edges',
        shortIntro:
          'Specialized atelier hand-crafting enduring wallets and small leather goods from dense, mirror-finished shell cordovan.',
        heroImage: '/collections/leather_sm2.png',
        logo: '/collections/leather_hero.png',
      },
    ],
  },
  'home decor': {
    title: 'Living Spaces',
    tagline: 'Hand-Pierced Lanterns, Carved Walnut & Architectural Artifacts',
    description:
      'Curated architectural artisans, pierced brass light studios, and heritage wood joiners crafting timeless focal points for sanctuaries.',
    defaultStudios: [
      {
        id: 'studio-marrakech-01',
        businessName: 'Marrakech Medina Lighting Guild',
        founderName: 'Maalem Omar Berrada',
        country: 'Morocco',
        city: 'Marrakech Souks',
        verificationStatus: 'ELITE',
        yearsInBusiness: 44,
        registeredWorksCount: 16,
        specialty: 'Hand-Pierced Solid Brass Lanterns & Architectural Pendants',
        shortIntro:
          'Celebrated brass lantern makers whose intricate geometric shadow work illuminates international residences.',
        heroImage: '/collections/homedecor_hero.png',
        logo: '/collections/homedecor_sm1.png',
      },
      {
        id: 'studio-swat-01',
        businessName: 'Swat Valley Wood & Artifact Guild',
        founderName: 'Ustad Gulzar Ahmad',
        country: 'Pakistan',
        city: 'Swat Valley',
        verificationStatus: 'GI',
        yearsInBusiness: 50,
        registeredWorksCount: 20,
        specialty: 'Seasoned Wild Walnut Carving & Mortise-Tenon Joinery',
        shortIntro:
          'Mountain artisans transforming felled alpine walnut into relief-carved heritage trays, chests, and architectural screens.',
        heroImage: '/collections/homedecor_sm1.png',
        logo: '/collections/homedecor_hero.png',
      },
      {
        id: 'studio-cairo-01',
        businessName: 'Khan el-Khalili Architectural Foundry',
        founderName: 'Farouk El-Sayed',
        country: 'Egypt',
        city: 'Cairo',
        verificationStatus: 'VERIFIED',
        yearsInBusiness: 65,
        registeredWorksCount: 18,
        specialty: 'Lost-Wax Sand Cast Brass & Openwork Incense Vessels',
        shortIntro:
          'Master brass foundry casting heavyweight architectural sconces, incense censers, and decorative metal vessels.',
        heroImage: '/collections/homedecor_sm2.png',
        logo: '/collections/homedecor_sm2.png',
      },
    ],
  },
};

const SLUG_MAP: Record<string, string> = {
  'metal craft': 'metal craft',
  'metal': 'metal craft',
  'metalcraft': 'metal craft',
  'ceramics': 'ceramics',
  'ceramic': 'ceramics',
  'pottery': 'ceramics',
  'jewellery': 'jewelry',
  'jewelry': 'jewelry',
  'textiles': 'textiles',
  'textile': 'textiles',
  'weaving': 'textiles',
  'leather': 'leather',
  'leathercraft': 'leather',
  'home decor': 'home decor',
  'home-decor': 'home decor',
  'living spaces': 'home decor',
  'livingspaces': 'home decor',
  'woodwork': 'metal craft',
  'art': 'ceramics',
  'fashion': 'textiles',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const decoded = decodeURIComponent(rawCategory);
  const normalizedKey = SLUG_MAP[decoded.toLowerCase().trim()] || 'metal craft';
  const data = DISCIPLINE_STUDIOS[normalizedKey] || DISCIPLINE_STUDIOS['metal craft'];

  return {
    title: `${data.title} Certified Studios & Master Ateliers | Britsync Registry`,
    description: data.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ search?: string; maker?: string }>;
}) {
  const { category: rawCategory } = await params;
  const decodedCategory = decodeURIComponent(rawCategory);
  const normalizedKey = SLUG_MAP[decodedCategory.toLowerCase().trim()] || 'metal craft';
  const disciplineInfo = DISCIPLINE_STUDIOS[normalizedKey] || DISCIPLINE_STUDIOS['metal craft'];

  // Fetch real database makers matching category or verified makers
  let dbStudios: AtelierStudioItem[] = [];
  try {
    const rawMakers = await prisma.makerProfile.findMany({
      where: {
        verificationStatus: {
          in: ['VERIFIED', 'ELITE', 'GI'],
        },
      },
      take: 8,
      include: {
        user: true,
        coverMedia: true,
        founderMedia: true,
        location: {
          include: {
            translations: true,
          },
        },
        products: {
          select: { id: true },
        },
      },
    });

    if (rawMakers.length > 0) {
      dbStudios = rawMakers.map((m) => {
        const country =
          m.location?.translations?.find((t: any) => t.languageCode === 'en')?.name ||
          'Global';
        const heroImage =
          m.coverMedia?.storageKey ||
          disciplineInfo.defaultStudios[0]?.heroImage ||
          '/collections/metalcraft_hero.png';
        const logo = m.founderMedia?.storageKey || m.coverMedia?.storageKey || heroImage;

        return {
          id: m.id,
          businessName: m.businessName || m.user?.name || 'Heritage Atelier',
          founderName: m.user?.name || 'Master Craftsman',
          country,
          city: country,
          verificationStatus: m.verificationStatus || 'VERIFIED',
          yearsInBusiness: m.yearsInBusiness || 20,
          registeredWorksCount: m.products?.length || 8,
          specialty: `${disciplineInfo.title} Craftsmanship & Provenance`,
          shortIntro:
            m.businessStory ||
            m.founderStory ||
            `Dedicated master artisan studio specializing in authenticated ${disciplineInfo.title} heritage craft.`,
          heroImage,
          logo,
        };
      });
    }
  } catch (err) {
    console.error('Error querying DB studios:', err);
  }

  // Combine curated studios with DB studios (curated first, then any unique DB studios)
  const combinedStudios = [
    ...disciplineInfo.defaultStudios,
    ...dbStudios.filter(
      (s) =>
        !disciplineInfo.defaultStudios.some(
          (ds) => ds.businessName.toLowerCase() === s.businessName.toLowerCase()
        )
    ),
  ];

  return (
    <CategoryClient
      disciplineTitle={disciplineInfo.title}
      tagline={disciplineInfo.tagline}
      description={disciplineInfo.description}
      studios={combinedStudios}
    />
  );
}

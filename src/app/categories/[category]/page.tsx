import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import CategoryClient, { AtelierStudioItem } from './CategoryClient';

export const dynamic = 'force-dynamic';

const CATEGORY_MAP: Record<string, string> = {
  'metal craft': 'Metal Craft',
  'metal': 'Metal Craft',
  'metalcraft': 'Metal Craft',
  'ceramics': 'Ceramics',
  'ceramic': 'Ceramics',
  'pottery': 'Ceramics',
  'jewellery': 'Jewelry',
  'jewelry': 'Jewelry',
  'textiles': 'Textiles',
  'textile': 'Textiles',
  'weaving': 'Textiles',
  'leather': 'Leather',
  'leathercraft': 'Leather',
  'home decor': 'Home Decor',
  'home-decor': 'Home Decor',
  'living spaces': 'Home Decor',
  'livingspaces': 'Home Decor',
  'woodwork': 'Home Decor',
  'art': 'Ceramics',
  'fashion': 'Textiles',
};

const CATEGORY_METADATA: Record<
  string,
  {
    title: string;
    tagline: string;
    description: string;
  }
> = {
  'Metal Craft': {
    title: 'Metal Craft',
    tagline: 'Hand-Forged Damascus Steel, Chased Brass & Hammered Copper',
    description:
      'Verified master metalcraft studios, forge ateliers, and coppersmith guilds. Every workshop is on-site audited with GPS provenance and direct artisan patron escrow.',
  },
  Ceramics: {
    title: 'Ceramics',
    tagline: 'Wheel-Thrown Porcelain, Celadon Glazes & Ancestral Climbing Kilns',
    description:
      'Certified master ceramicists, porcelain workshops, and wood-fired kiln studios. Discover generational ceramicists crafting enduring art with verifiable origin passports.',
  },
  Jewelry: {
    title: 'Jewellery',
    tagline: 'Royal Filigree, Uncut Gemstones & 22K Granulation',
    description:
      'Heirloom master goldsmiths, filigree ateliers, and gemstone cutters. Authenticated with spectrographic metal assays and direct fair-mined verification.',
  },
  Textiles: {
    title: 'Textiles',
    tagline: 'Hand-Loomed Pashmina, Mulberry Silk & Natural Indigo',
    description:
      'Centuries-old weaving collectives, master dyers, and embroidery ateliers preserving organic fibers and wooden fly-shuttle looms.',
  },
  Leather: {
    title: 'Leather',
    tagline: 'Vegetable-Tanned Hides, Hand Saddle-Stitching & Patina Craft',
    description:
      'Historic stone-vat tanneries, saddle workshops, and bespoke leather ateliers using bark tannins and two-needle hand stitching.',
  },
  'Home Decor': {
    title: 'Living Spaces',
    tagline: 'Hand-Pierced Lanterns, Carved Walnut & Architectural Artifacts',
    description:
      'Curated architectural artisans, pierced brass light studios, and heritage wood joiners crafting timeless focal points for sanctuaries.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const decoded = decodeURIComponent(rawCategory).toLowerCase().trim();
  const catName = CATEGORY_MAP[decoded] || 'Metal Craft';
  const meta = CATEGORY_METADATA[catName] || CATEGORY_METADATA['Metal Craft'];

  return {
    title: `${meta.title} Certified Studios & Master Ateliers | Britsync Registry`,
    description: meta.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ search?: string; maker?: string }>;
}) {
  const { category: rawCategory } = await params;
  const decodedCategory = decodeURIComponent(rawCategory).toLowerCase().trim();
  const canonicalCategory = CATEGORY_MAP[decodedCategory] || 'Metal Craft';
  const meta = CATEGORY_METADATA[canonicalCategory] || CATEGORY_METADATA['Metal Craft'];

  // Fetch exactly 2 studios for this category directly from the database
  let dbMakers = await prisma.makerProfile.findMany({
    where: {
      craftCategory: canonicalCategory,
    },
    take: 2,
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

  // Fallback if none found with exact craftCategory
  if (dbMakers.length === 0) {
    dbMakers = await prisma.makerProfile.findMany({
      take: 2,
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
  }

  // Map 100% of the studio fields directly from the database record
  const studios: AtelierStudioItem[] = dbMakers.map((m) => {
    const country =
      m.location?.translations?.find((t: any) => t.languageCode === 'en')?.name ||
      'Global';

    const heroImage =
      m.coverImageUrl ||
      m.coverMedia?.storageKey ||
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200';

    const logo =
      m.founderPhotoUrl ||
      m.founderMedia?.storageKey ||
      m.coverImageUrl ||
      heroImage;

    return {
      id: m.id,
      businessName: m.businessName || m.user?.name || 'Heritage Atelier',
      founderName: m.founderName || m.user?.name || 'Master Artisan',
      country,
      city: country,
      verificationStatus: m.verificationStatus || 'ELITE',
      yearsInBusiness: m.yearsInBusiness || 25,
      registeredWorksCount: m.products ? m.products.length : 12,
      specialty: m.craftTechniques || m.craftPhilosophy || `${canonicalCategory} Craftsmanship`,
      shortIntro:
        m.heritageOriginStory ||
        m.founderBiography ||
        m.businessStory ||
        'Preserving generations of artisanal heritage with authenticated provenance.',
      heroImage,
      logo,
    };
  });

  return (
    <CategoryClient
      disciplineTitle={meta.title}
      tagline={meta.tagline}
      description={meta.description}
      studios={studios}
    />
  );
}

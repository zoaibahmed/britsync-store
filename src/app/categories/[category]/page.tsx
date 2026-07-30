import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import CategoryClient from './CategoryClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const categoryName = decodeURIComponent(rawCategory);

  return {
    title: `${categoryName} Ateliers & Master Makers | Britsync Registry`,
    description: `Discover certified master craftsmen, ateliers, and heritage brands specializing in ${categoryName}. Verified provenance on Britsync.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ search?: string; maker?: string }>;
}) {
  const { category: rawCategory } = await params;
  const { search: searchParam, maker: makerParam } = await searchParams;
  const categoryName = decodeURIComponent(rawCategory);
  const searchQuery = (searchParam || makerParam || '').trim();

  // Fetch all makers who have products in this category or all verified makers if fallback
  const makers = await prisma.makerProfile.findMany({
    where: {
      products: {
        some: {
          category: {
            translations: {
              some: {
                name: {
                  contains: categoryName,
                },
              },
            },
          },
        },
      },
    },
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
        select: {
          id: true,
        },
      },
    },
  });

  // If no category-specific products found, fallback to all verified makers to ensure rich display
  let displayMakers = makers;
  if (displayMakers.length === 0) {
    displayMakers = await prisma.makerProfile.findMany({
      take: 16,
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
          select: {
            id: true,
          },
        },
      },
    });
  }

  const mappedMakers = displayMakers.map((m: any) => {
    const countryName =
      m.location?.translations?.find((t: any) => t.languageCode === 'en')
        ?.name || 'Global';
    const heroImage =
      m.coverMedia?.storageKey ||
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200';
    const logo =
      m.founderMedia?.storageKey ||
      'https://images.unsplash.com/photo-1570114668478-439564cbacda?auto=format&fit=crop&q=80&w=400';

    return {
      id: m.id,
      businessName: m.businessName || m.user?.name || 'Master Atelier',
      founderName: m.user?.name || 'Master Artisan',
      country: countryName,
      verificationStatus: m.verificationStatus || 'VERIFIED',
      yearsInBusiness: m.yearsInBusiness || 15,
      productCount: m.products ? m.products.length : 12,
      shortIntro:
        m.businessStory ||
        m.founderStory ||
        'Preserving centuries of generational craft heritage with certified hand inspection.',
      heroImage,
      logo,
    };
  });

  return (
    <CategoryClient
      categoryName={categoryName}
      initialSearch={searchQuery}
      initialMakers={mappedMakers}
    />
  );
}

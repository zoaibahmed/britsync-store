import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { calculateSellingPrice } from '@/lib/pricing';
import MakerDetailsClient from '@/components/MakerDetailsClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const maker = await prisma.makerProfile.findUnique({
    where: { id },
    include: {
      user: true,
      location: {
        include: {
          translations: true
        }
      },
      coverMedia: true
    }
  });

  if (!maker) return {};

  const name = maker.user?.name || maker.businessName || 'Master Artisan';
  const countryName = maker.location?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'Global';
  const title = `${name} | Master Artisan At Ateliers of ${countryName} | Britsync`;
  const description = `Discover authentic, certified heritage craft and products by master artisan ${name} in ${countryName}. Verified provenance on Britsync.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://britsync.com/makers/${id}`
    },
    openGraph: {
      title,
      description,
      url: `https://britsync.com/makers/${id}`,
      type: 'profile',
      images: maker.coverMedia?.storageKey ? [maker.coverMedia.storageKey] : []
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export default async function MakerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const maker = await prisma.makerProfile.findUnique({
    where: { id },
    include: {
      user: true,
      coverMedia: true,
      founderMedia: true,
      location: {
        include: {
          translations: true
        }
      },
      products: {
        include: {
          category: {
            include: {
              translations: true
            }
          },
          translations: true,
          mediaMaps: {
            include: {
              media: true
            }
          }
        }
      },
      stories: {
        include: {
          translations: true,
          heroMedia: true
        }
      }
    }
  });

  if (!maker) {
    notFound();
  }

  const countryName = maker.location?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'Global';

  // Map maker profile for client component backward compatibility
  const mappedMaker = {
    ...maker,
    country: countryName,
    coverImage: maker.coverMedia?.storageKey || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600',
    founderPhoto: maker.founderMedia?.storageKey || 'https://images.unsplash.com/photo-1570114668478-439564cbacda?auto=format&fit=crop&q=80&w=800',
    founderName: maker.user?.name || 'Master Artisan',
    founderStory: 'Dedicated to preserving local heritage and craft traditions.',
    businessStory: 'A multi-generational craft workshop.',
    mission: 'To preserve traditional craftsmanship and build a legacy.',
    impactStory: 'Creating sustainable local jobs for rural artisans.',
    workshopGallery: '[]',
    teamPhotos: '[]',
    productionPhotos: '[]',
    lifestylePhotos: '[]'
  };

  const mappedProducts = maker.products.map((product: any) => {
    const translation = product.translations.find((t: any) => t.languageCode === 'en') || product.translations[0] || {};
    const catName = product.category.translations.find((t: any) => t.languageCode === 'en')?.name || 'General';
    const imageUrls = product.mediaMaps.map((m: any) => m.media.storageKey);
    const fallbackList = imageUrls.length > 0 ? imageUrls : [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800"
    ];

    return {
      ...product,
      name: translation.name || '',
      description: translation.description || '',
      story: translation.story || '',
      images: JSON.stringify(fallbackList),
      price: calculateSellingPrice(product.desiredPrice, catName, undefined, product.verificationStatus),
      category: {
        name: catName
      }
    };
  });

  // Map stories
  let mappedStories = null;
  if (maker.stories) {
    const sTrans = maker.stories.translations.find((t: any) => t.languageCode === 'en') || maker.stories.translations[0] || {};
    mappedStories = {
      ...maker.stories,
      title: sTrans.title || '',
      excerpt: sTrans.excerpt || '',
      content: sTrans.content || '',
      craft: sTrans.craftType || '',
      heroImage: maker.stories.heroMedia?.storageKey || 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1200'
    };
  }

  // Fetch similar makers
  const dbSimilarMakers = await prisma.makerProfile.findMany({
    where: { id: { not: id } },
    take: 4,
    include: {
      user: true,
      coverMedia: true,
      founderMedia: true,
      location: {
        include: {
          translations: true
        }
      },
      products: {
        select: { id: true }
      }
    }
  });

  const similarMakers = dbSimilarMakers.map((sm: any) => ({
    id: sm.id,
    businessName: sm.businessName || sm.user?.name || 'Master Atelier',
    founderName: sm.user?.name || 'Master Artisan',
    country: sm.location?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'Global',
    verificationStatus: sm.verificationStatus || 'VERIFIED',
    productCount: sm.products ? sm.products.length : 8,
    heroImage: sm.coverMedia?.storageKey || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
    logo: sm.founderMedia?.storageKey || 'https://images.unsplash.com/photo-1570114668478-439564cbacda?auto=format&fit=crop&q=80&w=400'
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://britsync.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Collections",
        "item": "https://britsync.com/collections"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": mappedMaker.founderName,
        "item": `https://britsync.com/makers/${id}`
      }
    ]
  };

  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <MakerDetailsClient 
        maker={mappedMaker as any} 
        products={mappedProducts as any} 
        stories={mappedStories as any} 
        similarMakers={similarMakers as any}
      />
    </main>
  );
}

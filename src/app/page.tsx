import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';
import { calculateSellingPrice } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const dbProducts = await prisma.product.findMany({
    include: {
      maker: {
        include: {
          location: {
            include: {
              translations: true
            }
          }
        }
      },
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
    },
    take: 30
  });

  const mappedProducts = dbProducts.map(p => {
    const translation = p.translations.find((t: any) => t.languageCode === 'en') || p.translations[0] || {};
    const catName = p.category.translations.find((t: any) => t.languageCode === 'en')?.name || 'General';
    const imageUrls = p.mediaMaps.map((m: any) => m.media.storageKey);
    const mainImage = imageUrls[0] || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800';

    return {
      id: p.id,
      name: translation.name || 'Product',
      maker: {
        businessName: p.maker.businessName,
        name: p.maker.businessName,
        locationName: p.maker.location?.translations?.[0]?.name || 'United Kingdom'
      },
      price: calculateSellingPrice(p.desiredPrice, catName, undefined, p.verificationStatus),
      image: mainImage,
      images: imageUrls.length > 0 ? imageUrls : [mainImage],
      category: catName,
      badge: p.verificationStatus === 'GI' ? 'Protected Appellation' : p.verificationStatus === 'ELITE' ? 'Atelier Elite' : 'Signature Heritage',
      verificationStatus: p.verificationStatus
    };
  });

  const eliteProducts = mappedProducts.filter(p => p.verificationStatus === 'ELITE' || p.verificationStatus === 'GI').slice(0, 4);
  const generalProducts = mappedProducts.filter(p => p.verificationStatus === 'GENERAL').slice(0, 4);

  return <HomeClient eliteProducts={eliteProducts} generalProducts={generalProducts} />;
}

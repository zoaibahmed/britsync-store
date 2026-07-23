import { prisma } from '@/lib/prisma';
import { calculateSellingPrice } from '@/lib/pricing';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      mediaMaps: {
        include: {
          media: true
        }
      },
      maker: {
        include: {
          user: true,
          location: {
            include: {
              translations: true
            }
          }
        }
      }
    }
  });

  if (!product) return {};

  const pTrans = product.translations.find((t) => t.languageCode === 'en') || product.translations[0] || {};
  const catTrans = product.category?.translations?.find((t) => t.languageCode === 'en') || product.category?.translations[0] || {};
  const makerName = product.maker?.user?.name || product.maker?.businessName || 'Master Artisan';

  const title = `${pTrans.name || 'Masterwork'} by ${makerName} | Britsync`;
  const description = pTrans.description || `Acquire authentic certified ${catTrans.name || 'heritage craft'} masterwork created by ${makerName}. Verified on Britsync Global Registry.`;
  const images = product.mediaMaps.map((m) => m.media.storageKey);

  return {
    title,
    description,
    alternates: {
      canonical: `https://britsync.com/products/${id}`
    },
    openGraph: {
      title,
      description,
      url: `https://britsync.com/products/${id}`,
      type: 'website',
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1200']
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      mediaMaps: {
        include: {
          media: true
        }
      },
      maker: {
        include: {
          user: true
        }
      }
    }
  });

  const pTrans: any = product?.translations.find((t: any) => t.languageCode === 'en') || product?.translations[0] || {};
  const makerName = product?.maker?.user?.name || product?.maker?.businessName || 'Master Artisan';
  const catName = product?.category?.translations?.find((t) => t.languageCode === 'en')?.name || 'General';
  const price = product ? calculateSellingPrice(product.desiredPrice, catName, undefined, product.verificationStatus) : 0;
  const images = product?.mediaMaps.map((m) => m.media.storageKey) || [];

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
        "name": "Search",
        "item": "https://britsync.com/search"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": pTrans.name || 'Product',
        "item": `https://britsync.com/products/${resolvedParams.id}`
      }
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": pTrans.name || 'Masterwork',
    "image": images.length > 0 ? images : ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1200'],
    "description": pTrans.description || 'Authentic heritage masterwork',
    "category": catName,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "GBP",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": makerName
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailsClient params={resolvedParams} />
    </>
  );
}

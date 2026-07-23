import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { calculateSellingPrice } from '@/lib/pricing';
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const story = await prisma.makerStory.findUnique({
    where: { id },
    include: {
      translations: true,
      heroMedia: true,
      maker: {
        include: {
          user: true
        }
      }
    }
  });

  if (!story) return {};

  const sTrans = story.translations.find((t: any) => t.languageCode === 'en') || story.translations[0] || {};
  const title = `${sTrans.title || 'Atelier Story'} | Britsync Chronicles`;
  const description = sTrans.excerpt || `Read the heritage provenance story of master artisan ${story.maker?.user?.name || 'Artisan'} on Britsync.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://britsync.com/stories/${id}`
    },
    openGraph: {
      title,
      description,
      url: `https://britsync.com/stories/${id}`,
      type: 'article',
      images: story.heroMedia?.storageKey ? [story.heroMedia.storageKey] : []
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export default async function StoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const dbStory = await prisma.makerStory.findUnique({
    where: { id },
    include: {
      translations: true,
      heroMedia: true,
      village: {
        include: {
          translations: true,
          parent: {
            include: {
              translations: true
            }
          }
        }
      },
      maker: {
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
            },
            take: 4
          }
        }
      }
    }
  });

  if (!dbStory) {
    notFound();
  }

  const sTrans = dbStory.translations.find((t: any) => t.languageCode === 'en') || dbStory.translations[0] || {};
  const getCraftHeroPhoto = (craft: string, storageKey?: string | null) => {
    if (storageKey && storageKey.startsWith('http')) return storageKey;
    const c = (craft || '').toLowerCase();
    if (c.includes('ceramic') || c.includes('pottery') || c.includes('zellige')) return 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1600';
    if (c.includes('textile') || c.includes('weave') || c.includes('silk') || c.includes('pashmina') || c.includes('carpet')) return 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1600';
    if (c.includes('jewel') || c.includes('silver') || c.includes('gold') || c.includes('metal')) return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1600';
    if (c.includes('wood') || c.includes('carv') || c.includes('marquetry')) return 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1600';
    if (c.includes('leather') || c.includes('tann')) return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1600';
    return 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600';
  };

  const vName = dbStory.village?.translations.find((t: any) => t.languageCode === 'en')?.name || 'Craft Village';
  const cName = dbStory.village?.parent?.translations.find((t: any) => t.languageCode === 'en')?.name || 'Global';
  const craftTypeStr = sTrans.craftType || 'Heritage Craft';

  // Map story details
  const story = {
    ...dbStory,
    title: sTrans.title || 'Master Artisan Chronicle',
    excerpt: sTrans.excerpt || 'Discover the generational lineage and certified craft techniques of this heritage atelier.',
    content: sTrans.content || '',
    craft: craftTypeStr,
    village: vName,
    country: cName,
    heroImage: getCraftHeroPhoto(craftTypeStr, dbStory.heroMedia?.storageKey),
    maker: {
      ...dbStory.maker,
      country: cName,
      coverImage: dbStory.maker.coverMedia?.storageKey || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600',
      founderPhoto: dbStory.maker.founderMedia?.storageKey || 'https://images.unsplash.com/photo-1570114668478-439564cbacda?auto=format&fit=crop&q=80&w=800',
      founderName: dbStory.maker.user?.name || 'Master Artisan',
      founderStory: 'Dedicated to preserving local heritage and craft traditions.',
      businessStory: 'A multi-generational craft workshop.',
      mission: 'To preserve traditional craftsmanship and build a legacy.',
      impactStory: 'Creating sustainable local jobs for rural artisans.',
    }
  };

  const mappedProducts = dbStory.maker.products.map((product: any) => {
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
      images: JSON.stringify(fallbackList),
      price: calculateSellingPrice(product.desiredPrice, catName, undefined, product.verificationStatus),
      category: {
        name: catName
      }
    };
  });

  // Fetch related stories
  const dbRelated = await prisma.makerStory.findMany({
    where: { id: { not: story.id } },
    take: 3,
    include: {
      translations: true,
      heroMedia: true,
      village: {
        include: {
          translations: true,
          parent: {
            include: {
              translations: true
            }
          }
        }
      },
      maker: true
    }
  });

  const relatedStories = dbRelated.map((r: any) => {
    const trans = r.translations.find((t: any) => t.languageCode === 'en') || r.translations[0] || {};
    const vn = r.village?.translations.find((t: any) => t.languageCode === 'en')?.name || 'Craft Village';
    const cn = r.village?.parent?.translations.find((t: any) => t.languageCode === 'en')?.name || 'Global';

    return {
      ...r,
      title: trans.title || '',
      excerpt: trans.excerpt || '',
      craft: trans.craftType || '',
      village: vn,
      country: cn,
      heroImage: r.heroMedia?.storageKey || 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1200'
    };
  });

  const photography: string[] = [];
  const timeline: { year: string; event: string }[] = [
    { year: "Generational", event: "Workshop heritage established" },
    { year: "Continuous", event: "Curation & preservation audit passed" }
  ];

  const getVerificationText = (status: string) => {
    switch (status) {
      case 'ELITE': return 'Atelier Elite Master';
      case 'GI': return 'Protected Appellation Custodian';
      case 'VERIFIED': return 'Signature Heritage Partner';
      default: return 'Signature Artisan';
    }
  };

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
        "name": "Stories",
        "item": "https://britsync.com/stories"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": story.title,
        "item": `https://britsync.com/stories/${id}`
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": story.title,
    "description": story.excerpt,
    "image": [
      story.heroImage
    ],
    "author": [{
      "@type": "Person",
      "name": story.maker.founderName,
      "url": `https://britsync.com/makers/${story.maker.id}`
    }]
  };

  return (
    <main className="animate-fade-in" style={{ backgroundColor: 'var(--background)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Cinematic Light Luxury Hero */}
      <section style={{
        height: '75vh',
        minHeight: '600px',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: '#0F2420',
        textAlign: 'center',
        padding: '0 2rem 5rem',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(212, 175, 55, 0.4)'
      }}>
        {/* Explicit HTML Background Image */}
        <img 
          src={story.heroImage} 
          alt={story.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        />
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 36, 32, 0.96) 0%, rgba(15, 36, 32, 0.6) 65%, rgba(15, 36, 32, 0.25) 100%)',
          zIndex: 1
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.5)', padding: '0.45rem 1.4rem', borderRadius: '30px', marginBottom: '1.5rem', backdropFilter: 'blur(10px)' }}>
            <span style={{ color: '#D4AF37', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.78rem' }}>
              📍 {story.craft} • {story.village}, {story.country}
            </span>
          </div>

          <h1 style={{ fontSize: '4.2rem', color: '#FAF9F6', marginBottom: '1.5rem', lineHeight: 1.15, fontFamily: 'var(--font-playfair), serif', fontWeight: 300 }}>
            {story.title}
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#E2E8F0', opacity: 0.95, lineHeight: 1.7, maxWidth: '750px', margin: '0 auto', fontWeight: 400 }}>
            {story.excerpt}
          </p>
        </div>
      </section>

      {/* Main Story Narrative */}
      <section style={{ padding: '8rem 2rem', position: 'relative' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '5rem', alignItems: 'start' }}>
            {/* The Essay */}
            <div>
              <div style={{ display: 'inline-block', backgroundColor: '#F4F3EF', border: '1px solid rgba(212,175,55,0.4)', padding: '0.4rem 1.2rem', borderRadius: '30px', marginBottom: '1rem' }}>
                <span style={{ color: '#B48811', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>
                  THE NARRATIVE
                </span>
              </div>

              <h2 style={{ fontSize: '2.8rem', color: '#0F2420', marginTop: '0.4rem', marginBottom: '2.5rem', fontFamily: 'var(--font-playfair), serif', fontWeight: 300 }}>
                Artisan Biography
              </h2>
              <div style={{ fontSize: '1.2rem', lineHeight: 2.1, color: '#2D3748', whiteSpace: 'pre-line', fontFamily: 'Georgia, serif', letterSpacing: '0.01em' }}>
                {story.content}
              </div>

              {/* Timeline */}
              {timeline.length > 0 && (
                <div style={{ marginTop: '6rem', borderTop: '1px solid rgba(212, 175, 55, 0.3)', paddingTop: '4rem' }}>
                  <h3 style={{ fontSize: '2rem', color: '#0F2420', marginBottom: '2.5rem', fontFamily: 'var(--font-playfair), serif', fontWeight: 300 }}>
                    Historical Milestones
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {timeline.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', color: '#B48811', fontWeight: '600', minWidth: '100px', fontFamily: 'var(--font-playfair)' }}>
                          {item.year}
                        </span>
                        <div style={{ borderLeft: '2px solid #0F2420', paddingLeft: '2rem', flex: 1 }}>
                          <p style={{ fontSize: '1.05rem', color: '#2D3748', lineHeight: 1.7, margin: 0 }}>
                            {item.event}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Maker Card & Credentials */}
            <div style={{ 
              position: 'sticky', 
              top: '8rem', 
              backgroundColor: '#FFFFFF', 
              padding: '3rem 2.5rem', 
              borderRadius: '24px', 
              border: '1px solid rgba(212, 175, 55, 0.4)', 
              boxShadow: '0 12px 35px rgba(0,0,0,0.06)' 
            }}>
              {story.maker.founderPhoto && (
                <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1.8rem', border: '3px solid #D4AF37', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                  <img src={story.maker.founderPhoto} alt={story.maker.founderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <h3 style={{ fontSize: '1.6rem', color: '#0F2420', textAlign: 'center', marginBottom: '0.4rem', fontFamily: 'var(--font-playfair), serif', fontWeight: 400 }}>
                {story.maker.founderName}
              </h3>
              <p style={{ color: '#B48811', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', fontWeight: '700', marginBottom: '2rem' }}>
                {getVerificationText(story.maker.verificationStatus)}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '2rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Studio Atelier</span>
                  <p style={{ fontSize: '1.05rem', color: '#0F2420', fontWeight: '600', margin: '0.25rem 0 0' }}>{story.maker.businessName}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Provenance Location</span>
                  <p style={{ fontSize: '1.05rem', color: '#0F2420', fontWeight: '600', margin: '0.25rem 0 0' }}>{story.village}, {story.country}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Generational Craft</span>
                  <p style={{ fontSize: '1.05rem', color: '#0F2420', fontWeight: '600', margin: '0.25rem 0 0' }}>{story.maker.yearsInBusiness} Years Active</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2.5rem' }}>
                <Link 
                  href={`/makers/${story.maker.id}`} 
                  style={{ 
                    textAlign: 'center', 
                    display: 'block', 
                    textDecoration: 'none',
                    backgroundColor: '#0F2420',
                    color: '#D4AF37',
                    padding: '0.9rem 1.8rem',
                    borderRadius: '30px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    boxShadow: '0 4px 15px rgba(15,36,32,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Visit Atelier Workshop →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Journal */}
      {photography.length > 0 && (
        <section style={{ padding: '6rem 2rem', backgroundColor: 'var(--surface)', borderTop: '1px solid rgba(212, 175, 55, 0.1)', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', display: 'block', textAlign: 'center', marginBottom: '1rem' }}>Photo Journal</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', textAlign: 'center', marginBottom: '4rem' }}>Scenes From the Atelier</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {photography.map((img, idx) => (
                <div key={idx} style={{ height: '350px', overflow: 'hidden', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                  <img src={img} alt={`Studio Scene ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-scale" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Works */}
      {mappedProducts.length > 0 && (
        <section style={{ padding: '8rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
              <div>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Artisan Catalog</span>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginTop: '0.8rem' }}>Acquire Mapped Works</h2>
              </div>
              <Link href={`/makers/${story.maker.id}`} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', borderBottom: '2px solid var(--accent)' }}>
                View All Works →
              </Link>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '3rem' }}>
              {mappedProducts.map((p: any) => (
                <Link href={`/products/${p.id}`} key={p.id} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ height: '300px', overflow: 'hidden', backgroundColor: 'var(--surface)', position: 'relative' }}>
                    <img src={JSON.parse(p.images)[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-scale" />
                    {p.verificationStatus === 'GI' && (
                      <span style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'var(--accent)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.4rem 0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>GI Certified</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>{p.name}</h3>
                  <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '0.8rem' }}>{p.category.name}</p>
                  <p style={{ color: 'var(--accent)', fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'var(--font-outfit)' }}>£{p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Stories */}
      {relatedStories.length > 0 && (
        <section style={{ padding: '8rem 2rem', backgroundColor: 'var(--surface)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', textAlign: 'center', marginBottom: '4rem' }}>Explore Other Ateliers</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
              {relatedStories.map((r: any) => (
                <Link href={`/stories/${r.id}`} key={r.id} className="story-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                    <img src={r.heroImage} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-scale" />
                  </div>
                  <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                    {r.craft} • {r.village}, {r.country}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1rem', lineHeight: 1.3 }}>{r.title}</h3>
                  <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.6 }}>{r.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

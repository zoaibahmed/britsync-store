import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSellingPrice } from '@/lib/pricing';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

function mapProduct(product: any) {
  const translation =
    product.translations.find((t: any) => t.languageCode === 'en') ||
    product.translations[0] ||
    {};

  const catName =
    product.category.translations.find((t: any) => t.languageCode === 'en')?.name || 'General';

  const makerLocationName =
    product.maker?.location?.translations?.find((t: any) => t.languageCode === 'en')?.name ||
    product.maker?.location?.locationType ||
    '';

  const imageUrls = (product.mediaMaps || [])
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    .map((m: any) => m.media.storageKey);

  return {
    id: product.id,
    makerProfileId: product.makerProfileId,
    categoryId: product.categoryId,
    locationId: product.locationId,
    desiredPrice: product.desiredPrice,
    price: calculateSellingPrice(product.desiredPrice, catName, undefined, product.verificationStatus),
    inventory: product.inventory,
    verificationStatus: product.verificationStatus,
    status: product.status,
    isEcoFriendly: product.isEcoFriendly,
    isWomenLed: product.isWomenLed,
    isHandmade: product.isHandmade,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    name: translation.name || '',
    description: translation.description || '',
    story: translation.story || '',
    careInstructions: translation.careInstructions || '',
    shippingInfo: translation.shippingInfo || '',
    returnPolicy: translation.returnPolicy || '',
    category: catName,
    images: imageUrls,
    hasPassport: !!product.passport,
    passportId: product.passport?.id || null,
    passportSerial: product.passport?.passportSerial || null,
    reviewCount: product._count?.reviews ?? (product.reviews?.length ?? 0),
    maker: {
      id: product.maker.id,
      businessName: product.maker.businessName,
      yearsInBusiness: product.maker.yearsInBusiness,
      employeeCount: product.maker.employeeCount,
      verificationStatus: product.maker.verificationStatus,
      locationName: makerLocationName,
      coverImage: product.maker.coverMedia?.storageKey || null,
      founderImage: product.maker.founderMedia?.storageKey || null,
    },
  };
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Filters
    const makerId = searchParams.get('makerId');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const country = searchParams.get('country') || '';
    const verification = searchParams.get('verification') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const handmade = searchParams.get('handmade') === 'true';
    const womenLed = searchParams.get('womenLed') === 'true';
    const ecoFriendly = searchParams.get('ecoFriendly') === 'true';

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24')));
    const skip = (page - 1) * limit;

    // Sorting
    const sort = searchParams.get('sort') || 'newest';

    const whereClause: any = {
      status: 'PUBLISHED',
    };

    // Maker filter (for maker dashboard)
    if (makerId) {
      whereClause.makerProfileId = makerId;
      delete whereClause.status; // makers can see all their products regardless of status
    }

    // Category filter
    if (category) {
      whereClause.category = {
        translations: {
          some: {
            languageCode: 'en',
            name: category,
          },
        },
      };
    }

    // Verification tier filter
    if (verification) {
      whereClause.verificationStatus = verification;
    }

    // Ethical value flags
    if (handmade) whereClause.isHandmade = true;
    if (womenLed) whereClause.isWomenLed = true;
    if (ecoFriendly) whereClause.isEcoFriendly = true;

    // Country filter: filter via maker's location
    if (country) {
      whereClause.maker = {
        location: {
          translations: {
            some: {
              languageCode: 'en',
              name: { contains: country },
            },
          },
        },
      };
    }

    // Search: filter via product name/description/story in translations
    if (search) {
      whereClause.translations = {
        some: {
          languageCode: 'en',
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
            { story: { contains: search } },
          ],
        },
      };
    }

    // Price filter: applied after fetch (because selling price is computed, not stored)
    // We pre-filter on desiredPrice as a rough approximation
    if (minPrice > 0 || maxPrice < 999999) {
      // Use a loose price filter on desiredPrice (actual selling price may differ slightly)
      whereClause.desiredPrice = {};
      if (minPrice > 0) whereClause.desiredPrice.gte = minPrice * 0.7; // allow for markups
      if (maxPrice < 999999) whereClause.desiredPrice.lte = maxPrice;
    }

    // Sort ordering
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { desiredPrice: 'asc' };
    else if (sort === 'price_desc') orderBy = { desiredPrice: 'desc' };
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          maker: {
            include: {
              location: {
                include: { translations: true },
              },
              coverMedia: true,
              founderMedia: true,
            },
          },
          category: {
            include: { translations: true },
          },
          location: {
            include: { translations: true },
          },
          translations: true,
          mediaMaps: {
            orderBy: { sortOrder: 'asc' },
            include: { media: true },
          },
          passport: {
            select: {
              id: true,
              passportSerial: true,
            },
          },
          certificates: {
            orderBy: { issueDate: 'desc' },
            take: 1,
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    const mappedProducts = products.map(mapProduct);

    // Apply selling price filter after mapping (for accuracy)
    const filtered =
      minPrice > 0 || maxPrice < 999999
        ? mappedProducts.filter((p) => p.price >= minPrice && p.price <= maxPrice)
        : mappedProducts;

    return NextResponse.json({
      products: filtered,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Makers credentials required' }, { status: 403 });
    }

    const maker = await prisma.makerProfile.findUnique({
      where: { userId: session.userId }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      story, 
      category, 
      price, 
      inventory, 
      images 
    } = body;

    if (!name || !description || !category || !price) {
      return NextResponse.json({ error: 'Name, description, category, and price are required' }, { status: 400 });
    }

    // 1. Resolve Category
    const dbCategory = await prisma.category.findFirst({
      where: {
        translations: {
          some: {
            name: category,
            languageCode: 'en'
          }
        }
      },
      include: {
        translations: true
      }
    });

    let catId = dbCategory?.id;

    if (!dbCategory) {
      const newCat = await prisma.category.create({ data: {} });
      await prisma.categoryTranslation.create({
        data: {
          categoryId: newCat.id,
          languageCode: 'en',
          name: category,
          description: `${category} crafts`
        }
      });
      catId = newCat.id;
    }

    // 2. Default mock images if none are supplied
    const imageList: string[] = images || [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800"
    ];

    // Create product and media in transaction
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          makerProfileId: maker.id,
          categoryId: catId!,
          locationId: maker.locationId, // Default to maker's location node
          desiredPrice: parseFloat(price),
          inventory: parseInt(inventory) || 5,
          verificationStatus: 'GENERAL',
          status: 'PUBLISHED'
        },
        include: {
          maker: true,
          category: {
            include: {
              translations: true
            }
          }
        }
      });

      // Create translation record
      await tx.productTranslation.create({
        data: {
          productId: p.id,
          languageCode: 'en',
          name,
          description,
          story: story || 'A handcrafted masterpiece representing generational craft techniques.',
          careInstructions: 'Spot clean only. Keep away from direct moisture.',
          shippingInfo: 'Standard International Shipping',
          returnPolicy: '30-day return policy for unused, original crated items.'
        }
      });

      // Insert media records and link them
      for (let i = 0; i < imageList.length; i++) {
        const media = await tx.media.create({
          data: {
            originalFilename: `product_img_${i}.jpg`,
            mimeType: 'image/jpeg',
            fileSize: 100000,
            storageKey: imageList[i]
          }
        });

        await tx.productMediaMap.create({
          data: {
            productId: p.id,
            mediaId: media.id,
            isHero: i === 0,
            sortOrder: i
          }
        });
      }

      // Add stock card ledger entry
      await tx.inventoryLedger.create({
        data: {
          productId: p.id,
          quantityDelta: parseInt(inventory) || 5,
          referenceType: 'STOCK_IN'
        }
      });

      return p;
    });

    // Fetch complete product to map
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        maker: {
          include: {
            location: {
              include: { translations: true },
            },
            coverMedia: true,
            founderMedia: true,
          },
        },
        category: {
          include: { translations: true },
        },
        location: {
          include: { translations: true },
        },
        translations: true,
        mediaMaps: {
          orderBy: { sortOrder: 'asc' },
          include: { media: true },
        },
        passport: {
          select: { id: true, passportSerial: true },
        },
        certificates: {
          orderBy: { issueDate: 'desc' },
          take: 1,
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      product: mapProduct(completeProduct)
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

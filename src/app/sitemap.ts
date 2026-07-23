import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://britsync.com';

  // Base static routes
  const staticRoutes = ['', '/about', '/collections', '/countries', '/how-we-earn'].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8
  }));

  // Dynamic products sitemap
  let productsList: any[] = [];
  try {
    productsList = await prisma.product.findMany({ select: { id: true, updatedAt: true } });
  } catch(e) {}
  const productRoutes = productsList.map(p => ({
    url: `${baseUrl}/products/${p.id}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }));

  // Dynamic makers sitemap
  let makersList: any[] = [];
  try {
    makersList = await prisma.makerProfile.findMany({ select: { id: true, updatedAt: true } });
  } catch(e) {}
  const makerRoutes = makersList.map(m => ({
    url: `${baseUrl}/makers/${m.id}`,
    lastModified: m.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }));

  // Dynamic stories sitemap
  let storiesList: any[] = [];
  try {
    storiesList = await prisma.makerStory.findMany({ select: { id: true, updatedAt: true } });
  } catch(e) {}
  const storyRoutes = storiesList.map(s => ({
    url: `${baseUrl}/stories/${s.id}`,
    lastModified: s.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));

  return [...staticRoutes, ...productRoutes, ...makerRoutes, ...storyRoutes];
}

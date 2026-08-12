import CategoryPage from '@/app/categories/[category]/page';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const categoryName = decodeURIComponent(rawCategory);
  const titleCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return {
    title: `${titleCategory} Masterworks & Ateliers | Britsync Collections`,
    description: `Explore certified ${titleCategory} masterworks, heritage ateliers, and cryptographic provenance passports on Britsync.`,
  };
}

export default async function CollectionCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ search?: string; maker?: string }>;
}) {
  return CategoryPage({ params, searchParams });
}

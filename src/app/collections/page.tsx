import HeritageCollections from '@/components/HeritageCollections';

const collections = [
  {
    name: 'Ceramics',
    label: 'Zellige Tilework & Fine Pottery',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1200',
    count: 120,
    provenance: 'Fez, Morocco & Iznik, Turkey',
  },
  {
    name: 'Textiles',
    label: 'Pashmina & Royal Weaves',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1200',
    count: 340,
    provenance: 'Kashmir, India & Silk Road',
  },
  {
    name: 'Jewelry',
    label: 'Filigree & Royal Silverware',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200',
    count: 85,
    provenance: 'Multan & Jaipur Ateliers',
  },
  {
    name: 'Woodwork',
    label: 'Andalusian Carvings & Marquetry',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1200',
    count: 42,
    provenance: 'Cordoba & Chiniot Masters',
  },
  {
    name: 'Leather',
    label: 'Fez Organic Tanned Goods',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200',
    count: 67,
    provenance: 'Chouara Tanneries, Fez',
  },
  {
    name: 'Metal Craft',
    label: 'Hand-Hammered Copper & Damascus Steel',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1200',
    count: 53,
    provenance: 'Damascus & Lahore Guilds',
  },
  {
    name: 'Glass',
    label: 'Blown Stained Glass & Crystal',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1200',
    count: 38,
    provenance: 'Murano & Hebron Glasswork',
  },
  {
    name: 'Home Decor',
    label: 'Brass Lanterns & Ornaments',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200',
    count: 210,
    provenance: 'Marrakesh & Cairo Ateliers',
  },
];

export const metadata = {
  title: 'Heritage Collections | Britsync — Curated Artisan Masterworks',
  description:
    'Explore eight curated heritage craft disciplines — ceramics, textiles, jewelry and more — verified by our global provenance network.',
};

export default function CollectionsPage() {
  return <HeritageCollections collections={collections} />;
}

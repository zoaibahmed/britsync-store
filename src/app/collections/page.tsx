import CollectionExperience from '@/components/CollectionExperience';

export const metadata = {
  title: 'Heritage Collections | Britsync — Curated Artisan Masterworks',
  description:
    'Explore six curated heritage craft disciplines — ceramics, textiles, jewellery and more — verified by our global provenance network.',
};

const categories = [
  {
    id: 1,
    slug: 'Ceramics',
    badge: 'Collection',
    title: 'Ceramics',
    description:
      'Timeless forms. Heritage in every detail. Handcrafted by artisans, verified by BritSync.',
    hero: {
      name: 'Blue & White Ming Ceramic Vase',
      image: '/collections/ceramics_hero.png',
    },
    supporting: [
      { name: 'Ceramic Tea Bowl', image: '/collections/ceramics_sm1.png' },
      { name: 'Floral Lidded Jar', image: '/collections/ceramics_sm2.png' },
      { name: 'Slender Porcelain Vase', image: '/collections/ceramics_sm3.png' },
      { name: 'Artisan Teacup', image: '/collections/ceramics_sm4.png' },
    ],
  },
  {
    id: 2,
    slug: 'Jewelry',
    badge: 'Collection',
    title: 'Jewellery',
    description:
      'Royal filigree and kundan. Each piece a miniature sculpture in gold and gemstone.',
    hero: {
      name: 'Royal Sapphire Gold Necklace',
      image: '/collections/jewelry_hero.png',
    },
    supporting: [
      { name: 'Diamond Ring', image: '/collections/jewelry_sm1.png' },
      { name: 'Gold Bangle Bracelet', image: '/collections/jewelry_sm2.png' },
      { name: 'Sapphire Drop Earrings', image: '/collections/jewelry_sm3.png' },
      { name: 'Pearl Strand Necklace', image: '/collections/jewelry_hero.png' },
    ],
  },
  {
    id: 3,
    slug: 'Textiles',
    badge: 'Collection',
    title: 'Textiles',
    description:
      'Woven by hand on ancestral looms. Silk and pashmina from the great heritage routes.',
    hero: {
      name: 'Pashmina Cashmere Shawl',
      image: '/collections/textiles_hero.png',
    },
    supporting: [
      { name: 'Silk Scarf', image: '/collections/textiles_hero.png' },
      { name: 'Pashmina Wrap', image: '/collections/textiles_hero.png' },
      { name: 'Handwoven Throw', image: '/collections/textiles_hero.png' },
      { name: 'Embroidered Silk', image: '/collections/textiles_hero.png' },
    ],
  },
  {
    id: 4,
    slug: 'Leather',
    badge: 'Collection',
    title: 'Leather',
    description:
      'Vegetable-tanned hides from the tanneries of Fez. Objects of enduring elegance.',
    hero: {
      name: 'Cognac Leather Handbag',
      image: '/collections/leather_hero.png',
    },
    supporting: [
      { name: 'Leather Tote', image: '/collections/leather_hero.png' },
      { name: 'Handcrafted Purse', image: '/collections/leather_hero.png' },
      { name: 'Travel Wallet', image: '/collections/leather_hero.png' },
      { name: 'Artisan Belt', image: '/collections/leather_hero.png' },
    ],
  },
  {
    id: 5,
    slug: 'Metal Craft',
    badge: 'Collection',
    title: 'Metal Craft',
    description:
      'Hand-forged Damascus steel and Lahore copper. Every vessel bears the craftsman\'s rhythm.',
    hero: {
      name: 'Ornate Engraved Brass Vase',
      image: '/collections/metalcraft_hero.png',
    },
    supporting: [
      { name: 'Engraved Brass Bowl', image: '/collections/metalcraft_hero.png' },
      { name: 'Hammered Copper Pot', image: '/collections/metalcraft_hero.png' },
      { name: 'Decorative Steel Vessel', image: '/collections/metalcraft_hero.png' },
      { name: 'Brass Candelabrum', image: '/collections/metalcraft_hero.png' },
    ],
  },
  {
    id: 6,
    slug: 'Home Decor',
    badge: 'Collection',
    title: 'Living Spaces',
    description:
      'Handcrafted objects that transform a house into a sanctuary — timeless forms in wood and brass.',
    hero: {
      name: 'Moroccan Brass Lantern',
      image: '/collections/homedecor_hero.png',
    },
    supporting: [
      { name: 'Handcrafted Lantern', image: '/collections/homedecor_hero.png' },
      { name: 'Brass Desk Lamp', image: '/collections/homedecor_hero.png' },
      { name: 'Sculptural Vessel', image: '/collections/homedecor_hero.png' },
      { name: 'Carved Wood Box', image: '/collections/homedecor_hero.png' },
    ],
  },
];

export default function CollectionsPage() {
  return <CollectionExperience categories={categories} />;
}

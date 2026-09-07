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
      { name: 'Ceramic Tea Bowl',      image: '/collections/ceramics_sm1.png' },
      { name: 'Floral Lidded Jar',     image: '/collections/ceramics_sm2.png' },
      { name: 'Slender Porcelain Vase',image: '/collections/ceramics_sm3.png' },
      { name: 'Artisan Teacup',        image: '/collections/ceramics_sm4.png' },
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
      { name: 'Diamond Ring',           image: '/collections/jewelry_sm1.png' },
      { name: 'Gold Bangle Bracelet',   image: '/collections/jewelry_sm2.png' },
      { name: 'Sapphire Drop Earrings', image: '/collections/jewelry_sm3.png' },
      { name: 'Pearl Strand Necklace',  image: '/collections/jewelry_hero.png' },
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
      { name: 'Embroidered Silk Scarf', image: '/collections/textiles_sm1.jpg' },
      { name: 'Ivory Pashmina Wrap',    image: '/collections/textiles_sm2.jpg' },
      { name: 'Ikat Throw Blanket',     image: '/collections/textiles_sm3.jpg' },
      { name: 'Saffron Cushion Cover',  image: '/collections/textiles_sm4.jpg' },
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
      { name: 'Structured Leather Bag',  image: '/collections/leather_sm1.jpg' },
      { name: 'Hand-Tooled Wallet',      image: '/collections/leather_sm2.jpg' },
      { name: 'Leather Duffle Bag',      image: '/collections/leather_sm3.jpg' },
      { name: 'Artisan Leather Belt',    image: '/collections/leather_sm4.jpg' },
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
      { name: 'Engraved Brass Bowl',    image: '/collections/metalcraft_sm1.jpg' },
      { name: 'Hammered Copper Teapot', image: '/collections/metalcraft_sm2.jpg' },
      { name: 'Steel Geometric Tray',   image: '/collections/metalcraft_sm3.jpg' },
      { name: 'Brass Candelabrum',      image: '/collections/metalcraft_sm4.jpg' },
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
      { name: 'Pierced Brass Lantern',  image: '/collections/homedecor_sm1.jpg' },
      { name: 'Walnut Wooden Bowl',     image: '/collections/homedecor_sm2.jpg' },
      { name: 'Blue Arabesque Tile',    image: '/collections/homedecor_hero.png' },
      { name: 'Carved Elephant Figure', image: '/collections/homedecor_hero.png' },
    ],
  },
];

export default function CollectionsPage() {
  return <CollectionExperience categories={categories} />;
}

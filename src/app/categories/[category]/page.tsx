import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import CategoryClient, {
  CategoryProductItem,
  CategoryMakerItem,
  CraftHeritageData,
} from './CategoryClient';

export const dynamic = 'force-dynamic';

// Curated Master Catalog by Discipline
const DISCIPLINE_DATA: Record<
  string,
  {
    title: string;
    tagline: string;
    description: string;
    provenanceHubs: string[];
    heritage: CraftHeritageData;
    defaultProducts: CategoryProductItem[];
    defaultMakers: CategoryMakerItem[];
  }
> = {
  'metal craft': {
    title: 'Metal Craft',
    tagline: 'Hand-Forged Damascus Steel, Chased Brass & Hammered Copper',
    description:
      'Forged over charcoal hearths and shaped with millimeter-precision hammers. From ancestral Damascus steel blades to hand-chased Lahore brassware, every vessel preserves generational metallurgy and physical authenticity.',
    provenanceHubs: ['Lahore', 'Damascus', 'Isfahan', 'Toledo', 'Moradabad'],
    heritage: {
      ancestralEra: 'Circa 12th Century Levant & Mughal Workshops',
      primaryMaterials: [
        'Pure Red Copper (99.8%)',
        'Hand-Folded Damascus Steel (128 Layers)',
        'Cast Architectural Brass',
        'Natural Beeswax Sealant',
      ],
      techniques: [
        {
          name: 'Repoussé & Chasing',
          description:
            'Ornamentation hammered into relief from the reverse and detailed from the front with hundreds of custom steel punches.',
        },
        {
          name: 'Damascus Pattern Welding',
          description:
            'Repeated forge-welding of high and low carbon steels, folded iteratively to reveal organic grain contours and unmatched resilience.',
        },
        {
          name: 'Hand-Planishing & Tinning',
          description:
            'Smoothing vessel walls with overlapping mirror hammer blows, followed by molten food-safe tin lining over live charcoal.',
        },
      ],
      auditStandard:
        'Audited on-site with handheld XRF alloy spectroscopy and ultrasonic density scanning. Certified 95% direct artisan payout.',
    },
    defaultProducts: [
      {
        id: 'mc-01',
        title: 'Ornate Engraved Brass Urn Vase',
        maker: 'Lahore Heritage Metal Guild',
        makerId: 'maker-lahore-01',
        price: 380,
        country: 'Pakistan',
        region: 'Lahore Walled City',
        materials: 'Pure Hand-Chased Brass, Black Mineral Inlay',
        craftingTimeWeeks: 4,
        isReadyToShip: true,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/metalcraft_hero.png',
        images: ['/collections/metalcraft_hero.png', '/collections/metalcraft_sm1.png'],
        dimensions: '38cm x 22cm',
        weight: '3.4 kg',
      },
      {
        id: 'mc-02',
        title: 'Hammered Anatolian Copper Kettle',
        maker: 'Anatolian Coppersmith Cooperative',
        makerId: 'maker-anatolia-01',
        price: 240,
        country: 'Turkey',
        region: 'Gaziantep Historic Bazaar',
        materials: 'Heavy Gauge Red Copper, Hand-Tinned Interior',
        craftingTimeWeeks: 3,
        isReadyToShip: true,
        verificationStatus: 'GI',
        imageUrl: '/collections/metalcraft_sm2.png',
        images: ['/collections/metalcraft_sm2.png', '/collections/metalcraft_hero.png'],
        dimensions: '26cm x 18cm',
        weight: '1.8 kg',
      },
      {
        id: 'mc-03',
        title: 'Damascus Steel Geometric Filigree Tray',
        maker: 'Toledo Armoury & Steel Guild',
        makerId: 'maker-toledo-01',
        price: 290,
        country: 'Spain',
        region: 'Toledo Historic Quarter',
        materials: 'Pattern-Welded Damascus Steel, Acid-Etched',
        craftingTimeWeeks: 5,
        isReadyToShip: false,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/metalcraft_sm3.png',
        images: ['/collections/metalcraft_sm3.png', '/collections/metalcraft_sm1.png'],
        dimensions: '42cm x 30cm',
        weight: '2.9 kg',
      },
      {
        id: 'mc-04',
        title: 'Architectural Brass Master Candelabrum',
        maker: 'Moradabad Brass Custodians',
        makerId: 'maker-moradabad-01',
        price: 420,
        country: 'India',
        region: 'Moradabad Peetal Nagri',
        materials: 'Lost-Wax Cast Solid Brass, Hand-Polished',
        craftingTimeWeeks: 6,
        isReadyToShip: true,
        verificationStatus: 'VERIFIED',
        imageUrl: '/collections/metalcraft_sm4.png',
        images: ['/collections/metalcraft_sm4.png', '/collections/metalcraft_hero.png'],
        dimensions: '52cm x 28cm',
        weight: '4.8 kg',
      },
      {
        id: 'mc-05',
        title: 'Hand-Etched Ceremonial Bronze Bowl',
        maker: 'Isfahan Metalworks Guild',
        makerId: 'maker-isfahan-01',
        price: 195,
        country: 'Iran',
        region: 'Naqsh-e Jahan Atelier',
        materials: 'Bell Bronze, Hand-Carved Arabesque Calligraphy',
        craftingTimeWeeks: 3,
        isReadyToShip: true,
        verificationStatus: 'GI',
        imageUrl: '/collections/metalcraft_sm1.png',
        images: ['/collections/metalcraft_sm1.png', '/collections/metalcraft_sm2.png'],
        dimensions: '22cm x 12cm',
        weight: '1.4 kg',
      },
      {
        id: 'mc-06',
        title: 'Hand-Chased Moorish Brass Platter',
        maker: 'Fez Medina Brass Atelier',
        makerId: 'maker-fez-01',
        price: 310,
        country: 'Morocco',
        region: 'Place Seffarine, Fez',
        materials: 'Solid Yellow Brass, Chiseled Micro-Geometric',
        craftingTimeWeeks: 4,
        isReadyToShip: true,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/metalcraft_hero.png',
        images: ['/collections/metalcraft_hero.png', '/collections/metalcraft_sm3.png'],
        dimensions: '48cm Diameter',
        weight: '3.1 kg',
      },
    ],
    defaultMakers: [
      {
        id: 'maker-lahore-01',
        businessName: 'Lahore Heritage Metal Guild',
        founderName: 'Ustad Tariq Rafiq',
        country: 'Pakistan',
        city: 'Lahore',
        verificationStatus: 'ELITE',
        yearsInBusiness: 48,
        productCount: 18,
        shortIntro:
          'Generational fourth-generation coppersmiths and brass engravers preserving 16th-century Mughal floral engraving techniques.',
        heroImage: '/collections/metalcraft_hero.png',
        logo: '/collections/metalcraft_sm1.png',
      },
      {
        id: 'maker-anatolia-01',
        businessName: 'Anatolian Coppersmith Cooperative',
        founderName: 'Master Mehmet Demir',
        country: 'Turkey',
        city: 'Gaziantep',
        verificationStatus: 'GI',
        yearsInBusiness: 62,
        productCount: 15,
        shortIntro:
          'Protected Geographical Indication workshop known for hand-raised copper samovars, kettles, and tin-lined culinary cookware.',
        heroImage: '/collections/metalcraft_sm2.png',
        logo: '/collections/metalcraft_sm2.png',
      },
      {
        id: 'maker-toledo-01',
        businessName: 'Toledo Armoury & Steel Guild',
        founderName: 'Don Carlos Mendoza',
        country: 'Spain',
        city: 'Toledo',
        verificationStatus: 'ELITE',
        yearsInBusiness: 85,
        productCount: 12,
        shortIntro:
          'Heirloom master bladesmiths and geometric steel engravers upholding Spanish damascening and forge welding traditions.',
        heroImage: '/collections/metalcraft_sm3.png',
        logo: '/collections/metalcraft_sm3.png',
      },
      {
        id: 'maker-moradabad-01',
        businessName: 'Moradabad Brass Custodians',
        founderName: 'Artisan Zameer Ansari',
        country: 'India',
        city: 'Moradabad',
        verificationStatus: 'VERIFIED',
        yearsInBusiness: 36,
        productCount: 22,
        shortIntro:
          'Specialists in heavyweight lost-wax cast architectural candleholders, temple bells, and decorative brass finials.',
        heroImage: '/collections/metalcraft_sm4.png',
        logo: '/collections/metalcraft_sm4.png',
      },
    ],
  },
  ceramics: {
    title: 'Ceramics',
    tagline: 'Ancestral Porcelain, Celadon Glazes & Kiln-Fired Terracotta',
    description:
      'Wheel-thrown with hand-harvested clays and fired in wood-fueled climbing kilns. From delicate cobalt blue porcelain to rustic stoneware, each vessel embodies organic harmony and permanent material permanence.',
    provenanceHubs: ['Jingdezhen', 'Arita', 'Kyoto', 'Safi', 'Valencia'],
    heritage: {
      ancestralEra: 'Song & Ming Dynasties to Mediterranean Majolica',
      primaryMaterials: [
        'Kaolin Clay & Petuntse Porcelain Stone',
        'Wood-Ash & Iron Oxide Reduction Glazes',
        'Terracotta Earthenware',
        'Natural Cobalt Blue Pigment',
      ],
      techniques: [
        {
          name: 'Underglaze Cobalt Painting',
          description:
            'Freehand brushwork in natural cobalt oxide onto porous unglazed porcelain before single-fire reduction at 1300°C.',
        },
        {
          name: 'High-Fire Wood Kiln Reduction',
          description:
            'Three-day wood-fueled firing in anagama kilns, allowing natural fly ash to melt into spontaneous glass surfaces.',
        },
        {
          name: 'Mino Wheel Throwing',
          description:
            'Formed entirely by hand on slow wooden kick-wheels with natural water lubrication and bamboo trim knives.',
        },
      ],
      auditStandard:
        'Thermoluminescence age verification and lead-free food grade laboratory certification.',
    },
    defaultProducts: [
      {
        id: 'cer-01',
        title: 'Blue & White Ming Ceramic Vase',
        maker: 'Jingdezhen Imperial Kiln Atelier',
        makerId: 'maker-jingde-01',
        price: 520,
        country: 'China',
        region: 'Jingdezhen',
        materials: 'Pure Kaolin Porcelain, Natural Cobalt Pigment',
        craftingTimeWeeks: 5,
        isReadyToShip: true,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/ceramics_hero.png',
        images: ['/collections/ceramics_hero.png', '/collections/ceramics_sm1.png'],
        dimensions: '42cm x 24cm',
        weight: '3.6 kg',
      },
      {
        id: 'cer-02',
        title: 'Ceramic Wabi-Sabi Tea Bowl',
        maker: 'Kyoto Zen Kiln Studio',
        makerId: 'maker-kyoto-01',
        price: 140,
        country: 'Japan',
        region: 'Kyoto Foothills',
        materials: 'Coarse Feldspar Stoneware, Natural Ash Glaze',
        craftingTimeWeeks: 3,
        isReadyToShip: true,
        verificationStatus: 'GI',
        imageUrl: '/collections/ceramics_sm1.png',
        images: ['/collections/ceramics_sm1.png', '/collections/ceramics_sm2.png'],
        dimensions: '12cm x 8cm',
        weight: '0.45 kg',
      },
      {
        id: 'cer-03',
        title: 'Floral Lidded Porcelain Storage Jar',
        maker: 'Arita Heritage Porcelain',
        makerId: 'maker-arita-01',
        price: 310,
        country: 'Japan',
        region: 'Saga Prefecture',
        materials: 'Eggshell Porcelain, Overglaze Enamels',
        craftingTimeWeeks: 4,
        isReadyToShip: true,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/ceramics_sm2.png',
        images: ['/collections/ceramics_sm2.png', '/collections/ceramics_hero.png'],
        dimensions: '28cm x 19cm',
        weight: '1.9 kg',
      },
      {
        id: 'cer-04',
        title: 'Slender Jade Celadon Vase',
        maker: 'Longquan Celadon Masters',
        makerId: 'maker-longquan-01',
        price: 260,
        country: 'China',
        region: 'Zhejiang',
        materials: 'High-Fire Celadon Stoneware',
        craftingTimeWeeks: 4,
        isReadyToShip: true,
        verificationStatus: 'GI',
        imageUrl: '/collections/ceramics_sm3.png',
        images: ['/collections/ceramics_sm3.png', '/collections/ceramics_sm4.png'],
        dimensions: '34cm x 14cm',
        weight: '1.8 kg',
      },
      {
        id: 'cer-05',
        title: 'Hand-Pinched Glazed Teacup',
        maker: 'Kyoto Zen Kiln Studio',
        makerId: 'maker-kyoto-01',
        price: 95,
        country: 'Japan',
        region: 'Kyoto',
        materials: 'Shino Glaze, Red Terracotta',
        craftingTimeWeeks: 2,
        isReadyToShip: true,
        verificationStatus: 'VERIFIED',
        imageUrl: '/collections/ceramics_sm4.png',
        images: ['/collections/ceramics_sm4.png', '/collections/ceramics_sm1.png'],
        dimensions: '9cm x 7cm',
        weight: '0.28 kg',
      },
    ],
    defaultMakers: [
      {
        id: 'maker-jingde-01',
        businessName: 'Jingdezhen Imperial Kiln Atelier',
        founderName: 'Master Chen Guohua',
        country: 'China',
        city: 'Jingdezhen',
        verificationStatus: 'ELITE',
        yearsInBusiness: 54,
        productCount: 26,
        shortIntro:
          'Sixth-generation custodians of high-temperature porcelain firing and traditional cobalt brushwork.',
        heroImage: '/collections/ceramics_hero.png',
        logo: '/collections/ceramics_sm1.png',
      },
      {
        id: 'maker-kyoto-01',
        businessName: 'Kyoto Zen Kiln Studio',
        founderName: 'Katsumi Tanaka',
        country: 'Japan',
        city: 'Kyoto',
        verificationStatus: 'GI',
        yearsInBusiness: 42,
        productCount: 19,
        shortIntro:
          'Certified Raku and Shino ware master crafting tea ceremony utensils using centuries-old reduction kilns.',
        heroImage: '/collections/ceramics_sm1.png',
        logo: '/collections/ceramics_sm4.png',
      },
    ],
  },
  jewelry: {
    title: 'Jewellery',
    tagline: 'Royal Filigree, Uncut Gemstones & 22K Granulation',
    description:
      'Wearable sculpture created with generational metallurgy. From hand-pulled gold wires of Jaipur kundan to Mediterranean filigree, each heirloom carries audited provenance and fair-mined verification.',
    provenanceHubs: ['Jaipur', 'Florence', 'Cordoba', 'Colombo', 'Muscat'],
    heritage: {
      ancestralEra: 'Mughal Courts to Renaissance Florentine Goldsmithing',
      primaryMaterials: [
        'Recycled 22K Solid Gold',
        'Natural Unheated Royal Sapphires',
        'Ethically Sourced Natural Seed Pearls',
        '925 Sterling Silver Wire',
      ],
      techniques: [
        {
          name: 'Kundan & Jadau Setting',
          description:
            'Setting pure gemstones using hyper-refined gold foil without prongs, locked using room-temperature molecular pressure.',
        },
        {
          name: 'Micro-Filigree Wirework',
          description:
            'Drawing solid gold through diamond dies down to 0.15mm, then twisting and torch-soldering intricate lace lattices.',
        },
      ],
      auditStandard:
        'Spectrographic carat assay certified with conflict-free Kimberley Process documentation.',
    },
    defaultProducts: [
      {
        id: 'jw-01',
        title: 'Royal Sapphire Gold Pendant Necklace',
        maker: 'Jaipur Royal Goldsmiths',
        makerId: 'maker-jaipur-01',
        price: 1450,
        country: 'India',
        region: 'Johari Bazaar, Jaipur',
        materials: '22K Hand-Granulated Gold, Ceylon Royal Sapphire',
        craftingTimeWeeks: 6,
        isReadyToShip: true,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/jewelry_hero.png',
        images: ['/collections/jewelry_hero.png', '/collections/jewelry_sm1.png'],
        dimensions: '45cm Chain / 3.2cm Pendant',
        weight: '28 grams',
      },
      {
        id: 'jw-02',
        title: 'Solitaire Filigree Sovereign Ring',
        maker: 'Florence Goldsmith Guild',
        makerId: 'maker-florence-01',
        price: 890,
        country: 'Italy',
        region: 'Ponte Vecchio, Florence',
        materials: '18K Yellow Gold, Rose Cut Diamond',
        craftingTimeWeeks: 4,
        isReadyToShip: true,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/jewelry_sm1.png',
        images: ['/collections/jewelry_sm1.png', '/collections/jewelry_hero.png'],
        dimensions: 'Size 7 (Adjustable)',
        weight: '9.5 grams',
      },
      {
        id: 'jw-03',
        title: 'Hand-Etched Gold Bangle Bracelet',
        maker: 'Cordoba Goldsmith Atelier',
        makerId: 'maker-cordoba-01',
        price: 680,
        country: 'Spain',
        region: 'Cordoba Historic Quarter',
        materials: 'Solid 18K Gold, Chiseled Mudejar Motifs',
        craftingTimeWeeks: 3,
        isReadyToShip: true,
        verificationStatus: 'VERIFIED',
        imageUrl: '/collections/jewelry_sm2.png',
        images: ['/collections/jewelry_sm2.png', '/collections/jewelry_sm3.png'],
        dimensions: '6.5cm Inner Diameter',
        weight: '16.2 grams',
      },
      {
        id: 'jw-04',
        title: 'Sapphire & Natural Pearl Drop Earrings',
        maker: 'Jaipur Royal Goldsmiths',
        makerId: 'maker-jaipur-01',
        price: 540,
        country: 'India',
        region: 'Jaipur',
        materials: '22K Gold, Blue Sapphire, Keshi Pearl',
        craftingTimeWeeks: 3,
        isReadyToShip: true,
        verificationStatus: 'GI',
        imageUrl: '/collections/jewelry_sm3.png',
        images: ['/collections/jewelry_sm3.png', '/collections/jewelry_hero.png'],
        dimensions: '4.8cm Length',
        weight: '11.4 grams',
      },
    ],
    defaultMakers: [
      {
        id: 'maker-jaipur-01',
        businessName: 'Jaipur Royal Goldsmiths',
        founderName: 'Pandit Suresh Mehra',
        country: 'India',
        city: 'Jaipur',
        verificationStatus: 'ELITE',
        yearsInBusiness: 75,
        productCount: 31,
        shortIntro:
          'Royal court jewellers specializing in heritage Kundan Jadau and Meenakari enamel on pure 22K gold.',
        heroImage: '/collections/jewelry_hero.png',
        logo: '/collections/jewelry_sm1.png',
      },
    ],
  },
  textiles: {
    title: 'Textiles',
    tagline: 'Hand-Loomed Pashmina, Mulberry Silk & Natural Indigo',
    description:
      'Woven thread by thread on ancestral wooden fly-shuttle and jacquard looms. From the high pastures of Ladakh to Lyon master ateliers, each textile is a masterpiece of tactile elegance.',
    provenanceHubs: ['Srinagar', 'Lyon', 'Varanasi', 'Oaxaca', 'Bukhara'],
    heritage: {
      ancestralEra: 'Ancient Silk Road to Kashmiri Mughal Shawl Weaving',
      primaryMaterials: [
        'Changthangi Grade-A Pashmina Wool (12-14 Microns)',
        'Mulberry Hand-Reeled Silk',
        'Plant-Derived Indigo & Madder Root Dyes',
        'Fine Gold Zari Thread',
      ],
      techniques: [
        {
          name: 'Ancestral Wooden Handloom Weaving',
          description:
            'Slow shuttle operation maintaining equal warp and weft tension across weeks of continuous manual rhythm.',
        },
        {
          name: 'Sozni Needle Embroidery',
          description:
            'Micron-level single-thread needlework creating reversible floral tapestries that take up to 9 months per shawl.',
        },
      ],
      auditStandard:
        'Microscopic fiber diameter scanning verifying 100% pure authentic hand-spun underfleece.',
    },
    defaultProducts: [
      {
        id: 'tex-01',
        title: 'Pure Pashmina Cashmere Heritage Shawl',
        maker: 'Srinagar Heritage Weavers',
        makerId: 'maker-srinagar-01',
        price: 480,
        country: 'India',
        region: 'Kashmir Valley',
        materials: '100% Hand-Spun Pashmina Cashmere, Vegetable Dye',
        craftingTimeWeeks: 8,
        isReadyToShip: true,
        verificationStatus: 'GI',
        imageUrl: '/collections/textiles_hero.png',
        images: ['/collections/textiles_hero.png', '/collections/textiles_sm1.png'],
        dimensions: '200cm x 100cm',
        weight: '0.19 kg',
      },
      {
        id: 'tex-02',
        title: 'Embroidered Mulberry Silk Scarf',
        maker: 'Varanasi Silk Master Atelier',
        makerId: 'maker-varanasi-01',
        price: 185,
        country: 'India',
        region: 'Varanasi Weavers Quarter',
        materials: 'Raw Mulberry Silk, Zari Gold Weft',
        craftingTimeWeeks: 3,
        isReadyToShip: true,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/textiles_sm1.png',
        images: ['/collections/textiles_sm1.png', '/collections/textiles_sm2.png'],
        dimensions: '180cm x 65cm',
        weight: '0.14 kg',
      },
      {
        id: 'tex-03',
        title: 'Ivory Pashmina Artisan Wrap',
        maker: 'Srinagar Heritage Weavers',
        makerId: 'maker-srinagar-01',
        price: 390,
        country: 'India',
        region: 'Kashmir',
        materials: 'Natural Unbleached Cashmere',
        craftingTimeWeeks: 4,
        isReadyToShip: true,
        verificationStatus: 'GI',
        imageUrl: '/collections/textiles_sm2.png',
        images: ['/collections/textiles_sm2.png', '/collections/textiles_hero.png'],
        dimensions: '210cm x 90cm',
        weight: '0.18 kg',
      },
      {
        id: 'tex-04',
        title: 'Hand-Dyed Indigo Ikat Blanket',
        maker: 'Fergana Valley Weavers Guild',
        makerId: 'maker-fergana-01',
        price: 260,
        country: 'Uzbekistan',
        region: 'Margilan',
        materials: 'Organic Cotton Warp, Natural Indigo Silk Weft',
        craftingTimeWeeks: 5,
        isReadyToShip: true,
        verificationStatus: 'VERIFIED',
        imageUrl: '/collections/textiles_sm3.png',
        images: ['/collections/textiles_sm3.png', '/collections/textiles_sm4.png'],
        dimensions: '220cm x 150cm',
        weight: '0.85 kg',
      },
      {
        id: 'tex-05',
        title: 'Saffron Raw Silk Cushion Cover',
        maker: 'Varanasi Silk Master Atelier',
        makerId: 'maker-varanasi-01',
        price: 135,
        country: 'India',
        region: 'Varanasi',
        materials: 'Hand-Woven Raw Silk, Turmeric Natural Dye',
        craftingTimeWeeks: 2,
        isReadyToShip: true,
        verificationStatus: 'VERIFIED',
        imageUrl: '/collections/textiles_sm4.png',
        images: ['/collections/textiles_sm4.png', '/collections/textiles_sm1.png'],
        dimensions: '50cm x 50cm',
        weight: '0.22 kg',
      },
    ],
    defaultMakers: [
      {
        id: 'maker-srinagar-01',
        businessName: 'Srinagar Heritage Weavers',
        founderName: 'Ghulam Rasool Bhat',
        country: 'India',
        city: 'Srinagar',
        verificationStatus: 'GI',
        yearsInBusiness: 65,
        productCount: 24,
        shortIntro:
          'Geographical Indication certified pashmina masters spinning genuine Ladakh fleece on ancestral spinning wheels.',
        heroImage: '/collections/textiles_hero.png',
        logo: '/collections/textiles_sm1.png',
      },
    ],
  },
  leather: {
    title: 'Leather',
    tagline: 'Vegetable-Tanned Hides, Hand Saddle-Stitching & Patina Craft',
    description:
      'Tanned with tree bark, mimosa, and chestnut in open stone vats. Hand-cut and saddle-stitched using waxed linen threads to create enduring goods designed to age gracefully for generations.',
    provenanceHubs: ['Fez', 'Florence', 'Santa Croce', 'Cordoba', 'Leon'],
    heritage: {
      ancestralEra: 'Chouara Medieval Tanneries to Tuscan Saddle Guilds',
      primaryMaterials: [
        'Full-Grain Vegetable Tanned Bovine Hide (2.2mm)',
        'Hand-Waxed Irish Linen Thread',
        'Solid Forged Brass Hardware',
        'Natural Beeswax Edge Burnish',
      ],
      techniques: [
        {
          name: 'Traditional Two-Needle Saddle Stitching',
          description:
            'Simultaneous double-needle pass through awl-pierced diamond holes, ensuring individual stitches never unravel even if cut.',
        },
        {
          name: 'Bark Pit Vegetable Tanning',
          description:
            'Two-month gradual submersion in progressive bark liquors without chemical chromium, giving leather its distinct earthy aroma and rich patina.',
        },
      ],
      auditStandard:
        'Zero chromium 6 chemical certification and certified European pasture-raised ethical hide traceability.',
    },
    defaultProducts: [
      {
        id: 'lea-01',
        title: 'Cognac Vegetable-Tanned Artisan Handbag',
        maker: 'Chouara Master Tannery Guild',
        makerId: 'maker-chouara-01',
        price: 590,
        country: 'Morocco',
        region: 'Fez Medina',
        materials: 'Full Grain Vegetable-Tanned Hide, Solid Brass Buckles',
        craftingTimeWeeks: 4,
        isReadyToShip: true,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/leather_hero.png',
        images: ['/collections/leather_hero.png', '/collections/leather_sm1.png'],
        dimensions: '34cm x 26cm x 12cm',
        weight: '1.2 kg',
      },
      {
        id: 'lea-02',
        title: 'Structured Saddle Leather Daily Tote',
        maker: 'Santa Croce Leather Workshop',
        makerId: 'maker-santacroce-01',
        price: 480,
        country: 'Italy',
        region: 'Tuscany',
        materials: 'Vachetta Natural Leather, Raw Suede Lining',
        craftingTimeWeeks: 3,
        isReadyToShip: true,
        verificationStatus: 'GI',
        imageUrl: '/collections/leather_sm1.png',
        images: ['/collections/leather_sm1.png', '/collections/leather_sm2.png'],
        dimensions: '40cm x 32cm x 14cm',
        weight: '1.1 kg',
      },
      {
        id: 'lea-03',
        title: 'Hand-Tooled Heritage Bifold Wallet',
        maker: 'Cordovan Leather Guild',
        makerId: 'maker-cordovan-01',
        price: 160,
        country: 'Spain',
        region: 'Cordoba',
        materials: 'Shell Cordovan, Hand-Burnished Edges',
        craftingTimeWeeks: 2,
        isReadyToShip: true,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/leather_sm2.png',
        images: ['/collections/leather_sm2.png', '/collections/leather_hero.png'],
        dimensions: '11cm x 9cm',
        weight: '0.12 kg',
      },
      {
        id: 'lea-04',
        title: 'Heritage Weekend Travel Duffle',
        maker: 'Santa Croce Leather Workshop',
        makerId: 'maker-santacroce-01',
        price: 720,
        country: 'Italy',
        region: 'Tuscany',
        materials: 'Heavy Saddle Leather, Antiqued Brass Rivets',
        craftingTimeWeeks: 5,
        isReadyToShip: false,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/leather_sm3.png',
        images: ['/collections/leather_sm3.png', '/collections/leather_sm1.png'],
        dimensions: '55cm x 30cm x 28cm',
        weight: '2.6 kg',
      },
      {
        id: 'lea-05',
        title: 'Hand-Burnished Bridle Leather Belt',
        maker: 'Chouara Master Tannery Guild',
        makerId: 'maker-chouara-01',
        price: 140,
        country: 'Morocco',
        region: 'Fez',
        materials: 'English Bridle Cowhide, Solid Cast Brass',
        craftingTimeWeeks: 1,
        isReadyToShip: true,
        verificationStatus: 'VERIFIED',
        imageUrl: '/collections/leather_sm4.png',
        images: ['/collections/leather_sm4.png', '/collections/leather_sm2.png'],
        dimensions: '3.5cm Width, Custom Length',
        weight: '0.25 kg',
      },
    ],
    defaultMakers: [
      {
        id: 'maker-chouara-01',
        businessName: 'Chouara Master Tannery Guild',
        founderName: 'Maalem Hassan El-Fassi',
        country: 'Morocco',
        city: 'Fez',
        verificationStatus: 'ELITE',
        yearsInBusiness: 70,
        productCount: 28,
        shortIntro:
          'Operating continuous natural vegetable tanning pits in the 11th-century Medina of Fez, using pigeon guano and cedar wood tannins.',
        heroImage: '/collections/leather_hero.png',
        logo: '/collections/leather_sm1.png',
      },
      {
        id: 'maker-santacroce-01',
        businessName: 'Santa Croce Leather Workshop',
        founderName: 'Marco Bellini',
        country: 'Italy',
        city: 'Pisa',
        verificationStatus: 'GI',
        yearsInBusiness: 48,
        productCount: 22,
        shortIntro:
          'Pelle al Vegetale consortium member hand-crafting durable luggage and equestrian bags in Tuscany.',
        heroImage: '/collections/leather_sm1.png',
        logo: '/collections/leather_sm3.png',
      },
    ],
  },
  'home decor': {
    title: 'Living Spaces',
    tagline: 'Hand-Pierced Lanterns, Carved Walnut & Architectural Artifacts',
    description:
      'Artifacts designed to turn living spaces into serene sanctuaries. From hand-chiseled Moroccan brass lanterns that cast intricate shadow geometries to hand-turned walnut trays and stoneware vessels.',
    provenanceHubs: ['Marrakech', 'Cairo', 'Swat Valley', 'Kyoto', 'Aleppo'],
    heritage: {
      ancestralEra: 'Andalusian Palaces & Moorish Courtyard Architecture',
      primaryMaterials: [
        'Solid Hand-Pierced Brass Sheets',
        'Seasoned Himalayan Walnut Wood',
        'Natural Terracotta & Mineral Slips',
        'Hand-Blown Stained Glass',
      ],
      techniques: [
        {
          name: 'Hand-Pierced Filigree Metalwork',
          description:
            'Drilling and hand-sawing thousands of delicate micro-apertures across curved brass surfaces to generate complex shadow projections.',
        },
        {
          name: 'Relief Wood Carving',
          description:
            'Carving seasoned dense walnut blocks with handheld gouges to reveal geometric arabesques and botanical relief.',
        },
      ],
      auditStandard:
        'FSC certified sustainably harvested ancient wood and lead-free alloy testing.',
    },
    defaultProducts: [
      {
        id: 'hd-01',
        title: 'Moroccan Hand-Pierced Brass Lantern',
        maker: 'Marrakech Medina Lighting Guild',
        makerId: 'maker-marrakech-01',
        price: 340,
        country: 'Morocco',
        region: 'Marrakech Souks',
        materials: 'Pierced Solid Brass, Antique Bronze Patina',
        craftingTimeWeeks: 4,
        isReadyToShip: true,
        verificationStatus: 'ELITE',
        imageUrl: '/collections/homedecor_hero.png',
        images: ['/collections/homedecor_hero.png', '/collections/homedecor_sm1.png'],
        dimensions: '58cm x 26cm',
        weight: '2.8 kg',
      },
      {
        id: 'hd-02',
        title: 'Hand-Carved Walnut Heritage Tray',
        maker: 'Swat Valley Woodcrafters',
        makerId: 'maker-swat-01',
        price: 210,
        country: 'Pakistan',
        region: 'Swat Valley',
        materials: 'Seasoned Wild Walnut, Natural Beeswax Polish',
        craftingTimeWeeks: 3,
        isReadyToShip: true,
        verificationStatus: 'GI',
        imageUrl: '/collections/homedecor_sm1.png',
        images: ['/collections/homedecor_sm1.png', '/collections/homedecor_hero.png'],
        dimensions: '46cm x 32cm',
        weight: '1.6 kg',
      },
      {
        id: 'hd-03',
        title: 'Cast Brass Architectural Incense Burner',
        maker: 'Cairo Heritage Foundry',
        makerId: 'maker-cairo-01',
        price: 165,
        country: 'Egypt',
        region: 'Khan el-Khalili, Cairo',
        materials: 'Solid Cast Brass, Openwork Dome',
        craftingTimeWeeks: 2,
        isReadyToShip: true,
        verificationStatus: 'VERIFIED',
        imageUrl: '/collections/homedecor_sm2.png',
        images: ['/collections/homedecor_sm2.png', '/collections/homedecor_sm1.png'],
        dimensions: '22cm x 14cm',
        weight: '1.4 kg',
      },
    ],
    defaultMakers: [
      {
        id: 'maker-marrakech-01',
        businessName: 'Marrakech Medina Lighting Guild',
        founderName: 'Maalem Omar Berrada',
        country: 'Morocco',
        city: 'Marrakech',
        verificationStatus: 'ELITE',
        yearsInBusiness: 44,
        productCount: 16,
        shortIntro:
          'Celebrated brass lantern makers whose intricate geometric shadow work illuminates international architectural residences.',
        heroImage: '/collections/homedecor_hero.png',
        logo: '/collections/homedecor_sm1.png',
      },
    ],
  },
};

// Aliases mapping
const SLUG_MAP: Record<string, string> = {
  'metal craft': 'metal craft',
  'metal': 'metal craft',
  'metalcraft': 'metal craft',
  'ceramics': 'ceramics',
  'ceramic': 'ceramics',
  'pottery': 'ceramics',
  'jewellery': 'jewelry',
  'jewelry': 'jewelry',
  'textiles': 'textiles',
  'textile': 'textiles',
  'weaving': 'textiles',
  'leather': 'leather',
  'leathercraft': 'leather',
  'home decor': 'home decor',
  'home-decor': 'home decor',
  'living spaces': 'home decor',
  'livingspaces': 'home decor',
  'woodwork': 'metal craft', // graceful fallback
  'art': 'ceramics',
  'fashion': 'textiles',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const decoded = decodeURIComponent(rawCategory);
  const normalizedKey = SLUG_MAP[decoded.toLowerCase().trim()] || 'metal craft';
  const data = DISCIPLINE_DATA[normalizedKey] || DISCIPLINE_DATA['metal craft'];

  return {
    title: `${data.title} Masterworks & Certified Ateliers | Britsync Provenance Registry`,
    description: data.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ search?: string; maker?: string }>;
}) {
  const { category: rawCategory } = await params;
  const { search: searchParam, maker: makerParam } = await searchParams;
  const decodedCategory = decodeURIComponent(rawCategory);
  const normalizedKey = SLUG_MAP[decodedCategory.toLowerCase().trim()] || 'metal craft';
  const disciplineInfo = DISCIPLINE_DATA[normalizedKey] || DISCIPLINE_DATA['metal craft'];
  const initialSearch = (searchParam || makerParam || '').trim();

  // 1. Fetch any database products that match category or name
  let dbProducts: CategoryProductItem[] = [];
  try {
    const rawProducts = await prisma.product.findMany({
      where: {
        OR: [
          {
            category: {
              translations: {
                some: {
                  name: {
                    contains: decodedCategory,
                  },
                },
              },
            },
          },
          {
            translations: {
              some: {
                name: {
                  contains: decodedCategory,
                },
              },
            },
          },
        ],
      },
      take: 12,
      include: {
        translations: true,
        maker: {
          include: {
            user: true,
            location: {
              include: {
                translations: true,
              },
            },
          },
        },
        mediaMaps: {
          include: {
            media: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (rawProducts.length > 0) {
      dbProducts = rawProducts.map((p) => {
        const title = p.translations[0]?.name || 'Artisan Masterwork';
        const country =
          p.maker?.location?.translations?.find((t: any) => t.languageCode === 'en')
            ?.name || 'Global';
        const mediaUrls = p.mediaMaps.map((m) => m.media.storageKey).filter(Boolean);
        const imageUrl =
          mediaUrls[0] ||
          p.primaryImageUrl ||
          disciplineInfo.defaultProducts[0]?.imageUrl ||
          '/collections/metalcraft_hero.png';

        return {
          id: p.id,
          title,
          maker: p.maker?.businessName || p.maker?.user?.name || 'Verified Master Artisan',
          makerId: p.maker?.id || '',
          price: Math.round(p.desiredPrice || 250),
          country,
          region: country,
          materials: p.materials || 'Handcrafted Heritage Materials',
          craftingTimeWeeks: p.craftingTimeWeeks || 3,
          isReadyToShip: p.isReadyToShip ?? true,
          verificationStatus: p.verificationStatus || 'VERIFIED',
          imageUrl,
          images: mediaUrls.length > 0 ? mediaUrls : [imageUrl],
          dimensions: p.dimensions || undefined,
          weight: p.weight || undefined,
        };
      });
    }
  } catch (err) {
    console.error('Error loading DB products for category:', err);
  }

  // Combine DB products with curated catalog (DB products first, then curated without duplicating)
  const combinedProducts = [
    ...dbProducts,
    ...disciplineInfo.defaultProducts.filter(
      (dp) => !dbProducts.some((p) => p.title.toLowerCase() === dp.title.toLowerCase())
    ),
  ];

  // 2. Fetch verified makers from DB or fallback
  let dbMakers: CategoryMakerItem[] = [];
  try {
    const rawMakers = await prisma.makerProfile.findMany({
      where: {
        verificationStatus: {
          in: ['VERIFIED', 'ELITE', 'GI'],
        },
      },
      take: 8,
      include: {
        user: true,
        coverMedia: true,
        founderMedia: true,
        location: {
          include: {
            translations: true,
          },
        },
        products: {
          select: { id: true },
        },
      },
    });

    if (rawMakers.length > 0) {
      dbMakers = rawMakers.map((m) => {
        const country =
          m.location?.translations?.find((t: any) => t.languageCode === 'en')?.name ||
          'Global';
        const heroImage =
          m.coverMedia?.storageKey ||
          disciplineInfo.defaultProducts[0]?.imageUrl ||
          '/collections/metalcraft_hero.png';
        const logo = m.founderMedia?.storageKey || m.coverMedia?.storageKey || heroImage;

        return {
          id: m.id,
          businessName: m.businessName || m.user?.name || 'Heritage Atelier',
          founderName: m.user?.name || 'Master Craftsman',
          country,
          city: country,
          verificationStatus: m.verificationStatus || 'VERIFIED',
          yearsInBusiness: m.yearsInBusiness || 20,
          productCount: m.products?.length || 8,
          shortIntro:
            m.businessStory ||
            m.founderStory ||
            `Dedicated master artisan studio preserving generational craft heritage.`,
          heroImage,
          logo,
        };
      });
    }
  } catch (err) {
    console.error('Error loading DB makers for category:', err);
  }

  const combinedMakers =
    dbMakers.length > 0
      ? [
          ...disciplineInfo.defaultMakers,
          ...dbMakers.filter(
            (m) =>
              !disciplineInfo.defaultMakers.some(
                (dm) => dm.businessName.toLowerCase() === m.businessName.toLowerCase()
              )
          ),
        ]
      : disciplineInfo.defaultMakers;

  return (
    <CategoryClient
      disciplineKey={normalizedKey}
      disciplineTitle={disciplineInfo.title}
      tagline={disciplineInfo.tagline}
      description={disciplineInfo.description}
      provenanceHubs={disciplineInfo.provenanceHubs}
      heritage={disciplineInfo.heritage}
      products={combinedProducts}
      makers={combinedMakers}
      initialSearch={initialSearch}
    />
  );
}

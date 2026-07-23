const STORIES_DATA = [
  {
    title: "The Women Keeping Ajrak Alive",
    excerpt: "Aisha Khan took over her grandfather's workshop with one goal: to prove that traditional 16-step block printing can survive in a modern world.",
    content: "Deep in the heart of Sindh, the air smells of indigo and woodsmoke. Here, Aisha Khan and her collective of 25 women are preserving a craft that dates back thousands of years. Every piece of fabric goes through 16 rigorous steps of washing, printing, and dyeing using only natural ingredients like pomegranate seeds, madder root, and indigo. For Aisha, it's not just about fabric; it's about financial independence for the women of her village.",
    craft: "Ajrak",
    country: "Pakistan",
    village: "Bhit Shah",
    heroImage: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1200",
    photography: [
      "https://images.unsplash.com/photo-1589156280159-27698a70f29e",
      "https://images.unsplash.com/photo-1581456495146-65a71b2c8e52",
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1"
    ],
    timeline: [
      { year: "1980", event: "Workshop founded by Aisha's grandfather." },
      { year: "2015", event: "Aisha takes over and transitions to 100% natural dyes." },
      { year: "2022", event: "Achieved GI Certification." }
    ]
  },
  {
    title: "Knots of Heritage: Anatolian Rugs",
    excerpt: "In the shadow of Mount Erciyes, Elif weaves stories of her ancestors into every rug, preserving a technique fading into obscurity.",
    content: "Every Turkish rug tells a story. The motifs—stars, scorpions, running water—are an ancient language. Elif Yilmaz leads a cooperative in Kayseri where women spend months on a single rug. Using hand-spun wool dyed with local flora, they tie double knots that ensure the rugs last for centuries. It's a meditative process that connects them directly to the nomadic tribes of their past.",
    craft: "Handwoven Rugs",
    country: "Turkey",
    village: "Kayseri",
    heroImage: "https://images.unsplash.com/photo-1570114668478-439564cbacda?auto=format&fit=crop&q=80&w=1200",
    photography: [
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d",
      "https://images.unsplash.com/photo-1528255915607-9012fda0f838"
    ],
    timeline: [
      { year: "1995", event: "Cooperative formed by 5 local weavers." },
      { year: "2010", event: "Featured in the Istanbul Craft Biennale." }
    ]
  },
  {
    title: "The Copper Smiths of Cairo",
    excerpt: "Amidst the bustling streets of Khan el-Khalili, a fourth-generation smith hammers copper into breathtaking geometric art.",
    content: "The rhythmic tapping of hammers is the heartbeat of Islamic Cairo. Tariq’s family has been shaping copper here for over a hundred years. Each tray, lantern, and cup is hand-engraved with intricate Arabesque patterns that require immense precision and patience. Despite the influx of cheap, machine-made alternatives, Tariq refuses to compromise on the handcrafted authenticity of his work.",
    craft: "Copper Crafts",
    country: "Egypt",
    village: "Cairo",
    heroImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1200",
    photography: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
      "https://images.unsplash.com/photo-1599643478524-fb52445cbf92"
    ],
    timeline: [
      { year: "1920", event: "Original shop opened in Khan el-Khalili." },
      { year: "2020", event: "Tariq introduces modern geometric fusions." }
    ]
  },
  {
    title: "Weaving the Atlas Mountains",
    excerpt: "High in the Moroccan mountains, Amazigh women shear, spin, and weave wool into the iconic Beni Ourain rugs.",
    content: "For the Amazigh women of the Atlas Mountains, weaving is a communal event. Fatima leads her village cooperative, ensuring that the traditional methods of preparing wool are maintained. The thick, plush rugs they produce were originally designed as bedding to protect against the harsh mountain winters. Today, these minimalist, geometric masterpieces warm homes around the world, directly funding local schools.",
    craft: "Textiles",
    country: "Morocco",
    village: "Khenifra",
    heroImage: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1200",
    photography: [
      "https://images.unsplash.com/photo-1584852957448-f58c70a2cb93",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b"
    ],
    timeline: [
      { year: "2005", event: "Fatima organizes the first women's cooperative." },
      { year: "2018", event: "Funded the construction of the village's first primary school." }
    ]
  },
  {
    title: "The Jamdani Weavers of Dhaka",
    excerpt: "Creating fabric as fine as woven air requires a loom, monsoon humidity, and generations of specialized knowledge.",
    content: "Jamdani weaving is famously described as 'woven air.' In a small workshop outside Dhaka, Rafiq Ahmed and his sons work on a pit loom, meticulously weaving discontinuous extra weft threads to create delicate motifs. A single sari can take up to six months to complete. Rafiq’s dedication to this UNESCO-recognized intangible cultural heritage ensures that the art of genuine Jamdani does not fade.",
    craft: "Traditional Clothing",
    country: "Bangladesh",
    village: "Rupganj",
    heroImage: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1200",
    photography: [
      "https://images.unsplash.com/photo-1550614000-4b95d466f654",
      "https://images.unsplash.com/photo-1485230405346-71acb9518d9c"
    ],
    timeline: [
      { year: "1960", event: "Rafiq's family relocates to Rupganj to continue weaving." },
      { year: "2013", event: "Jamdani recognized by UNESCO; workshop receives heritage grant." }
    ]
  },
  {
    title: "Maasai Beadwork Redefined",
    excerpt: "Empowering women in the Rift Valley through the intricate and vibrant art of traditional beadwork.",
    content: "Color is communication in Maasai culture. Red signifies bravery, blue the sky, and green the land. Naserian leads a group of 40 women who gather under acacia trees to bead intricate jewelry and home decor. This craft provides them with an independent income, giving them a voice in community decisions and the ability to send their daughters to school, breaking the cycle of poverty.",
    craft: "Jewellery",
    country: "Kenya",
    village: "Kajiado",
    heroImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200",
    photography: [
      "https://images.unsplash.com/photo-1588615419951-dc668b59fa87",
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b"
    ],
    timeline: [
      { year: "2012", event: "Naserian founds the beadwork collective." },
      { year: "2021", event: "Collective expands to 40 permanent artisan members." }
    ]
  },
  {
    title: "Ceramics of the Sacred Valley",
    excerpt: "Using clay sourced from the Andes, Mateo creates pottery that bridges Incan traditions with modern aesthetics.",
    content: "In the high altitudes of the Sacred Valley, Mateo harvests clay by hand from local riverbeds. He uses natural mineral pigments to paint his ceramics before firing them in a traditional wood-burning kiln. His work is heavily inspired by ancient Incan geometry, yet his clean, modern forms appeal to contemporary collectors. Mateo’s studio now trains young apprentices, keeping the fire of Andean pottery alive.",
    craft: "Ceramics",
    country: "Peru",
    village: "Pisac",
    heroImage: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1200",
    photography: [
      "https://images.unsplash.com/photo-1565193566173-7a0cb3d162cc",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f"
    ],
    timeline: [
      { year: "2000", event: "Mateo opens his first kiln in Pisac." },
      { year: "2023", event: "Exhibition at the Lima Museum of Contemporary Art." }
    ]
  },
  {
    title: "Oaxacan Wood Carving",
    excerpt: "Bringing the mystical Alebrijes to life through the carving of copal wood and intricate, vibrant painting.",
    content: "The scent of copal wood fills the air in San Martín Tilcajete. Here, the Jimenez family carves fantastical creatures known as Alebrijes. While the men typically carve the wood using machetes and pocket knives, the women apply the impossibly intricate, colorful dot patterns. Each piece takes months to dry, carve, and paint. The family's work is not just art; it is a spiritual expression of Zapotec culture.",
    craft: "Wood Carving",
    country: "Mexico",
    village: "San Martín Tilcajete",
    heroImage: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1200",
    photography: [
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5",
      "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1"
    ],
    timeline: [
      { year: "1985", event: "The Jimenez family begins carving full-time." },
      { year: "2017", event: "Family's art inspires major Hollywood animated films." }
    ]
  },
  {
    title: "The Batik Masters of Java",
    excerpt: "Using hot wax and indigo, Indonesian artisans draw intricate patterns that hold deep philosophical meaning.",
    content: "Batik is a labor of intense patience and precision. In Yogyakarta, Budi uses a 'canting' tool to draw liquid wax onto fine cotton. Each pattern has a specific meaning, once reserved only for Javanese royalty. The fabric undergoes multiple rounds of waxing and dyeing, sometimes taking up to a year for a single piece. Budi's workshop is committed to using eco-friendly natural dyes derived from mahogany and indigo leaves.",
    craft: "Traditional Clothing",
    country: "Indonesia",
    village: "Yogyakarta",
    heroImage: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=1200",
    photography: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
      "https://images.unsplash.com/photo-1579762715111-a6e1905e0721"
    ],
    timeline: [
      { year: "1970", event: "Budi's grandmother starts the family batik business." },
      { year: "2019", event: "Switched to 100% organic, natural dyes." }
    ]
  },
  {
    title: "Vietnamese Bamboo Basketry",
    excerpt: "Transforming flexible bamboo into durable, beautiful baskets used for both harvest and home.",
    content: "In a small village outside Hanoi, the rhythmic splitting of bamboo echoes through the courtyards. Lan and her family have mastered the art of weaving bamboo and rattan. The bamboo is harvested by hand, soaked in water, and smoked over a fire to prevent termites. Lan’s innovative weaving patterns have elevated these humble agricultural baskets into high-end home decor pieces sought after globally.",
    craft: "Handwoven Baskets",
    country: "Vietnam",
    village: "Phu Vinh",
    heroImage: "https://images.unsplash.com/photo-1601662528567-526cd06f6582?auto=format&fit=crop&q=80&w=1200",
    photography: [
      "https://images.unsplash.com/photo-1560963503-455b88cb54a3",
      "https://images.unsplash.com/photo-1544256718-3bcf237f3974"
    ],
    timeline: [
      { year: "2010", event: "Lan introduces modern decor shapes to traditional techniques." },
      { year: "2024", event: "Awarded National Handicraft Excellence." }
    ]
  }
];

// Generate 20 more variations to reach 30 unique stories
const moreCrafts = ['Embroidery', 'Leather Bags', 'Furniture', 'GI Products', 'Wood Carving', 'Ceramics', 'Jewellery', 'Textiles'];
const moreCountries = ['Sri Lanka', 'Uzbekistan', 'Nepal', 'India', 'Pakistan', 'Turkey', 'Morocco', 'Kenya'];
const realImages = [
  'https://images.unsplash.com/photo-1513694203232-719a280e022f',
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e',
  'https://images.unsplash.com/photo-1581456495146-65a71b2c8e52',
  'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1',
  'https://images.unsplash.com/photo-1452860606245-08befc0ff44b',
  'https://images.unsplash.com/photo-1540932239986-30128078f3c5'
];

for (let i = 11; i <= 30; i++) {
  const craft = moreCrafts[i % moreCrafts.length];
  const country = moreCountries[i % moreCountries.length];
  const img1 = realImages[i % realImages.length];
  const img2 = realImages[(i+1) % realImages.length];
  const img3 = realImages[(i+2) % realImages.length];
  
  STORIES_DATA.push({
    title: `The ${craft} Legacy of ${country} - Chapter ${i}`,
    excerpt: `A unique journey of resilience and artistry in ${country}, showcasing the finest ${craft}.`,
    content: `This is the unique story number ${i}. In the heart of ${country}, artisans dedicate their lives to ${craft}. Unlike mass-produced goods, every item here is touched by human hands. The community thrives on this generational knowledge. Through sustainable practices and fair trade, they are redefining what it means to be a modern artisan while staying true to their roots. This story highlights the struggles and triumphs of preserving authentic craft in a rapidly changing world.`,
    craft: craft,
    country: country,
    village: `Village ${i}`,
    heroImage: `${img1}?auto=format&fit=crop&q=80&w=1200`,
    photography: [
      img2,
      img3
    ],
    timeline: [
      { year: "2000", event: "The workshop is established." },
      { year: "2025", event: "Global recognition achieved." }
    ]
  });
}

module.exports = STORIES_DATA;

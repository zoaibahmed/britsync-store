export interface GiftPackagingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export const GIFT_PACKAGING_OPTIONS: GiftPackagingOption[] = [
  {
    id: 'standard',
    name: 'Standard Gift Wrap',
    description: 'Britsync branded tissue paper with ribbon and gift tag',
    price: 4.99,
    icon: '🎁'
  },
  {
    id: 'premium',
    name: 'Premium Gift Box',
    description: 'Handcrafted wooden gift box with silk lining and personalized note',
    price: 14.99,
    icon: '🎀'
  },
  {
    id: 'luxury',
    name: 'Luxury Heritage Box',
    description: 'Museum-grade presentation box with certificate of authenticity and artisan story card',
    price: 29.99,
    icon: '👑'
  }
];

/**
 * Get available gift packaging options.
 */
export function getGiftPackagingOptions(): GiftPackagingOption[] {
  return GIFT_PACKAGING_OPTIONS;
}

/**
 * Get gift packaging option by ID.
 */
export function getGiftPackagingOption(id: string): GiftPackagingOption | undefined {
  return GIFT_PACKAGING_OPTIONS.find(opt => opt.id === id);
}

/**
 * Calculate gift packaging total.
 */
export function calculateGiftPackagingTotal(optionId: string): number {
  const option = getGiftPackagingOption(optionId);
  return option ? option.price : 0;
}

/**
 * Handle gift packaging chat queries.
 */
export function handleGiftPackagingQuery(query: string): string | null {
  const lower = query.toLowerCase();

  if (!lower.includes('gift') && !lower.includes('wrapping') && !lower.includes('packaging') && !lower.includes('present')) {
    return null;
  }

  if (lower.includes('option') || lower.includes('available') || lower.includes('what') || lower.includes('choose')) {
    return `### 🎁 Gift Packaging Options\n\n` +
      GIFT_PACKAGING_OPTIONS.map(opt =>
        `#### ${opt.icon} ${opt.name}\n` +
        `* ${opt.description}\n` +
        `* **Price:** £${opt.price.toFixed(2)}\n`
      ).join('\n') +
      `\n*Add gift packaging during checkout. Gift messages can be included with Premium and Luxury options.*`;
  }

  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
    return `### 🎁 Gift Packaging Prices\n` +
      `* **Standard Gift Wrap:** £4.99\n` +
      `* **Premium Gift Box:** £14.99\n` +
      `* **Luxury Heritage Box:** £29.99\n\n` +
      `*Prices include gift wrapping, tissue paper, and a gift tag.*`;
  }

  if (lower.includes('message') || lower.includes('note') || lower.includes('card')) {
    return `### 🎁 Gift Messages\n` +
      `* Premium and Luxury gift boxes include a **personalized gift card**\n` +
      `* Add your message during checkout (max 200 characters)\n` +
      `* Cards are printed on premium recycled paper\n` +
      `* Standard gift wrap includes a blank gift tag for handwritten messages`;
  }

  if (lower.includes('how') || lower.includes('add') || lower.includes('include')) {
    return `### 🎁 How to Add Gift Packaging\n` +
      `1. Add products to your cart\n` +
      `2. Go to **Cart** → **Checkout**\n` +
      `3. Select your gift packaging option\n` +
      `4. Add a personalized message (Premium/Luxury only)\n` +
      `5. Complete your order\n\n` +
      `*Gift packaging is added per item. For multiple gifts, select packaging for each.*`;
  }

  // Default gift packaging response
  return `### 🎁 Gift Packaging\n` +
    `Britsync offers premium gift packaging for your heritage purchases:\n\n` +
    `* **Standard Gift Wrap** - £4.99\n` +
    `* **Premium Gift Box** - £14.99\n` +
    `* **Luxury Heritage Box** - £29.99\n\n` +
    `Type **'gift options'** to see all packaging choices, or **'gift message'** to learn about personalized cards.`;
}

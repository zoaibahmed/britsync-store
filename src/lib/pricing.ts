/**
 * Britsync Pricing Engine
 * 
 * Business Model:
 * - Britsync is NOT a commission marketplace.
 * - Seller sets their "Desired Selling Price" (e.g. £20).
 * - Britsync adds its own managed commerce margin based on admin-defined pricing rules.
 * - Buyer pays the final "Selling Price".
 * - Seller always receives their desired amount.
 * - Britsync earns the remaining margin.
 */

export interface PricingRules {
  flatMargin: number;
  percentageMargin: number;
  categoryMargins: Record<string, number>;
  countryMargins: Record<string, number>;
  tierMargins: {
    GENERAL: number;
    ELITE: number;
    GI: number;
  };
  luxuryThreshold: number;
  luxuryMargin: number;
}

export const DEFAULT_RULES: PricingRules = {
  flatMargin: 0,
  percentageMargin: 60, // Default 60% markup
  categoryMargins: {
    Ceramics: 60,
    Textiles: 60,
    Jewelry: 65,
    Woodwork: 55,
    Leather: 60,
    'Home Decor': 60,
    Fashion: 65,
    Art: 70
  },
  countryMargins: {
    Pakistan: 0,
    Bangladesh: 0,
    India: 0,
    Turkey: 0,
    Morocco: 0,
    Kenya: 0,
    Ghana: 0,
    Peru: 0,
    Mexico: 0,
    Indonesia: 0
  },
  tierMargins: {
    GENERAL: 50,
    ELITE: 70,
    GI: 80
  },
  luxuryThreshold: 500,
  luxuryMargin: 40 // Adjusted markup for luxury high-ticket items
};

export function getPricingRules(): PricingRules {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('britsync_pricing_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
  }
  return DEFAULT_RULES;
}

export function savePricingRules(rules: PricingRules) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('britsync_pricing_rules', JSON.stringify(rules));
    // Trigger custom event for reactivity across tabs
    window.dispatchEvent(new Event('britsync_pricing_rules_updated'));
  }
}

export function calculateSellingPrice(
  desiredPrice: number, 
  category?: string, 
  country?: string, 
  verificationStatus?: string
): number {
  const rules = getPricingRules();
  let markupPercent = rules.percentageMargin;

  // 1. Check Category Margin
  if (category && rules.categoryMargins[category] !== undefined) {
    markupPercent = rules.categoryMargins[category];
  }

  // 2. Check Verification Tier Margin
  if (verificationStatus && rules.tierMargins[verificationStatus as keyof typeof rules.tierMargins] !== undefined) {
    markupPercent = rules.tierMargins[verificationStatus as keyof typeof rules.tierMargins];
  }

  // 3. Check Luxury Margin (high-ticket items)
  if (desiredPrice >= rules.luxuryThreshold) {
    markupPercent = rules.luxuryMargin;
  }

  // 4. Calculate base markup price
  let finalPrice = desiredPrice * (1 + markupPercent / 100);

  // 5. Add Country Margin adjustment
  if (country && rules.countryMargins[country] !== undefined) {
    finalPrice += desiredPrice * (rules.countryMargins[country] / 100);
  }

  // 6. Add Flat Margin
  finalPrice += rules.flatMargin;

  return parseFloat(finalPrice.toFixed(2));
}

export function calculateMargin(
  desiredPrice: number,
  category?: string,
  country?: string,
  verificationStatus?: string
): number {
  const finalPrice = calculateSellingPrice(desiredPrice, category, country, verificationStatus);
  return parseFloat((finalPrice - desiredPrice).toFixed(2));
}

export function formatPrice(price: number): string {
  return `£${price.toFixed(2)}`;
}

import { prisma } from '@/lib/prisma';
import { calculateSellingPrice } from '@/lib/pricing';

export interface SellerDashboard {
  totalProducts: number;
  publishedProducts: number;
  pendingProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  walletBalance: number;
  totalEarnings: number;
  verificationStatus: string;
  certificates: { type: string; number: string; expiry: Date }[];
}

/**
 * Get seller dashboard data for a maker.
 */
export async function getSellerDashboard(makerId: string): Promise<SellerDashboard> {
  const [products, orders, wallet, makerProfile, certificates] = await Promise.all([
    prisma.product.findMany({
      where: { makerProfileId: makerId },
      select: { id: true, status: true, verificationStatus: true }
    }),
    prisma.order.findMany({
      where: {
        orderItems: { some: { product: { makerProfileId: makerId } } }
      },
      select: { id: true, status: true, totalAmount: true }
    }),
    prisma.wallet.findUnique({
      where: { makerProfileId: makerId },
      select: { clearedBalance: true }
    }),
    prisma.makerProfile.findUnique({
      where: { id: makerId },
      select: { verificationStatus: true }
    }),
    prisma.certificate.findMany({
      where: { makerProfileId: makerId },
      select: { certificateType: true, certificateNumber: true, expiryDate: true }
    })
  ]);

  const totalEarnings = orders
    .filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    totalProducts: products.length,
    publishedProducts: products.filter(p => p.status === 'PUBLISHED').length,
    pendingProducts: products.filter(p => p.status === 'PENDING_REVIEW').length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => ['PENDING', 'CONFIRMED', 'ACCEPTED'].includes(o.status)).length,
    completedOrders: orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status)).length,
    walletBalance: wallet?.clearedBalance || 0,
    totalEarnings,
    verificationStatus: makerProfile?.verificationStatus || 'GENERAL',
    certificates: certificates.map(c => ({
      type: c.certificateType,
      number: c.certificateNumber,
      expiry: c.expiryDate
    }))
  };
}

/**
 * Get seller's products with stats.
 */
export async function getSellerProducts(makerId: string) {
  const products = await prisma.product.findMany({
    where: { makerProfileId: makerId },
    include: {
      category: {
        include: {
          translations: true
        }
      },
      translations: true,
      mediaMaps: { 
        take: 1,
        include: {
          media: true
        }
      },
      _count: { select: { orderItems: true, reviews: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return products.map(p => {
    const trans = p.translations.find((t: any) => t.languageCode === 'en') || p.translations[0] || {};
    const catName = p.category.translations.find((t: any) => t.languageCode === 'en')?.name || 'General';
    const imageUrl = p.mediaMaps[0]?.media?.storageKey || '';

    return {
      ...p,
      name: trans.name || 'Product',
      description: trans.description || '',
      price: p.desiredPrice,
      category: {
        ...p.category,
        name: catName
      },
      media: imageUrl ? [{ url: imageUrl }] : []
    };
  });
}

/**
 * Get seller's orders.
 */
export async function getSellerOrders(makerId: string) {
  const orders = await prisma.order.findMany({
    where: {
      orderItems: { some: { product: { makerProfileId: makerId } } }
    },
    include: {
      buyer: { select: { name: true, email: true } },
      orderItems: {
        include: { 
          product: { 
            include: {
              translations: true
            } 
          } 
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return orders.map(o => ({
    ...o,
    orderItems: o.orderItems.map(item => {
      const trans = item.product.translations.find((t: any) => t.languageCode === 'en') || item.product.translations[0] || {};
      return {
        ...item,
        product: {
          name: trans.name || 'Product'
        }
      };
    })
  }));
}

/**
 * Get seller's wallet and transactions.
 */
export async function getSellerWallet(makerId: string) {
  let wallet = await prisma.wallet.findUnique({
    where: { makerProfileId: makerId },
    include: { walletTransactions: { orderBy: { createdAt: 'desc' }, take: 20 } }
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { makerProfileId: makerId, clearedBalance: 0 },
      include: { walletTransactions: { orderBy: { createdAt: 'desc' }, take: 20 } }
    });
  }

  return {
    ...wallet,
    balance: wallet.clearedBalance,
    transactions: wallet.walletTransactions
  };
}

/**
 * Process seller chat queries with real data.
 */
export async function handleSellerQuery(query: string, session: any): Promise<string | null> {
  if (!session || !session.userId) return null;

  const makerProfile = await prisma.makerProfile.findUnique({
    where: { userId: session.userId }
  });

  if (!makerProfile) return null;

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('wallet') || lowerQuery.includes('balance') || lowerQuery.includes('earnings')) {
    const wallet = await getSellerWallet(makerProfile.id);
    return `### 💰 Wallet Balance\n` +
      `* **Current Balance:** £${wallet.balance.toFixed(2)}\n` +
      `* **Currency:** ${wallet.currency}\n\n` +
      `#### Recent Transactions\n` +
      (wallet.transactions.length > 0
        ? wallet.transactions.map(t =>
            `* **${t.type === 'CREDIT' ? '↑' : '↓'}** £${Math.abs(t.amount).toFixed(2)} - ${t.description} (${t.status})`
          ).join('\n')
        : '* No transactions yet');
  }

  if (lowerQuery.includes('order') || lowerQuery.includes('sales')) {
    const orders = await getSellerOrders(makerProfile.id);
    const pending = orders.filter(o => ['PENDING', 'CONFIRMED', 'ACCEPTED'].includes(o.status));
    const completed = orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status));

    return `### 📦 Your Orders\n` +
      `* **Total Orders:** ${orders.length}\n` +
      `* **Pending:** ${pending.length}\n` +
      `* **Completed:** ${completed.length}\n\n` +
      (pending.length > 0
        ? `#### Pending Orders\n` +
          pending.slice(0, 3).map(o =>
            `* **${o.id}** - ${o.buyer.name} - £${o.totalAmount.toFixed(2)} (${o.status})`
          ).join('\n')
        : '* No pending orders');
  }

  if (lowerQuery.includes('upload') || lowerQuery.includes('product')) {
    return `### 📤 Upload a Product\n` +
      `To add a new product:\n` +
      `1. Go to your **Dashboard** → **Products**\n` +
      `2. Click **Add New Product**\n` +
      `3. Fill in: Name, Description, Story, Price, Category, Country\n` +
      `4. Upload images (at least 1 hero image)\n` +
      `5. Add specifications and materials\n` +
      `6. Submit for review\n\n` +
      `*Products go through curation before being published.*`;
  }

  if (lowerQuery.includes('verification') || lowerQuery.includes('elite')) {
    return `### ⭐ Elite Verification\n` +
      `* **Your Status:** ${makerProfile.verificationStatus}\n\n` +
      `To apply for Elite Verification:\n` +
      `1. Ensure your profile is complete\n` +
      `2. Have at least 3 published products\n` +
      `3. Click **Apply for Elite** in your dashboard\n` +
      `4. An inspector will visit your workshop\n` +
      `5. Upon approval, you'll receive an Elite certificate\n\n` +
      `*Elite products command higher prices and buyer trust.*`;
  }

  if (lowerQuery.includes('certificate') || lowerQuery.includes('cert')) {
    const dashboard = await getSellerDashboard(makerProfile.id);
    return `### 📜 Certificates\n` +
      (dashboard.certificates.length > 0
        ? dashboard.certificates.map(c =>
            `* **${c.type}** - #${c.number} (Expires: ${c.expiry.toLocaleDateString()})`
          ).join('\n')
        : '* No certificates yet. Apply for Elite Verification to receive one.');
  }

  if (lowerQuery.includes('dashboard') || lowerQuery.includes('stats') || lowerQuery.includes('overview')) {
    const dashboard = await getSellerDashboard(makerProfile.id);
    return `### 📊 Dashboard Overview\n` +
      `* **Products:** ${dashboard.publishedProducts} published, ${dashboard.pendingProducts} pending\n` +
      `* **Orders:** ${dashboard.totalOrders} total, ${dashboard.pendingOrders} pending\n` +
      `* **Wallet:** £${dashboard.walletBalance.toFixed(2)}\n` +
      `* **Total Earnings:** £${dashboard.totalEarnings.toFixed(2)}\n` +
      `* **Verification:** ${dashboard.verificationStatus}\n` +
      `* **Certificates:** ${dashboard.certificates.length}`;
  }

  if (lowerQuery.includes('shipping')) {
    return `### 🚚 Shipping Guide\n` +
      `As a maker, you are responsible for:\n` +
      `1. Packaging products securely\n` +
      `2. Using the provided shipping labels\n` +
      `3. Dispatching within 48 hours of order confirmation\n` +
      `4. Adding tracking information\n\n` +
      `*Britsync handles international logistics for Elite products.*`;
  }

  if (lowerQuery.includes('payment') || lowerQuery.includes('payout')) {
    return `### 💳 Payments & Payouts\n` +
      `* Payments are held in escrow until delivery is confirmed\n` +
      `* Funds are released to your wallet 48 hours after delivery\n` +
      `* Withdraw to your bank account from the Wallet section\n` +
      `* Britsync margin is deducted automatically\n\n` +
      `*Contact support for payment disputes.*`;
  }

  return null; // Fall back to Nova AI or generic response
}

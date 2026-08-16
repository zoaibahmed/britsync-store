'use client';
import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type AccreditationStatus =
  | 'GENERAL' | 'INCOMPLETE' | 'PENDING_AUDIT' | 'UNDER_REVIEW'
  | 'REVISION_REQUIRED' | 'GUILD_VERIFIED' | 'ROYAL_CHARTER' | 'REJECTED';

type SidebarSection =
  | 'overview' | 'studio-profile' | 'accreditation' | 'collection'
  | 'orders' | 'earnings' | 'provenance' | 'audit-history';

const GUILD_CATEGORIES = [
  'Ceramics & Pottery', 'Textiles & Weaving', 'Jewelry & Precious Metals',
  'Woodwork & Joinery', 'Leather Crafting', 'Home Decor & Glassware'
];

const PAYOUT_METHODS = ['Stripe Connect', 'Wise', 'Direct Bank Wire'];

const STATUS_META: Record<AccreditationStatus, { label: string; color: string; bg: string }> = {
  GENERAL:           { label: 'Applicant',        color: '#8a7a6a', bg: '#1a1810' },
  INCOMPLETE:        { label: 'In Progress',       color: '#c9a84c', bg: '#1a1600' },
  PENDING_AUDIT:     { label: 'Pending Audit',     color: '#6ab4f5', bg: '#091828' },
  UNDER_REVIEW:      { label: 'Under Review',      color: '#a78bfa', bg: '#120e24' },
  REVISION_REQUIRED: { label: 'Revision Required', color: '#f59e6a', bg: '#1e0e00' },
  GUILD_VERIFIED:    { label: 'Guild Verified',    color: '#4ade80', bg: '#051a0a' },
  ROYAL_CHARTER:     { label: 'Royal Charter',     color: '#c9a84c', bg: '#1a1000' },
  REJECTED:          { label: 'Not Approved',      color: '#f87171', bg: '#1a0505' },
};

const PRODUCT_STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT:                { label: 'Draft',              color: '#8a7a6a' },
  SUBMITTED_FOR_REVIEW: { label: 'Pending CEO Review', color: '#6ab4f5' },
  CATALOG_REVIEW:       { label: 'Under Review',       color: '#a78bfa' },
  APPROVED:             { label: 'Approved',            color: '#4ade80' },
  PUBLISHED:            { label: 'Live',                color: '#c9a84c' },
  REVISION_REQUIRED:    { label: 'Needs Revision',     color: '#f59e6a' },
  REJECTED:             { label: 'Rejected',            color: '#f87171' },
};

const ORDER_STATUS_PIPELINE = ['PENDING', 'ACCEPTED', 'PREPARING', 'PACKED', 'SHIPPED', 'DELIVERED'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function MakerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [maker, setMaker] = useState<any>(null);
  const [accreditation, setAccreditation] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SidebarSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [savingStep, setSavingStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wizardMsg, setWizardMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Wizard fields — Step 1
  const [craftCategory, setCraftCategory] = useState('Ceramics & Pottery');
  const [businessName, setBusinessName] = useState('');
  const [founderName, setFounderName] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('5');
  const [employeeCount, setEmployeeCount] = useState('3');
  const [country, setCountry] = useState('');

  // Wizard fields — Step 2
  const [heritageOriginStory, setHeritageOriginStory] = useState('');
  const [founderBiography, setFounderBiography] = useState('');
  const [craftTools, setCraftTools] = useState('');
  const [craftTechniques, setCraftTechniques] = useState('');
  const [craftPhilosophy, setCraftPhilosophy] = useState('');

  // Wizard fields — Step 3
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [founderPhotoUrl, setFounderPhotoUrl] = useState('');
  const [workshopPhoto1, setWorkshopPhoto1] = useState('');
  const [workshopPhoto2, setWorkshopPhoto2] = useState('');
  const [workshopPhoto3, setWorkshopPhoto3] = useState('');

  // Wizard fields — Step 4
  const [payoutMethod, setPayoutMethod] = useState('Stripe Connect');
  const [payoutAccountDetails, setPayoutAccountDetails] = useState('');

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productStory, setProductStory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productInventory, setProductInventory] = useState('1');
  const [productImage, setProductImage] = useState('');
  const [productMaterials, setProductMaterials] = useState('');
  const [productDimensions, setProductDimensions] = useState('');
  const [productWeight, setProductWeight] = useState('');
  const [productCraftingTime, setProductCraftingTime] = useState('');
  const [productMadeToOrder, setProductMadeToOrder] = useState(false);
  const [productOneOfOne, setProductOneOfOne] = useState(false);
  const [productReadyToShip, setProductReadyToShip] = useState(true);
  const [productSubmitForReview, setProductSubmitForReview] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [productMsg, setProductMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Order dispatch
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('DHL_EXPRESS');

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { window.location.href = '/login'; return; }
      const meData = await meRes.json();
      setUser(meData.user);

      const acRes = await fetch('/api/maker/accreditation');
      if (acRes.ok) {
        const acData = await acRes.json();
        setAccreditation(acData.accreditation);
        // Pre-fill wizard fields from saved data
        const a = acData.accreditation;
        if (a.craftCategory) setCraftCategory(a.craftCategory);
        if (a.businessName) setBusinessName(a.businessName);
        if (a.founderName) setFounderName(a.founderName);
        if (a.yearsInBusiness) setYearsInBusiness(String(a.yearsInBusiness));
        if (a.employeeCount) setEmployeeCount(String(a.employeeCount));
        if (a.country) setCountry(a.country);
        if (a.heritageOriginStory) setHeritageOriginStory(a.heritageOriginStory);
        if (a.founderBiography) setFounderBiography(a.founderBiography);
        if (a.craftTools) setCraftTools(a.craftTools);
        if (a.craftTechniques) setCraftTechniques(a.craftTechniques);
        if (a.craftPhilosophy) setCraftPhilosophy(a.craftPhilosophy);
        if (a.coverImageUrl) setCoverImageUrl(a.coverImageUrl);
        if (a.founderPhotoUrl) setFounderPhotoUrl(a.founderPhotoUrl);
        if (a.workshopPhoto1) setWorkshopPhoto1(a.workshopPhoto1);
        if (a.workshopPhoto2) setWorkshopPhoto2(a.workshopPhoto2);
        if (a.workshopPhoto3) setWorkshopPhoto3(a.workshopPhoto3);
        if (a.payoutMethod) setPayoutMethod(a.payoutMethod);

        // Resume from last saved step
        const savedStep = Math.min(Math.max(1, (a.accreditationStep || 0) + 1), 4);
        setWizardStep(savedStep);
      }

      const statsRes = await fetch('/api/maker/dashboard-stats');
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats);
      }

      // Load products and orders only for verified makers
      const profileRes = await fetch('/api/maker-profile');
      if (profileRes.ok) {
        const pData = await profileRes.json();
        setMaker(pData);
      }

      const status = meData.user?.makerProfile?.verificationStatus;
      if (['GUILD_VERIFIED', 'ROYAL_CHARTER'].includes(status)) {
        const [prodRes, ordRes] = await Promise.all([
          fetch('/api/maker/products'),
          fetch('/api/maker/orders'),
        ]);
        if (prodRes.ok) { const d = await prodRes.json(); setProducts(d.products || []); }
        if (ordRes.ok) { const d = await ordRes.json(); setOrders(d.orders || []); }
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const saveWizardStep = async (step: number) => {
    setSavingStep(true);
    setWizardMsg(null);
    try {
      let data: Record<string, any> = {};
      if (step === 1) data = { craftCategory, businessName, founderName, yearsInBusiness, employeeCount };
      if (step === 2) data = { heritageOriginStory, founderBiography, craftTools, craftTechniques, craftPhilosophy };
      if (step === 3) data = { coverImageUrl, founderPhotoUrl, workshopPhoto1, workshopPhoto2, workshopPhoto3 };
      if (step === 4) data = { payoutMethod, payoutAccountDetails };

      const res = await fetch('/api/maker/accreditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_step', step, data }),
      });
      const json = await res.json();
      if (res.ok) {
        setWizardMsg({ ok: true, text: `Step ${step} saved successfully` });
        if (step < 4) setWizardStep(step + 1);
      } else {
        setWizardMsg({ ok: false, text: json.error || 'Failed to save' });
      }
    } finally {
      setSavingStep(false);
    }
  };

  const submitApplication = async () => {
    setSubmitting(true);
    setWizardMsg(null);
    try {
      // Save current Step 4 fields first so user inputs are committed to DB
      await fetch('/api/maker/accreditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_step',
          step: 4,
          data: { payoutMethod, payoutAccountDetails }
        }),
      });

      const res = await fetch('/api/maker/accreditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit' }),
      });
      const json = await res.json();
      if (res.ok) {
        setWizardMsg({ ok: true, text: 'Application submitted for Guild Audit!' });
        setTimeout(() => loadAll(), 1500);
      } else {
        const missing = json.missing ? `\n• ${json.missing.join('\n• ')}` : '';
        setWizardMsg({ ok: false, text: (json.error || 'Submission failed') + missing });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const addProduct = async () => {
    if (!productName || !productPrice) {
      setProductMsg({ ok: false, text: 'Product name and price are required' });
      return;
    }
    setAddingProduct(true);
    setProductMsg(null);
    try {
      const res = await fetch('/api/maker/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          description: productDescription,
          story: productStory,
          desiredPrice: productPrice,
          inventory: productInventory,
          primaryImageUrl: productImage,
          materials: productMaterials,
          dimensions: productDimensions,
          weight: productWeight,
          craftingTimeWeeks: productCraftingTime,
          isMadeToOrder: productMadeToOrder,
          isOneOfOne: productOneOfOne,
          isReadyToShip: productReadyToShip,
          submitForReview: productSubmitForReview,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setProductMsg({ ok: true, text: json.message });
        setShowProductForm(false);
        setProductName(''); setProductDescription(''); setProductStory('');
        setProductPrice(''); setProductInventory('1'); setProductImage('');
        setProductMaterials(''); setProductDimensions(''); setProductWeight('');
        setProductCraftingTime(''); setProductMadeToOrder(false);
        setProductOneOfOne(false); setProductReadyToShip(true); setProductSubmitForReview(false);
        loadAll();
      } else {
        setProductMsg({ ok: false, text: json.message || json.error || 'Failed to add product' });
      }
    } finally {
      setAddingProduct(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/maker/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus, trackingNumber, carrier }),
      });
      if (res.ok) {
        loadAll();
        setTrackingNumber('');
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080705', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '2px solid #c9a84c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#8a7a6a', fontFamily: 'var(--font-outfit)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>Loading Command Center</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const verificationStatus: AccreditationStatus = accreditation?.verificationStatus || user?.makerProfile?.verificationStatus || 'GENERAL';
  const isVerified = ['GUILD_VERIFIED', 'ROYAL_CHARTER'].includes(verificationStatus);
  const isRoyalCharter = verificationStatus === 'ROYAL_CHARTER';

  // ── Route to correct view ──────────────────────────────────────────────────
  if (!accreditation?.isEmailVerified && !user?.isEmailVerified) {
    return <EmailNotVerifiedView email={user?.email} />;
  }

  if (!isVerified && verificationStatus !== 'REVISION_REQUIRED') {
    if (['PENDING_AUDIT', 'UNDER_REVIEW'].includes(verificationStatus)) {
      return <ApplicationPendingView accreditation={accreditation} />;
    }
    if (verificationStatus === 'REJECTED') {
      return <ApplicationRejectedView accreditation={accreditation} />;
    }
    // GENERAL or INCOMPLETE — show wizard
    return (
      <AccreditationWizardView
        wizardStep={wizardStep}
        setWizardStep={setWizardStep}
        savingStep={savingStep}
        submitting={submitting}
        wizardMsg={wizardMsg}
        saveWizardStep={saveWizardStep}
        submitApplication={submitApplication}
        accreditation={accreditation}
        // Step 1
        craftCategory={craftCategory} setCraftCategory={setCraftCategory}
        businessName={businessName} setBusinessName={setBusinessName}
        founderName={founderName} setFounderName={setFounderName}
        yearsInBusiness={yearsInBusiness} setYearsInBusiness={setYearsInBusiness}
        employeeCount={employeeCount} setEmployeeCount={setEmployeeCount}
        country={country} setCountry={setCountry}
        // Step 2
        heritageOriginStory={heritageOriginStory} setHeritageOriginStory={setHeritageOriginStory}
        founderBiography={founderBiography} setFounderBiography={setFounderBiography}
        craftTools={craftTools} setCraftTools={setCraftTools}
        craftTechniques={craftTechniques} setCraftTechniques={setCraftTechniques}
        craftPhilosophy={craftPhilosophy} setCraftPhilosophy={setCraftPhilosophy}
        // Step 3
        coverImageUrl={coverImageUrl} setCoverImageUrl={setCoverImageUrl}
        founderPhotoUrl={founderPhotoUrl} setFounderPhotoUrl={setFounderPhotoUrl}
        workshopPhoto1={workshopPhoto1} setWorkshopPhoto1={setWorkshopPhoto1}
        workshopPhoto2={workshopPhoto2} setWorkshopPhoto2={setWorkshopPhoto2}
        workshopPhoto3={workshopPhoto3} setWorkshopPhoto3={setWorkshopPhoto3}
        // Step 4
        payoutMethod={payoutMethod} setPayoutMethod={setPayoutMethod}
        payoutAccountDetails={payoutAccountDetails} setPayoutAccountDetails={setPayoutAccountDetails}
      />
    );
  }

  if (verificationStatus === 'REVISION_REQUIRED') {
    return (
      <RevisionRequiredView
        accreditation={accreditation}
        onEdit={() => setWizardStep(1)}
        wizardStep={wizardStep}
        setWizardStep={setWizardStep}
        savingStep={savingStep}
        submitting={submitting}
        wizardMsg={wizardMsg}
        saveWizardStep={saveWizardStep}
        submitApplication={submitApplication}
        craftCategory={craftCategory} setCraftCategory={setCraftCategory}
        businessName={businessName} setBusinessName={setBusinessName}
        founderName={founderName} setFounderName={setFounderName}
        yearsInBusiness={yearsInBusiness} setYearsInBusiness={setYearsInBusiness}
        employeeCount={employeeCount} setEmployeeCount={setEmployeeCount}
        country={country} setCountry={setCountry}
        heritageOriginStory={heritageOriginStory} setHeritageOriginStory={setHeritageOriginStory}
        founderBiography={founderBiography} setFounderBiography={setFounderBiography}
        craftTools={craftTools} setCraftTools={setCraftTools}
        craftTechniques={craftTechniques} setCraftTechniques={setCraftTechniques}
        craftPhilosophy={craftPhilosophy} setCraftPhilosophy={setCraftPhilosophy}
        coverImageUrl={coverImageUrl} setCoverImageUrl={setCoverImageUrl}
        founderPhotoUrl={founderPhotoUrl} setFounderPhotoUrl={setFounderPhotoUrl}
        workshopPhoto1={workshopPhoto1} setWorkshopPhoto1={setWorkshopPhoto1}
        workshopPhoto2={workshopPhoto2} setWorkshopPhoto2={setWorkshopPhoto2}
        workshopPhoto3={workshopPhoto3} setWorkshopPhoto3={setWorkshopPhoto3}
        payoutMethod={payoutMethod} setPayoutMethod={setPayoutMethod}
        payoutAccountDetails={payoutAccountDetails} setPayoutAccountDetails={setPayoutAccountDetails}
      />
    );
  }

  // ── Full Maker Command Center ──────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080705', color: '#f5f0e8' }}>
      {/* Sidebar */}
      <MakerSidebar
        active={activeSection}
        onNavigate={setActiveSection}
        isRoyalCharter={isRoyalCharter}
        verificationStatus={verificationStatus}
        stats={stats}
        businessName={accreditation?.businessName || maker?.businessName || 'Your Studio'}
      />

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', minWidth: 0 }}>
        {activeSection === 'overview' && (
          <OverviewSection
            accreditation={accreditation}
            stats={stats}
            isRoyalCharter={isRoyalCharter}
            verificationStatus={verificationStatus}
            fmt={fmt}
            onNavigate={setActiveSection}
          />
        )}
        {activeSection === 'collection' && (
          <CollectionSection
            products={products}
            stats={stats}
            showProductForm={showProductForm}
            setShowProductForm={setShowProductForm}
            productMsg={productMsg}
            addingProduct={addingProduct}
            addProduct={addProduct}
            productName={productName} setProductName={setProductName}
            productDescription={productDescription} setProductDescription={setProductDescription}
            productStory={productStory} setProductStory={setProductStory}
            productPrice={productPrice} setProductPrice={setProductPrice}
            productInventory={productInventory} setProductInventory={setProductInventory}
            productImage={productImage} setProductImage={setProductImage}
            productMaterials={productMaterials} setProductMaterials={setProductMaterials}
            productDimensions={productDimensions} setProductDimensions={setProductDimensions}
            productWeight={productWeight} setProductWeight={setProductWeight}
            productCraftingTime={productCraftingTime} setProductCraftingTime={setProductCraftingTime}
            productMadeToOrder={productMadeToOrder} setProductMadeToOrder={setProductMadeToOrder}
            productOneOfOne={productOneOfOne} setProductOneOfOne={setProductOneOfOne}
            productReadyToShip={productReadyToShip} setProductReadyToShip={setProductReadyToShip}
            productSubmitForReview={productSubmitForReview} setProductSubmitForReview={setProductSubmitForReview}
            fmt={fmt}
          />
        )}
        {activeSection === 'orders' && (
          <OrdersSection
            orders={orders}
            updatingOrderId={updatingOrderId}
            trackingNumber={trackingNumber}
            setTrackingNumber={setTrackingNumber}
            carrier={carrier}
            setCarrier={setCarrier}
            updateOrderStatus={updateOrderStatus}
            fmt={fmt}
          />
        )}
        {activeSection === 'earnings' && (
          <EarningsSection stats={stats} fmt={fmt} />
        )}
        {activeSection === 'provenance' && (
          <ProvenanceSection stats={stats} products={products} />
        )}
        {activeSection === 'audit-history' && (
          <AuditHistorySection accreditation={accreditation} />
        )}
        {activeSection === 'studio-profile' && (
          <StudioProfileSection
            accreditation={accreditation}
            isRoyalCharter={isRoyalCharter}
            loadAll={loadAll}
            businessName={businessName} setBusinessName={setBusinessName}
            founderName={founderName} setFounderName={setFounderName}
            craftCategory={craftCategory} setCraftCategory={setCraftCategory}
            yearsInBusiness={yearsInBusiness} setYearsInBusiness={setYearsInBusiness}
            employeeCount={employeeCount} setEmployeeCount={setEmployeeCount}
            heritageOriginStory={heritageOriginStory} setHeritageOriginStory={setHeritageOriginStory}
            founderBiography={founderBiography} setFounderBiography={setFounderBiography}
            craftTools={craftTools} setCraftTools={setCraftTools}
            craftTechniques={craftTechniques} setCraftTechniques={setCraftTechniques}
            craftPhilosophy={craftPhilosophy} setCraftPhilosophy={setCraftPhilosophy}
            coverImageUrl={coverImageUrl} setCoverImageUrl={setCoverImageUrl}
            founderPhotoUrl={founderPhotoUrl} setFounderPhotoUrl={setFounderPhotoUrl}
            workshopPhoto1={workshopPhoto1} setWorkshopPhoto1={setWorkshopPhoto1}
            workshopPhoto2={workshopPhoto2} setWorkshopPhoto2={setWorkshopPhoto2}
            workshopPhoto3={workshopPhoto3} setWorkshopPhoto3={setWorkshopPhoto3}
            payoutMethod={payoutMethod} setPayoutMethod={setPayoutMethod}
            payoutAccountDetails={payoutAccountDetails} setPayoutAccountDetails={setPayoutAccountDetails}
          />
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════════════════════════
function MakerSidebar({ active, onNavigate, isRoyalCharter, verificationStatus, stats, businessName }: any) {
  const item = (id: string, label: string, icon: string) => (
    <button
      key={id}
      onClick={() => onNavigate(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 16px', borderRadius: 6, cursor: 'pointer',
        background: active === id ? 'rgba(201,168,76,0.12)' : 'transparent',
        border: active === id ? '1px solid rgba(201,168,76,0.25)' : '1px solid transparent',
        color: active === id ? '#c9a84c' : '#8a7a6a',
        fontSize: 13, fontFamily: 'var(--font-outfit)', fontWeight: active === id ? 600 : 400,
        width: '100%', textAlign: 'left', transition: 'all 0.15s',
        letterSpacing: 0.3,
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      {label}
    </button>
  );

  const section = (label: string) => (
    <p style={{
      fontSize: 10, fontFamily: 'var(--font-outfit)', letterSpacing: 2.5,
      color: '#4a4030', fontWeight: 700, textTransform: 'uppercase',
      padding: '16px 16px 6px', margin: 0
    }}>{label}</p>
  );

  return (
    <div style={{
      width: 240, minWidth: 240, height: '100vh', position: 'sticky', top: 0,
      background: '#0c0b08', borderRight: '1px solid #1e1c18',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e1c18' }}>
        <p style={{ fontSize: 10, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 6px' }}>BritSync Guild</p>
        <p style={{ fontSize: 13, color: '#f5f0e8', fontFamily: 'var(--font-playfair)', margin: '0 0 4px', fontWeight: 600 }}>
          {businessName}
        </p>
        {isRoyalCharter && (
          <span style={{ fontSize: 10, background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 4, padding: '2px 8px', fontFamily: 'var(--font-outfit)', letterSpacing: 1 }}>
            👑 ROYAL CHARTER
          </span>
        )}
        {!isRoyalCharter && (
          <span style={{ fontSize: 10, background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 4, padding: '2px 8px', fontFamily: 'var(--font-outfit)', letterSpacing: 1 }}>
            ✓ GUILD VERIFIED
          </span>
        )}
      </div>

      {/* Nav items */}
      <div style={{ padding: '8px 8px', flex: 1 }}>
        {section('Command Center')}
        {item('overview', 'Overview', '◈')}

        {section('Studio')}
        {item('studio-profile', 'Studio Profile', '🏛')}
        {item('audit-history', 'Guild Audit History', '📋')}

        {section('Collection')}
        {item('collection', `Collection (${stats?.productCount || 0}/5)`, '🏺')}

        {section('Commerce')}
        {item('orders', `Orders${stats?.activeOrderCount ? ` (${stats.activeOrderCount})` : ''}`, '📦')}

        {section('Finance')}
        {item('earnings', 'Earnings & Wallet', '💰')}

        {section('Provenance')}
        {item('provenance', 'Passports & Certificates', '📜')}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #1e1c18' }}>
        <a href="/" style={{ display: 'block', textAlign: 'center', padding: '8px 0', color: '#8a7a6a', fontSize: 12, fontFamily: 'var(--font-outfit)', textDecoration: 'none', border: '1px solid #2a2520', borderRadius: 6 }}>
          ← Public Atelier Market
        </a>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW SECTION
// ══════════════════════════════════════════════════════════════════════════════
function OverviewSection({ accreditation, stats, isRoyalCharter, verificationStatus, fmt, onNavigate }: any) {
  const kpiStyle = {
    background: '#0f0e0b',
    border: '1px solid #1e1c18',
    borderRadius: 8,
    padding: '20px 24px',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>Maker Command Center</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 400, color: '#f5f0e8', margin: 0 }}>
            {accreditation?.businessName || 'Your Studio'}
          </h1>
          <StatusBadge status={verificationStatus} />
          {isRoyalCharter && <span style={{ fontSize: 18 }}>👑</span>}
        </div>
        {accreditation?.craftCategory && (
          <p style={{ margin: '8px 0 0', color: '#8a7a6a', fontSize: 13, fontFamily: 'var(--font-outfit)' }}>
            {accreditation.craftCategory} · {accreditation.country}
          </p>
        )}
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Collection" value={`${stats?.productCount || 0} / 5`} sub="Active pieces" accent={stats?.productCount >= 5 ? '#f59e6a' : '#c9a84c'} />
        <KpiCard label="Active Orders" value={stats?.activeOrderCount || 0} sub="In progress" accent="#6ab4f5" />
        <KpiCard label="Awaiting Dispatch" value={stats?.awaitingDispatchCount || 0} sub="Ready to ship" accent="#f59e6a" />
        <KpiCard label="Provenance Passports" value={stats?.passportCount || 0} sub="Issued certificates" accent="#a78bfa" />
        <KpiCard label="Escrow Held" value={fmt(stats?.escrowHeld || 0)} sub="Awaiting release" accent="#6ab4f5" />
        <KpiCard label="Cleared Balance" value={fmt(stats?.clearedBalance || 0)} sub="Available to withdraw" accent="#4ade80" />
        <KpiCard label="This Month" value={fmt(stats?.thisMonthRevenue || 0)} sub="Revenue" accent="#c9a84c" />
        <KpiCard label="Commission Rate" value={isRoyalCharter ? '12.5%' : '15.0%'} sub={isRoyalCharter ? 'Royal Charter rate' : 'Standard rate'} accent={isRoyalCharter ? '#c9a84c' : '#8a7a6a'} />
      </div>

      {/* Quick action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ ...kpiStyle, cursor: 'pointer' }} onClick={() => onNavigate('collection')}>
          <p style={{ color: '#8a7a6a', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>Collection</p>
          <p style={{ color: '#f5f0e8', fontSize: 15, fontFamily: 'var(--font-outfit)', margin: 0 }}>Manage your {stats?.productCount || 0} handcrafted pieces →</p>
        </div>
        <div style={{ ...kpiStyle, cursor: 'pointer' }} onClick={() => onNavigate('orders')}>
          <p style={{ color: '#8a7a6a', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>Orders</p>
          <p style={{ color: '#f5f0e8', fontSize: 15, fontFamily: 'var(--font-outfit)', margin: 0 }}>
            {stats?.awaitingDispatchCount > 0 ? `${stats.awaitingDispatchCount} order(s) awaiting dispatch →` : 'No pending dispatches →'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COLLECTION SECTION
// ══════════════════════════════════════════════════════════════════════════════
function CollectionSection({
  products, stats, showProductForm, setShowProductForm, productMsg,
  addingProduct, addProduct,
  productName, setProductName, productDescription, setProductDescription,
  productStory, setProductStory, productPrice, setProductPrice,
  productInventory, setProductInventory, productImage, setProductImage,
  productMaterials, setProductMaterials, productDimensions, setProductDimensions,
  productWeight, setProductWeight, productCraftingTime, setProductCraftingTime,
  productMadeToOrder, setProductMadeToOrder, productOneOfOne, setProductOneOfOne,
  productReadyToShip, setProductReadyToShip, productSubmitForReview, setProductSubmitForReview,
  fmt
}: any) {
  const atCap = (stats?.productCount || 0) >= 5;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>Studio Collection</p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 400, color: '#f5f0e8', margin: 0 }}>Handcrafted Atelier Pieces</h2>
        </div>
        {!atCap && !showProductForm && (
          <button onClick={() => setShowProductForm(true)} style={btnGoldStyle}>+ Submit New Piece</button>
        )}
        {atCap && (
          <div style={{ background: 'rgba(245,158,106,0.1)', border: '1px solid rgba(245,158,106,0.3)', borderRadius: 8, padding: '10px 16px' }}>
            <p style={{ color: '#f59e6a', fontSize: 12, fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: 600 }}>⚠ COLLECTION CAP REACHED</p>
            <p style={{ color: '#8a7a6a', fontSize: 11, fontFamily: 'var(--font-outfit)', margin: '2px 0 0' }}>Maximum 5 pieces per studio</p>
          </div>
        )}
      </div>

      {productMsg && (
        <div style={{ background: productMsg.ok ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${productMsg.ok ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ color: productMsg.ok ? '#4ade80' : '#f87171', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>{productMsg.text}</p>
        </div>
      )}

      {/* Add Product Form */}
      {showProductForm && (
        <div style={{ background: '#0f0e0b', border: '1px solid #2a2520', borderRadius: 10, padding: 28, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, color: '#f5f0e8', margin: 0 }}>Submit Handcrafted Piece</h3>
            <button onClick={() => setShowProductForm(false)} style={{ background: 'none', border: 'none', color: '#8a7a6a', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Piece Name *" value={productName} onChange={setProductName} placeholder="e.g. Hand-thrown Terracotta Urn" />
            </div>
            <FormField label="Desired Maker Price (£) *" value={productPrice} onChange={setProductPrice} placeholder="350.00" type="number" />
            <FormField label="Stock Inventory" value={productInventory} onChange={setProductInventory} placeholder="1" type="number" />
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Primary Image URL" value={productImage} onChange={setProductImage} placeholder="https://..." />
              {productImage && <img src={productImage} alt="preview" onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6, marginTop: 8 }} />}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Short Description" value={productDescription} onChange={setProductDescription} placeholder="Brief description for catalog..." multiline />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Craftsmanship Story" value={productStory} onChange={setProductStory} placeholder="The heritage and process behind this piece..." multiline />
            </div>
            <FormField label="Materials Used" value={productMaterials} onChange={setProductMaterials} placeholder="e.g. White stoneware clay, natural mineral glazes" />
            <FormField label="Dimensions" value={productDimensions} onChange={setProductDimensions} placeholder="e.g. H: 28cm × W: 14cm" />
            <FormField label="Weight" value={productWeight} onChange={setProductWeight} placeholder="e.g. 0.85 kg" />
            <FormField label="Crafting Time (weeks)" value={productCraftingTime} onChange={setProductCraftingTime} placeholder="e.g. 3" type="number" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckboxField label="Made to Order" checked={productMadeToOrder} onChange={setProductMadeToOrder} />
              <CheckboxField label="One of One" checked={productOneOfOne} onChange={setProductOneOfOne} />
              <CheckboxField label="Ready to Ship" checked={productReadyToShip} onChange={setProductReadyToShip} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckboxField label="Submit for CEO Catalog Review" checked={productSubmitForReview} onChange={setProductSubmitForReview} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={addProduct} disabled={addingProduct} style={btnGoldStyle}>
              {addingProduct ? 'Saving…' : (productSubmitForReview ? 'Submit for Review' : 'Save as Draft')}
            </button>
            <button onClick={() => setShowProductForm(false)} style={btnGhostStyle}>Cancel</button>
          </div>
        </div>
      )}

      {/* Products list */}
      {products.length === 0 ? (
        <EmptyStateView
          title="YOUR COLLECTION IS NOT YET OPEN"
          sub={`0 / 5 active pieces`}
          description="Submit your first handcrafted piece to begin building your studio collection. Each submission is reviewed by the Guild Secretariat before going live."
          action={!showProductForm ? { label: 'Submit Your First Piece', onClick: () => setShowProductForm(true) } : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {products.map((p: any) => (
            <div key={p.id} style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, overflow: 'hidden' }}>
              {p.primaryImageUrl && (
                <img src={p.primaryImageUrl} alt={p.name} onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              )}
              {!p.primaryImageUrl && (
                <div style={{ width: '100%', height: 120, background: '#1a1810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 32, opacity: 0.3 }}>🏺</span>
                </div>
              )}
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ color: '#f5f0e8', fontSize: 14, fontFamily: 'var(--font-outfit)', fontWeight: 600, margin: 0 }}>{p.name}</p>
                  <span style={{
                    fontSize: 10, fontFamily: 'var(--font-outfit)', padding: '2px 8px', borderRadius: 4, letterSpacing: 0.5, whiteSpace: 'nowrap',
                    background: `${PRODUCT_STATUS_META[p.status]?.color}18`,
                    color: PRODUCT_STATUS_META[p.status]?.color || '#8a7a6a',
                    border: `1px solid ${PRODUCT_STATUS_META[p.status]?.color || '#8a7a6a'}40`,
                  }}>{PRODUCT_STATUS_META[p.status]?.label || p.status}</span>
                </div>
                <p style={{ color: '#c9a84c', fontSize: 16, fontFamily: 'var(--font-outfit)', fontWeight: 600, margin: '0 0 8px' }}>{fmt(p.desiredPrice)}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {p.isMadeToOrder && <Tag>Made to Order</Tag>}
                  {p.isOneOfOne && <Tag>1 of 1</Tag>}
                  {p.isReadyToShip && <Tag color="#4ade8030" text="#4ade80">Ready to Ship</Tag>}
                </div>
                <p style={{ color: '#8a7a6a', fontSize: 11, fontFamily: 'var(--font-outfit)', margin: '8px 0 0' }}>Stock: {p.inventory}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ORDERS SECTION
// ══════════════════════════════════════════════════════════════════════════════
function OrdersSection({ orders, updatingOrderId, trackingNumber, setTrackingNumber, carrier, setCarrier, updateOrderStatus, fmt }: any) {
  const nextStatus: Record<string, string | null> = {
    PENDING: 'ACCEPTED', ACCEPTED: 'PREPARING', PREPARING: 'PACKED', PACKED: 'SHIPPED', SHIPPED: 'DELIVERED', DELIVERED: null
  };

  if (orders.length === 0) {
    return (
      <div>
        <SectionHeader title="Patron Orders" sub="Orders & Fulfilment" />
        <EmptyStateView
          title="NO PATRON ORDERS YET"
          description="Your approved collection will appear in the public Atelier Market once products pass catalog review. Orders will appear here when patrons purchase your handcrafted pieces."
        />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Patron Orders" sub="Orders & Fulfilment" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {orders.map((order: any) => {
          const next = nextStatus[order.status];
          const pipelineIdx = ORDER_STATUS_PIPELINE.indexOf(order.status);
          return (
            <div key={order.id} style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ color: '#c9a84c', fontSize: 12, fontFamily: 'var(--font-outfit)', letterSpacing: 2, margin: '0 0 4px' }}>{order.orderRef}</p>
                  <p style={{ color: '#f5f0e8', fontSize: 15, fontFamily: 'var(--font-outfit)', fontWeight: 600, margin: 0 }}>{order.patronName}</p>
                  <p style={{ color: '#8a7a6a', fontSize: 12, fontFamily: 'var(--font-outfit)', margin: '2px 0 0' }}>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <OrderStatusBadge status={order.status} />
                  <p style={{ color: '#f5f0e8', fontSize: 18, fontFamily: 'var(--font-outfit)', fontWeight: 700, margin: '8px 0 0' }}>{fmt(order.grossAmount)}</p>
                </div>
              </div>

              {/* Pipeline */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                {ORDER_STATUS_PIPELINE.map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                      background: i <= pipelineIdx ? '#c9a84c' : '#1e1c18',
                      color: i <= pipelineIdx ? '#080705' : '#4a4030',
                      fontFamily: 'var(--font-outfit)', fontWeight: 700, border: i === pipelineIdx ? '2px solid #c9a84c' : '1px solid #2a2520',
                    }}>
                      {i <= pipelineIdx ? '✓' : i + 1}
                    </div>
                    <p style={{ margin: '0 0 0 4px', fontSize: 10, color: i <= pipelineIdx ? '#c9a84c' : '#4a4030', fontFamily: 'var(--font-outfit)', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                      {s.replace('_', ' ')}
                    </p>
                    {i < ORDER_STATUS_PIPELINE.length - 1 && (
                      <div style={{ width: 24, height: 1, background: i < pipelineIdx ? '#c9a84c' : '#1e1c18', margin: '0 6px' }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1a1810' }}>
                    <p style={{ color: '#c8bfa8', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>
                      {item.productName} <span style={{ color: '#4a4030' }}>× {item.quantity}</span>
                    </p>
                    <p style={{ color: '#f5f0e8', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>
                      {fmt(item.sellingPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Financial breakdown */}
              <div style={{ background: '#0a0908', borderRadius: 6, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#8a7a6a', fontSize: 12, fontFamily: 'var(--font-outfit)' }}>Platform Commission ({order.commissionRate}%)</span>
                  <span style={{ color: '#f87171', fontSize: 12, fontFamily: 'var(--font-outfit)' }}>−{fmt(order.commissionAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#c8bfa8', fontSize: 13, fontFamily: 'var(--font-outfit)', fontWeight: 600 }}>Your Net Amount</span>
                  <span style={{ color: '#4ade80', fontSize: 13, fontFamily: 'var(--font-outfit)', fontWeight: 700 }}>{fmt(order.makerNet)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ color: '#8a7a6a', fontSize: 11, fontFamily: 'var(--font-outfit)' }}>Escrow Status</span>
                  <span style={{ color: order.escrowStatus === 'CLEARED' ? '#4ade80' : '#6ab4f5', fontSize: 11, fontFamily: 'var(--font-outfit)' }}>
                    {order.escrowStatus}
                  </span>
                </div>
              </div>

              {/* Dispatch action */}
              {next && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {next === 'SHIPPED' && (
                    <>
                      <input
                        type="text" placeholder="Tracking number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                        style={{ ...inputStyle, flex: 1, minWidth: 140 }}
                      />
                      <select value={carrier} onChange={e => setCarrier(e.target.value)} style={{ ...inputStyle, width: 160 }}>
                        <option value="DHL_EXPRESS">DHL Express</option>
                        <option value="FEDEX">FedEx</option>
                        <option value="ROYAL_MAIL">Royal Mail</option>
                        <option value="UPS">UPS</option>
                        <option value="COURIER">Courier</option>
                      </select>
                    </>
                  )}
                  <button
                    onClick={() => updateOrderStatus(order.id, next)}
                    disabled={updatingOrderId === order.id}
                    style={btnGoldStyle}
                  >
                    {updatingOrderId === order.id ? 'Updating…' : `Mark as ${next.replace('_', ' ')}`}
                  </button>
                </div>
              )}

              {order.trackingNumber && (
                <p style={{ color: '#8a7a6a', fontSize: 12, fontFamily: 'var(--font-outfit)', margin: '8px 0 0' }}>
                  Tracking: {order.trackingNumber} · {order.carrier}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EARNINGS SECTION
// ══════════════════════════════════════════════════════════════════════════════
function EarningsSection({ stats, fmt }: any) {
  return (
    <div>
      <SectionHeader title="Earnings & Wallet" sub="Finance" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <KpiCard label="Cleared Balance" value={fmt(stats?.clearedBalance || 0)} sub="Available to withdraw" accent="#4ade80" large />
        <KpiCard label="Escrow Held" value={fmt(stats?.escrowHeld || 0)} sub="Pending delivery release" accent="#6ab4f5" large />
        <KpiCard label="This Month" value={fmt(stats?.thisMonthRevenue || 0)} sub="Gross revenue" accent="#c9a84c" large />
      </div>
      {(stats?.clearedBalance || 0) > 0 && (
        <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24, maxWidth: 480 }}>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, color: '#f5f0e8', margin: '0 0 16px' }}>Request Payout</h3>
          <p style={{ color: '#8a7a6a', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: '0 0 16px' }}>
            Available: <span style={{ color: '#4ade80' }}>{fmt(stats?.clearedBalance || 0)}</span>
          </p>
          <button style={btnGoldStyle}>Request Payout →</button>
        </div>
      )}
      {(stats?.clearedBalance || 0) === 0 && (
        <EmptyStateView
          title="NO CLEARED BALANCE"
          description="Your earnings will appear here once orders are delivered and escrow is released. Escrow is automatically cleared upon patron delivery confirmation."
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROVENANCE SECTION
// ══════════════════════════════════════════════════════════════════════════════
function ProvenanceSection({ stats, products }: any) {
  return (
    <div>
      <SectionHeader title="Provenance Passports" sub="Provenance" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Passports Issued" value={stats?.passportCount || 0} sub="Cryptographic certificates" accent="#a78bfa" />
        <KpiCard label="Products in Collection" value={stats?.productCount || 0} sub="Eligible for passport" accent="#c9a84c" />
      </div>
      {(stats?.passportCount || 0) === 0 && (
        <EmptyStateView
          title="NO PROVENANCE PASSPORTS YET"
          description="Each product that completes an order cycle receives a cryptographic provenance passport — a permanent, scannable QR certificate linking the piece to your studio, heritage, and audit history."
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AUDIT HISTORY SECTION
// ══════════════════════════════════════════════════════════════════════════════
function AuditHistorySection({ accreditation }: any) {
  const log = accreditation?.auditLog || [];
  return (
    <div>
      <SectionHeader title="Guild Audit History" sub="Guild" />
      {log.length === 0 ? (
        <EmptyStateView title="NO AUDIT EVENTS YET" description="Audit events are recorded each time your accreditation status changes." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {log.map((entry: any, idx: number) => (
            <div key={idx} style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 8, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <StatusBadge status={entry.previousStatus} small />
                  <span style={{ color: '#4a4030', fontSize: 12 }}>→</span>
                  <StatusBadge status={entry.newStatus} small />
                </div>
                {entry.reason && <p style={{ color: '#8a7a6a', fontSize: 12, fontFamily: 'var(--font-outfit)', margin: 0, fontStyle: 'italic' }}>"{entry.reason}"</p>}
              </div>
              <p style={{ color: '#4a4030', fontSize: 11, fontFamily: 'var(--font-outfit)', margin: 0 }}>
                {new Date(entry.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudioProfileSection({
  accreditation, isRoyalCharter, loadAll,
  businessName, setBusinessName, founderName, setFounderName,
  craftCategory, setCraftCategory, yearsInBusiness, setYearsInBusiness,
  employeeCount, setEmployeeCount, heritageOriginStory, setHeritageOriginStory,
  founderBiography, setFounderBiography, craftTools, setCraftTools,
  craftTechniques, setCraftTechniques, craftPhilosophy, setCraftPhilosophy,
  coverImageUrl, setCoverImageUrl, founderPhotoUrl, setFounderPhotoUrl,
  workshopPhoto1, setWorkshopPhoto1, workshopPhoto2, setWorkshopPhoto2,
  workshopPhoto3, setWorkshopPhoto3, payoutMethod, setPayoutMethod,
  payoutAccountDetails, setPayoutAccountDetails
}: any) {
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/maker/accreditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          data: {
            businessName, founderName, craftCategory, yearsInBusiness, employeeCount,
            heritageOriginStory, founderBiography, craftTools, craftTechniques, craftPhilosophy,
            coverImageUrl, founderPhotoUrl, workshopPhoto1, workshopPhoto2, workshopPhoto3,
            payoutMethod, payoutAccountDetails
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg({ ok: true, text: 'Studio profile saved successfully!' });
        loadAll();
      } else {
        setSaveMsg({ ok: false, text: data.error || 'Failed to save studio profile' });
      }
    } catch (err) {
      setSaveMsg({ ok: false, text: 'Connection failed' });
    } finally {
      setSaving(false);
    }
  };

  if (!accreditation) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <SectionHeader title="Studio Profile & Heritage" sub="Studio Management" />
        </div>
        <button onClick={handleSaveProfile} disabled={saving} style={btnGoldStyle}>
          {saving ? 'Saving...' : 'Save Studio Profile Updates →'}
        </button>
      </div>

      {saveMsg && (
        <div style={{ background: saveMsg.ok ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${saveMsg.ok ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ color: saveMsg.ok ? '#4ade80' : '#f87171', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>{saveMsg.text}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Studio Identity Box */}
        <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, color: '#c9a84c', margin: 0 }}>Studio Identity</h3>
          <FormField label="Studio / Atelier Name" value={businessName} onChange={setBusinessName} />
          <FormField label="Master Founder Name" value={founderName} onChange={setFounderName} />
          <div>
            <label style={{ fontSize: 11, color: '#8a7a6a', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', display: 'block', marginBottom: 6 }}>Guild Category</label>
            <select value={craftCategory} onChange={e => setCraftCategory(e.target.value)} style={inputStyle}>
              {GUILD_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Years Active" value={yearsInBusiness} onChange={setYearsInBusiness} type="number" />
            <FormField label="Craftsmen Count" value={employeeCount} onChange={setEmployeeCount} type="number" />
          </div>
        </div>

        {/* Heritage & Craftsmanship Box */}
        <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, color: '#c9a84c', margin: 0 }}>Heritage & Craftsmanship</h3>
          <FormField label="Heritage Origin Story" value={heritageOriginStory} onChange={setHeritageOriginStory} multiline />
          <FormField label="Master Founder Biography" value={founderBiography} onChange={setFounderBiography} multiline />
          <FormField label="Traditional Tools Used" value={craftTools} onChange={setCraftTools} />
          <FormField label="Craft Techniques" value={craftTechniques} onChange={setCraftTechniques} />
          <FormField label="Craft Philosophy" value={craftPhilosophy} onChange={setCraftPhilosophy} multiline />
        </div>

        {/* Workshop Gallery & Imagery Box */}
        <div style={{ gridColumn: '1 / -1', background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, color: '#c9a84c', margin: 0 }}>Workshop Media & Gallery</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Cover Banner Image URL" value={coverImageUrl} onChange={setCoverImageUrl} />
            <FormField label="Founder Portrait URL" value={founderPhotoUrl} onChange={setFounderPhotoUrl} />
            <FormField label="Workshop Process Image 1" value={workshopPhoto1} onChange={setWorkshopPhoto1} />
            <FormField label="Workshop Process Image 2" value={workshopPhoto2} onChange={setWorkshopPhoto2} />
          </div>
          {coverImageUrl && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 11, color: '#8a7a6a', margin: '0 0 8px' }}>Cover Preview:</p>
              <img src={coverImageUrl} alt="Cover Preview" onError={e => (e.target as any).style.display = 'none'} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #1e1c18' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GATE VIEWS
// ══════════════════════════════════════════════════════════════════════════════
function EmailNotVerifiedView({ email }: any) {
  return (
    <div style={{ minHeight: '100vh', background: '#080705', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', background: '#0c0b08', border: '1px solid #2a2520', borderRadius: 12, padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 20 }}>✉️</div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, color: '#f5f0e8', margin: '0 0 12px' }}>Verify Your Email</h2>
        <p style={{ color: '#8a7a6a', fontSize: 14, fontFamily: 'var(--font-outfit)', margin: '0 0 24px', lineHeight: 1.6 }}>
          A 6-digit verification code was sent to <strong style={{ color: '#c9a84c' }}>{email}</strong>. Please check your inbox and enter the code to activate your account.
        </p>
        <a href="/login" style={{ ...btnGoldStyle, display: 'inline-block', textDecoration: 'none' }}>Return to Login</a>
      </div>
    </div>
  );
}

function ApplicationPendingView({ accreditation }: any) {
  return (
    <div style={{ minHeight: '100vh', background: '#080705', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        <div style={{ background: '#0c0b08', border: '1px solid #2a2520', borderRadius: 12, padding: 48, textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>📋</div>
          <StatusBadge status={accreditation?.verificationStatus || 'PENDING_AUDIT'} />
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, color: '#f5f0e8', margin: '16px 0 12px' }}>Application Submitted</h2>
          <p style={{ color: '#8a7a6a', fontSize: 14, fontFamily: 'var(--font-outfit)', margin: '0 0 8px', lineHeight: 1.6 }}>
            Your studio accreditation application has been submitted to the BritSync Guild Secretariat for review.
          </p>
          <p style={{ color: '#4a4030', fontSize: 12, fontFamily: 'var(--font-outfit)', margin: 0 }}>
            Applications are typically reviewed within 3–5 business days.
          </p>
        </div>

        {/* Submitted data summary */}
        <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: 13, color: '#c9a84c', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 16px' }}>Submitted Application</h3>
          <InfoRow label="Studio" value={accreditation?.businessName} />
          <InfoRow label="Category" value={accreditation?.craftCategory} />
          <InfoRow label="Submitted" value={accreditation?.submittedAt ? new Date(accreditation.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently'} />
        </div>
      </div>
    </div>
  );
}

function ApplicationRejectedView({ accreditation }: any) {
  return (
    <div style={{ minHeight: '100vh', background: '#080705', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', background: '#0c0b08', border: '1px solid #2a2520', borderRadius: 12, padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 20 }}>❌</div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, color: '#f5f0e8', margin: '0 0 12px' }}>Application Not Approved</h2>
        <p style={{ color: '#8a7a6a', fontSize: 14, fontFamily: 'var(--font-outfit)', margin: '0 0 16px', lineHeight: 1.6 }}>
          We were unable to approve your studio accreditation at this time.
        </p>
        {accreditation?.revisionNote && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '16px 20px', textAlign: 'left', marginBottom: 24 }}>
            <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>{accreditation.revisionNote}</p>
          </div>
        )}
        <a href="mailto:britsyncuk@gmail.com" style={{ ...btnGoldStyle, display: 'inline-block', textDecoration: 'none' }}>Contact Guild Secretariat</a>
      </div>
    </div>
  );
}

function RevisionRequiredView({ accreditation, wizardStep, setWizardStep, savingStep, submitting, wizardMsg, saveWizardStep, submitApplication, ...props }: any) {
  return (
    <div style={{ minHeight: '100vh', background: '#080705' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ background: 'rgba(245,158,106,0.08)', border: '1px solid rgba(245,158,106,0.3)', borderRadius: 10, padding: '20px 24px', marginBottom: 32, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 24 }}>📝</span>
          <div>
            <p style={{ color: '#f59e6a', fontSize: 13, fontFamily: 'var(--font-outfit)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 6px' }}>Revision Required</p>
            <p style={{ color: '#c8bfa8', fontSize: 14, fontFamily: 'var(--font-outfit)', margin: 0, lineHeight: 1.6 }}>
              {accreditation?.revisionNote || 'The Guild Secretariat requires additional information. Please review and update your application.'}
            </p>
          </div>
        </div>
        <AccreditationWizardView
          wizardStep={wizardStep}
          setWizardStep={setWizardStep}
          savingStep={savingStep}
          submitting={submitting}
          wizardMsg={wizardMsg}
          saveWizardStep={saveWizardStep}
          submitApplication={submitApplication}
          accreditation={accreditation}
          isRevision
          {...props}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ACCREDITATION WIZARD
// ══════════════════════════════════════════════════════════════════════════════
function AccreditationWizardView({
  wizardStep, setWizardStep, savingStep, submitting, wizardMsg, saveWizardStep, submitApplication,
  accreditation, isRevision,
  craftCategory, setCraftCategory,
  businessName, setBusinessName,
  founderName, setFounderName,
  yearsInBusiness, setYearsInBusiness,
  employeeCount, setEmployeeCount,
  country, setCountry,
  heritageOriginStory, setHeritageOriginStory,
  founderBiography, setFounderBiography,
  craftTools, setCraftTools,
  craftTechniques, setCraftTechniques,
  craftPhilosophy, setCraftPhilosophy,
  coverImageUrl, setCoverImageUrl,
  founderPhotoUrl, setFounderPhotoUrl,
  workshopPhoto1, setWorkshopPhoto1,
  workshopPhoto2, setWorkshopPhoto2,
  workshopPhoto3, setWorkshopPhoto3,
  payoutMethod, setPayoutMethod,
  payoutAccountDetails, setPayoutAccountDetails,
}: any) {
  const completionPct = Math.min(100, Math.round(((accreditation?.accreditationStep || 0) / 4) * 100));

  return (
    <div style={{ minHeight: isRevision ? 'auto' : '100vh', background: isRevision ? 'transparent' : '#080705', display: 'flex', alignItems: isRevision ? 'flex-start' : 'center', justifyContent: 'center', padding: isRevision ? 0 : '40px 24px' }}>
      <div style={{ maxWidth: 760, width: '100%' }}>
        {!isRevision && (
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 10, color: '#4a4030', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 12px' }}>BritSync Guild Secretariat</p>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 30, color: '#f5f0e8', fontWeight: 400, margin: '0 0 8px' }}>Studio Accreditation</h1>
            <p style={{ color: '#8a7a6a', fontSize: 14, fontFamily: 'var(--font-outfit)', margin: 0 }}>Complete your application to join the Guild</p>
          </div>
        )}

        {/* Progress bar */}
        <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            {['Guild & Studio Identity', 'Heritage & Craftsmanship', 'Studio Media', 'Payout Setup'].map((label, i) => (
              <button
                key={i}
                onClick={() => setWizardStep(i + 1)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer',
                  background: 'none', border: 'none', padding: 0,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: (accreditation?.accreditationStep || 0) > i ? '#c9a84c' : (wizardStep === i + 1 ? 'rgba(201,168,76,0.2)' : '#1a1810'),
                  color: (accreditation?.accreditationStep || 0) > i ? '#080705' : (wizardStep === i + 1 ? '#c9a84c' : '#4a4030'),
                  border: wizardStep === i + 1 ? '2px solid #c9a84c' : '1px solid #2a2520',
                  fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 13,
                }}>
                  {(accreditation?.accreditationStep || 0) > i ? '✓' : i + 1}
                </div>
                <p style={{ color: wizardStep === i + 1 ? '#c9a84c' : '#4a4030', fontSize: 10, fontFamily: 'var(--font-outfit)', margin: 0, letterSpacing: 0.5, textAlign: 'center' }}>
                  {label}
                </p>
              </button>
            ))}
          </div>
          <div style={{ background: '#1a1810', borderRadius: 99, height: 4, overflow: 'hidden' }}>
            <div style={{ background: '#c9a84c', width: `${completionPct}%`, height: '100%', borderRadius: 99, transition: 'width 0.4s' }} />
          </div>
          <p style={{ color: '#4a4030', fontSize: 11, fontFamily: 'var(--font-outfit)', margin: '8px 0 0', textAlign: 'right' }}>{completionPct}% complete</p>
        </div>

        {/* Step content */}
        <div style={{ background: '#0c0b08', border: '1px solid #2a2520', borderRadius: 10, padding: '32px 36px' }}>
          {wizardMsg && (
            <div style={{ background: wizardMsg.ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${wizardMsg.ok ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
              <p style={{ color: wizardMsg.ok ? '#4ade80' : '#f87171', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0, whiteSpace: 'pre-line' }}>{wizardMsg.text}</p>
            </div>
          )}

          {wizardStep === 1 && (
            <div>
              <WizardStepHeader step={1} title="Guild Category & Studio Identity" sub="Tell us about your craft studio and the artisan behind it." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Guild Craft Specialty *</label>
                  <select value={craftCategory} onChange={e => setCraftCategory(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
                    {GUILD_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <FormField label="Studio / Atelier Name *" value={businessName} onChange={setBusinessName} placeholder="e.g. Al-Rashid Ceramics" />
                <FormField label="Founder / Master Artisan Name *" value={founderName} onChange={setFounderName} placeholder="Your full name" />
                <FormField label="Years Active in Craft *" value={yearsInBusiness} onChange={setYearsInBusiness} placeholder="e.g. 15" type="number" />
                <FormField label="Number of Craftsmen *" value={employeeCount} onChange={setEmployeeCount} placeholder="e.g. 4" type="number" />
                <div style={{ gridColumn: '1 / -1' }}>
                  <FormField label="City & Country" value={country} onChange={setCountry} placeholder="e.g. Lahore, Pakistan" />
                </div>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div>
              <WizardStepHeader step={2} title="Heritage Story & Traditional Craftsmanship" sub="This is your institutional archive — speak about your craft with its full weight and history." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FormField label="Generation / Heritage Origin Story *" value={heritageOriginStory} onChange={setHeritageOriginStory} placeholder="How did your craft tradition begin? Which generation carries it today? Where does its heritage originate?" multiline rows={5} />
                <FormField label="Master Founder Biography *" value={founderBiography} onChange={setFounderBiography} placeholder="Who is the master artisan? Their training, lineage, and journey..." multiline rows={4} />
                <FormField label="Traditional Tools Used" value={craftTools} onChange={setCraftTools} placeholder="e.g. Hand-thrown kick wheel, wood-firing kiln, mineral oxide pigments, hand-drawn scribing tools..." multiline rows={3} />
                <FormField label="Traditional Techniques" value={craftTechniques} onChange={setCraftTechniques} placeholder="e.g. Raku firing, resist-wax batik, hand-beaten copper raising, vegetable-tanned saddle stitching..." multiline rows={3} />
                <FormField label="Craft Philosophy" value={craftPhilosophy} onChange={setCraftPhilosophy} placeholder="What is the philosophy that guides your studio's work and values?" multiline rows={3} />
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div>
              <WizardStepHeader step={3} title="Studio & Workshop Media" sub="Visual evidence of your craft environment and practice." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FormField label="Workshop Cover Banner URL *" value={coverImageUrl} onChange={setCoverImageUrl} placeholder="https://..." />
                  {coverImageUrl && <img src={coverImageUrl} alt="Cover" onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '1px solid #2a2520' }} />}
                </div>
                <div>
                  <FormField label="Founder Portrait URL *" value={founderPhotoUrl} onChange={setFounderPhotoUrl} placeholder="https://..." />
                  {founderPhotoUrl && <img src={founderPhotoUrl} alt="Founder" onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '1px solid #2a2520' }} />}
                </div>
                <div>
                  <FormField label="Workshop Process Photo 1" value={workshopPhoto1} onChange={setWorkshopPhoto1} placeholder="https://..." />
                  {workshopPhoto1 && <img src={workshopPhoto1} alt="Workshop 1" onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '1px solid #2a2520' }} />}
                </div>
                <div>
                  <FormField label="Workshop Process Photo 2" value={workshopPhoto2} onChange={setWorkshopPhoto2} placeholder="https://..." />
                  {workshopPhoto2 && <img src={workshopPhoto2} alt="Workshop 2" onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '1px solid #2a2520' }} />}
                </div>
                <div>
                  <FormField label="Workshop Process Photo 3" value={workshopPhoto3} onChange={setWorkshopPhoto3} placeholder="https://..." />
                  {workshopPhoto3 && <img src={workshopPhoto3} alt="Workshop 3" onError={(e) => { (e.target as any).style.display = 'none'; }} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '1px solid #2a2520' }} />}
                </div>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div>
              <WizardStepHeader step={4} title="Payout & Financial Information" sub="Your earnings settlement details. This information is kept confidential and only accessed by authorized Secretariat administrators." />
              <div style={{ background: 'rgba(106,180,245,0.08)', border: '1px solid rgba(106,180,245,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
                <p style={{ color: '#6ab4f5', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>🔒 Payout information is encrypted and only visible to authorized financial administrators. It is never displayed publicly.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Preferred Payout Method *</label>
                  <select value={payoutMethod} onChange={e => setPayoutMethod(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
                    {PAYOUT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <FormField
                  label="Account Details (IBAN / Account Number) *"
                  value={payoutAccountDetails}
                  onChange={setPayoutAccountDetails}
                  placeholder={payoutMethod === 'Stripe Connect' ? 'Your Stripe Connect account ID or email' : payoutMethod === 'Wise' ? 'Your Wise email or account ID' : 'IBAN or account number / sort code'}
                  multiline rows={3}
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
            <button
              onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
              disabled={wizardStep === 1}
              style={{ ...btnGhostStyle, opacity: wizardStep === 1 ? 0.3 : 1 }}
            >← Back</button>

            <div style={{ display: 'flex', gap: 12 }}>
              {wizardStep < 4 && (
                <button onClick={() => saveWizardStep(wizardStep)} disabled={savingStep} style={btnGoldStyle}>
                  {savingStep ? 'Saving…' : 'Save & Continue →'}
                </button>
              )}
              {wizardStep === 4 && (
                <>
                  <button onClick={() => saveWizardStep(4)} disabled={savingStep} style={btnGhostStyle}>
                    {savingStep ? 'Saving…' : 'Save Progress'}
                  </button>
                  <button onClick={submitApplication} disabled={submitting} style={btnGoldFilledStyle}>
                    {submitting ? 'Submitting…' : 'Submit for Guild Audit →'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED SMALL COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
function KpiCard({ label, value, sub, accent = '#c9a84c', large }: any) {
  return (
    <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 8, padding: large ? '24px 28px' : '18px 20px' }}>
      <p style={{ fontSize: 10, color: '#4a4030', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: large ? 28 : 22, fontFamily: 'var(--font-outfit)', fontWeight: 700, color: accent, margin: '0 0 4px' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#4a4030', fontFamily: 'var(--font-outfit)', margin: 0 }}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ status, small }: any) {
  const meta = STATUS_META[status as AccreditationStatus] || { label: status, color: '#8a7a6a', bg: '#1a1810' };
  return (
    <span style={{
      fontSize: small ? 10 : 11, fontFamily: 'var(--font-outfit)', fontWeight: 600, letterSpacing: 1, padding: small ? '2px 6px' : '3px 10px',
      borderRadius: 4, background: meta.bg, color: meta.color, border: `1px solid ${meta.color}40`, textTransform: 'uppercase' as const,
    }}>{meta.label}</span>
  );
}

function OrderStatusBadge({ status }: any) {
  const colors: Record<string, string> = {
    PENDING: '#8a7a6a', ACCEPTED: '#6ab4f5', PREPARING: '#a78bfa',
    PACKED: '#f59e6a', SHIPPED: '#c9a84c', DELIVERED: '#4ade80'
  };
  return (
    <span style={{ fontSize: 11, fontFamily: 'var(--font-outfit)', fontWeight: 600, padding: '3px 10px', borderRadius: 4, background: `${colors[status] || '#8a7a6a'}18`, color: colors[status] || '#8a7a6a', border: `1px solid ${colors[status] || '#8a7a6a'}40`, letterSpacing: 0.5 }}>
      {status.replace('_', ' ')}
    </span>
  );
}

function Tag({ children, color = '#1a1810', text = '#8a7a6a' }: any) {
  return <span style={{ fontSize: 10, fontFamily: 'var(--font-outfit)', padding: '2px 6px', borderRadius: 4, background: color, color: text, border: '1px solid #2a2520' }}>{children}</span>;
}

function EmptyStateView({ title, sub, description, action }: any) {
  return (
    <div style={{ background: '#0f0e0b', border: '1px solid #1e1c18', borderRadius: 10, padding: '56px 40px', textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: '#3a3020', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', fontWeight: 700, margin: '0 0 8px' }}>{title}</p>
      {sub && <p style={{ color: '#c9a84c', fontSize: 18, fontFamily: 'var(--font-outfit)', margin: '0 0 12px' }}>{sub}</p>}
      {description && <p style={{ color: '#4a4030', fontSize: 13, fontFamily: 'var(--font-outfit)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>{description}</p>}
      {action && <button onClick={action.onClick} style={{ ...btnGoldStyle, marginTop: 24 }}>{action.label}</button>}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = 'text', multiline, rows = 3 }: any) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          style={{ ...inputStyle, width: '100%', resize: 'vertical' as const }}
        />
      ) : (
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ ...inputStyle, width: '100%' }}
        />
      )}
    </div>
  );
}

function CheckboxField({ label, checked, onChange }: any) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#8a7a6a', fontSize: 13, fontFamily: 'var(--font-outfit)' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: '#c9a84c' }} />
      {label}
    </label>
  );
}

function InfoRow({ label, value, multiline }: any) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: multiline ? 'flex-start' : 'center' }}>
      <p style={{ color: '#4a4030', fontSize: 12, fontFamily: 'var(--font-outfit)', width: 120, flexShrink: 0, margin: 0 }}>{label}</p>
      <p style={{ color: '#c8bfa8', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0, lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

function SectionHeader({ title, sub }: any) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 11, color: '#4a4030', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 6px' }}>{sub}</p>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 400, color: '#f5f0e8', margin: 0 }}>{title}</h2>
    </div>
  );
}

function WizardStepHeader({ step, title, sub }: any) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 10, color: '#c9a84c', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', margin: '0 0 8px' }}>Step {step} of 4</p>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 400, color: '#f5f0e8', margin: '0 0 6px' }}>{title}</h2>
      <p style={{ color: '#8a7a6a', fontSize: 13, fontFamily: 'var(--font-outfit)', margin: 0 }}>{sub}</p>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: '#0a0908',
  border: '1px solid #2a2520',
  borderRadius: 6,
  padding: '10px 14px',
  color: '#f5f0e8',
  fontSize: 14,
  fontFamily: 'var(--font-outfit)',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#8a7a6a',
  fontFamily: 'var(--font-outfit)',
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: 8,
};

const btnGoldStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #c9a84c',
  color: '#c9a84c',
  padding: '10px 22px',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'var(--font-outfit)',
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: 0.5,
  transition: 'all 0.15s',
};

const btnGoldFilledStyle: React.CSSProperties = {
  background: '#c9a84c',
  border: '1px solid #c9a84c',
  color: '#080705',
  padding: '10px 22px',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'var(--font-outfit)',
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: 0.5,
  transition: 'all 0.15s',
};

const btnGhostStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #2a2520',
  color: '#8a7a6a',
  padding: '10px 22px',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'var(--font-outfit)',
  cursor: 'pointer',
};

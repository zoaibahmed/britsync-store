'use client';
import { useState, useEffect } from 'react';

export default function InspectorDashboard() {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [assignments, setAssignments] = useState([
    { id: 'INS-084', makerId: '1', maker: 'Aisha Heritage Textiles', location: 'Sindh, Pakistan', lat: 25.9254, lng: 68.3184, date: 'Oct 15, 2025', time: '10:00 AM', status: 'Pending Visit', tier: 'GI', duration: '2 hours 15 mins' },
    { id: 'INS-085', makerId: '2', maker: 'Lahore Ceramics', location: 'Lahore, Pakistan', lat: 31.5204, lng: 74.3587, date: 'Oct 18, 2025', time: '02:30 PM', status: 'Report Drafted', tier: 'Elite', duration: '1 hour 45 mins' },
    { id: 'INS-086', makerId: '3', maker: 'Bursa Ceramics', location: 'Iznik, Turkey', lat: 40.4300, lng: 29.7180, date: 'Oct 20, 2025', time: '11:00 AM', status: 'Pending Visit', tier: 'GI', duration: '3 hours' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Admin assigned INS-086 (Bursa Ceramics) to your queue.', date: 'Today' },
    { id: 2, text: 'Inspection report for INS-085 has been saved to drafts offline.', date: 'Yesterday' },
    { id: 3, text: 'Device synced with Britsync Main Server.', date: 'Oct 12' }
  ]);

  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  
  // GPS/Proximity States
  const [gpsVerifying, setGpsVerifying] = useState(false);
  const [gpsCheckedIn, setGpsCheckedIn] = useState<Record<string, boolean>>({});
  const [gpsData, setGpsData] = useState<Record<string, { lat: string, lng: string, date: string, time: string, duration: string }>>({});

  // 15 Photo Documentation Upload checklist states
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, string[]>>({});
  const photoCategories = [
    { key: 'ext', name: 'Workshop Exterior', desc: 'Min 2 photos' },
    { key: 'int', name: 'Workshop Interior', desc: 'Min 2 photos' },
    { key: 'raw', name: 'Raw Materials Vat/Sourcing', desc: 'Min 2 photos' },
    { key: 'emp', name: 'Employees & Workspaces', desc: 'Min 2 photos' },
    { key: 'proc', name: 'Craft Process Hand-loom/Kiln', desc: 'Min 3 photos' },
    { key: 'fin', name: 'Finished Products Quality', desc: 'Min 2 photos' },
    { key: 'pack', name: 'Packaging Area Check', desc: 'Min 1 photo' },
    { key: 'stor', name: 'Storage Facility', desc: 'Min 1 photo' }
  ];

  // Video URL state
  const [videoUrl, setVideoUrl] = useState('');

  // Audit Form States
  const [laborSafe, setLaborSafe] = useState(false);
  const [laborWages, setLaborWages] = useState(false);
  const [laborAge, setLaborAge] = useState(false);
  const [materialOrganic, setMaterialOrganic] = useState(false);
  const [materialOriginal, setMaterialOriginal] = useState(false);
  const [qualityScore, setQualityScore] = useState(90);
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState('GI');

  const handleGpsCheckIn = (id: string, targetLat: number, targetLng: number, duration: string) => {
    setGpsVerifying(true);
    setTimeout(() => {
      const now = new Date();
      const simulatedLat = (targetLat + (Math.random() - 0.5) * 0.0004).toFixed(6);
      const simulatedLng = (targetLng + (Math.random() - 0.5) * 0.0004).toFixed(6);
      const checkInDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const checkInTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      setGpsData(prev => ({
        ...prev,
        [id]: {
          lat: simulatedLat,
          lng: simulatedLng,
          date: checkInDate,
          time: checkInTime,
          duration: duration
        }
      }));
      setGpsCheckedIn(prev => ({ ...prev, [id]: true }));
      setGpsVerifying(false);
      alert(`📍 GPS Checked-In Successfully!\n• Latitude: ${simulatedLat}\n• Longitude: ${simulatedLng}\n• Date/Time: ${checkInDate} @ ${checkInTime}\n• Target Visit Duration: ${duration}\nProximity verified successfully.`);
    }, 1200);
  };

  const handleSimulatePhotoUpload = (categoryKey: string, minPhotos: number) => {
    const reportId = activeReportId;
    if (!reportId) return;

    const currentPhotos = uploadedPhotos[reportId] || [];
    const simulatedUrls: string[] = [];
    for (let i = 1; i <= minPhotos; i++) {
      simulatedUrls.push(`https://images.unsplash.com/photo-sim-${categoryKey}-${i}`);
    }

    setUploadedPhotos(prev => ({
      ...prev,
      [reportId]: [...currentPhotos, ...simulatedUrls]
    }));
    alert(`Uploaded ${minPhotos} high-resolution photos for category: ${categoryKey}.`);
  };

  const handleOpenReport = (id: string) => {
    if (!gpsCheckedIn[id]) {
      alert('🔒 Geofence Security: You must physically perform a GPS Check-In at the artisan workshop coordinates to unlock the report form.');
      return;
    }
    setActiveReportId(id);
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      setRecommendation(assignment.tier);
    }
  };

  const handleSubmitReport = (id: string) => {
    const reportPhotosCount = (uploadedPhotos[id] || []).length;
    if (reportPhotosCount < 15) {
      alert(`Photo Documentation Check Failed:\nYou have uploaded ${reportPhotosCount} photos. Britsync quality standards require a minimum of 15 high-resolution photos spanning all 8 core categories.`);
      return;
    }
    if (!videoUrl.trim()) {
      alert('Video Documentation Check Failed:\nPlease upload or paste raw video evidence of the craft production process.');
      return;
    }
    if (!laborSafe || !laborWages || !laborAge || !materialOrganic || !materialOriginal) {
      alert('Verification Checklist Failed: All labor ethics and material provenance checks must be physically verified.');
      return;
    }

    setAssignments(assignments.map(a => a.id === id ? { ...a, status: 'Report Submitted' } : a));
    
    // Add completed notification
    setNotifications([
      { id: Date.now(), text: `Report submitted for ${assignments.find(a => a.id === id)?.maker}. Registry ticket updated.`, date: 'Just now' },
      ...notifications
    ]);

    alert(`✓ Inspection report INS-${id} submitted to Britsync Admin.\n- 15 Verified Photos Logged\n- Raw Video Logged\n- GPS Audit Tracked\n- Quality Score: ${qualityScore}/100`);
    setActiveReportId(null);
    
    // Reset Form
    setLaborSafe(false);
    setLaborWages(false);
    setLaborAge(false);
    setMaterialOrganic(false);
    setMaterialOriginal(false);
    setQualityScore(90);
    setNotes('');
    setVideoUrl('');
  };

  // KPI Calculations
  const todayVisits = assignments.filter(a => a.status === 'Pending Visit' && a.id === 'INS-084').length;
  const pendingVisits = assignments.filter(a => a.status === 'Pending Visit').length;
  const completedVisits = assignments.filter(a => a.status === 'Report Submitted').length;

  return (
    <main className="grid-bg" style={{ padding: '8rem 2rem 6rem', maxWidth: '1400px', margin: '0 auto', width: '100%', backgroundColor: 'var(--background)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Absolute ambient light orbs */}
      <div className="glow-orb" style={{ top: '10%', right: '5%', width: '550px', height: '550px', opacity: 0.6 }} />
      <div className="glow-orb" style={{ bottom: '15%', left: '5%', width: '450px', height: '450px', opacity: 0.4 }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
      
      {/* Upper Inspector Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #eee', paddingBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-outfit)', fontWeight: 300 }}>Inspector Workspace</h1>
          <p style={{ opacity: 0.7 }}>Agent: <strong>Tariq M.</strong> • Region: South Asia Regional Lead • Performance: <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>98% AQL Rating</span></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => {
              alert('Syncing device offline data cache... Success. 0 pending offline audits.');
            }}
            className="btn-accent" 
            style={{ padding: '0.75rem 1.5rem' }}
          >
            Offline Data Sync
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--secondary)', marginBottom: '3rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button onClick={() => { setActiveSubTab('dashboard'); setActiveReportId(null); }} style={{ padding: '0.75rem 1.5rem', border: 'none', background: activeSubTab === 'dashboard' ? 'var(--secondary)' : 'transparent', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Visits Dashboard</button>
        <button onClick={() => { setActiveSubTab('calendar'); setActiveReportId(null); }} style={{ padding: '0.75rem 1.5rem', border: 'none', background: activeSubTab === 'calendar' ? 'var(--secondary)' : 'transparent', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Inspection Calendar</button>
        <button onClick={() => { setActiveSubTab('map'); setActiveReportId(null); }} style={{ padding: '0.75rem 1.5rem', border: 'none', background: activeSubTab === 'map' ? 'var(--secondary)' : 'transparent', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Map Proximity View</button>
        <button onClick={() => { setActiveSubTab('history'); setActiveReportId(null); }} style={{ padding: '0.75rem 1.5rem', border: 'none', background: activeSubTab === 'history' ? 'var(--secondary)' : 'transparent', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>History & Performance</button>
      </div>

      {/* Main Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3rem' }}>
        
        {/* Left Side: Dynamic Workspace tabs */}
        <div>
          
          {/* A. VISITS DASHBOARD SUBTAB */}
          {activeSubTab === 'dashboard' && !activeReportId && (
            <div>
              {/* KPIs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card">
                  <span style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Today's Audits</span>
                  <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)', marginTop: '0.25rem' }}>{todayVisits}</h2>
                </div>
                <div className="card">
                  <span style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Pending Visits</span>
                  <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)', marginTop: '0.25rem' }}>{pendingVisits}</h2>
                </div>
                <div className="card">
                  <span style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Completed Visits</span>
                  <h2 style={{ fontSize: '2.2rem', color: 'var(--success)', marginTop: '0.25rem' }}>{completedVisits}</h2>
                </div>
                <div className="card">
                  <span style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>AQL Audit Rating</span>
                  <h2 style={{ fontSize: '2.2rem', color: 'var(--success)', marginTop: '0.25rem' }}>98/100</h2>
                </div>
              </div>

              {/* Assignment Table */}
              <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Assigned Verification Queue</h2>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)', fontSize: '0.9rem' }}>
                      <th style={{ padding: '1.2rem 1.5rem' }}>Assignment / Schedule</th>
                      <th style={{ padding: '1.2rem 1.5rem' }}>Maker Location</th>
                      <th style={{ padding: '1.2rem 1.5rem' }}>GPS Check-In Status</th>
                      <th style={{ padding: '1.2rem 1.5rem' }}>Verification Status</th>
                      <th style={{ padding: '1.2rem 1.5rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1.5rem' }}>
                          <strong style={{ display: 'block', fontSize: '0.95rem' }}>{a.id} • {a.maker}</strong>
                          <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{a.date} @ {a.time}</span>
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          <span style={{ display: 'block', fontSize: '0.9rem' }}>{a.location}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Target Coords: {a.lat}, {a.lng}</span>
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          {gpsCheckedIn[a.id] ? (
                            <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                              ✓ GPS Verified<br/>
                              <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 'normal', color: 'var(--primary)' }}>({gpsData[a.id]?.lat}, {gpsData[a.id]?.lng})</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleGpsCheckIn(a.id, a.lat, a.lng, a.duration)}
                              disabled={gpsVerifying || a.status === 'Report Submitted'}
                              style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--accent)', backgroundColor: 'transparent', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              {gpsVerifying ? 'Locating...' : '📍 GPS Check-In'}
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          <span style={{ 
                            backgroundColor: a.status === 'Pending Visit' ? '#FFF3E0' : (a.status === 'Report Drafted' ? '#ECEFF1' : '#E8F5E9'), 
                            color: a.status === 'Pending Visit' ? '#E65100' : (a.status === 'Report Drafted' ? '#455A64' : '#2E7D32'),
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                          }}>
                            {a.status}
                          </span>
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          {a.status === 'Report Submitted' ? (
                            <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>Verified ✓</span>
                          ) : (
                            <button 
                              onClick={() => handleOpenReport(a.id)}
                              className="btn-accent" 
                              style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}
                            >
                              {a.status === 'Pending Visit' ? 'Start Report' : 'Edit Report'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT SUBMISSION DETAILS VIEW */}
          {activeReportId && (
            (() => {
              const a = assignments.find(item => item.id === activeReportId)!;
              const photosUploadedList = uploadedPhotos[a.id] || [];
              return (
                <div className="card" style={{ padding: '3rem', border: '1px solid var(--accent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                      <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>Verification Report Form</span>
                      <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: '0.25rem 0 0' }}>{a.maker} Audit</h2>
                      <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: '0.25rem 0 0' }}>GPS Coordinates: 📍 {gpsData[a.id]?.lat}, {gpsData[a.id]?.lng} • Visit Time: {gpsData[a.id]?.date} @ {gpsData[a.id]?.time} ({gpsData[a.id]?.duration})</p>
                    </div>
                    <button 
                      onClick={() => setActiveReportId(null)} 
                      style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'var(--primary)' }}
                    >
                      Cancel & Back
                    </button>
                  </div>

                  {/* 1. PHOTO DOCUMENTATION CHECKLIST */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--secondary)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>1. Photo Documentation (Min 15 Photos)</h3>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: photosUploadedList.length >= 15 ? 'var(--success)' : 'var(--error)' }}>
                        Uploaded: {photosUploadedList.length} / 15 Photos Required
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      {photoCategories.map(cat => {
                        const count = photosUploadedList.filter(url => url.includes(cat.key)).length;
                        const minReq = cat.key === 'proc' ? 3 : (cat.key === 'pack' || cat.key === 'stor' ? 1 : 2);
                        return (
                          <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '6px' }}>
                            <div>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'block' }}>{cat.name}</strong>
                              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{cat.desc} • ({count} uploaded)</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleSimulatePhotoUpload(cat.key, minReq)}
                              style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                              Add Photos
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. VIDEO DOCUMENTATION */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', borderBottom: '1px solid var(--secondary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>2. Video Evidence Upload</h3>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1rem' }}>Upload raw craft production video. This prevents remote listing spoofing and authenticates the loom/kiln workflow.</p>
                    <input 
                      type="text" 
                      placeholder="Enter verification video URL (e.g., https://vimeo.com/britsync-audit-ins084)" 
                      value={videoUrl}
                      onChange={e => setVideoUrl(e.target.value)}
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc' }} 
                    />
                  </div>

                  {/* 3. LABOR ETHICS */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', borderBottom: '1px solid var(--secondary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>3. Labor Standards Audit</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={laborSafe} onChange={e => setLaborSafe(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                        <span>Safe Working Conditions (adequate space, clean air ventilation, safety equipment)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={laborWages} onChange={e => setLaborWages(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                        <span>Fair Living Wage Verified (Direct receipt verification audits passed)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={laborAge} onChange={e => setLaborAge(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                        <span>Zero Child Labor Audited (100% compliant with local labor age acts)</span>
                      </label>
                    </div>
                  </div>

                  {/* 4. MATERIALS Provenance */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', borderBottom: '1px solid var(--secondary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>4. Material Authenticity Audit</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={materialOrganic} onChange={e => setMaterialOrganic(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                        <span>Organic & Sustainable Materials (Local dyes, synthetic-free fibers, natural compound clays)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={materialOriginal} onChange={e => setMaterialOriginal(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                        <span>Generational Craft Preservation (Weaving/throwing processes align with regional history)</span>
                      </label>
                    </div>
                  </div>

                  {/* 5. SCORING & RECOMMENDATION */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>
                        Quality Score Audited: <strong style={{ color: 'var(--success)' }}>{qualityScore}/100</strong>
                      </label>
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        value={qualityScore} 
                        onChange={e => setQualityScore(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--accent)' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>Verification Tier Recommendation</label>
                      <select 
                        value={recommendation} 
                        onChange={e => setRecommendation(e.target.value)} 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                      >
                        <option value="GENERAL">General Verified</option>
                        <option value="ELITE">Elite Product Upgrade</option>
                        <option value="GI">Geographical Indication (GI) Certified</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>Detailed Field Audit Notes</label>
                    <textarea 
                      placeholder="Describe raw material verification, organic vat testing, and general observations of employee conditions..."
                      value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                      style={{ width: '100%', height: '120px', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'inherit' }}
                    />
                  </div>

                  {/* Submit buttons */}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => setActiveReportId(null)} 
                      style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #ccc', background: 'transparent', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleSubmitReport(a.id)}
                      className="btn-accent" 
                      style={{ padding: '0.75rem 2rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Submit Audit File
                    </button>
                  </div>

                </div>
              );
            })()
          )}

          {/* B. CALENDAR SUBTAB */}
          {activeSubTab === 'calendar' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Inspection Calendar (October 2025)</h2>
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', minHeight: '300px' }}>
                  {Array.from({ length: 31 }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const matchAssignments = assignments.filter(a => parseInt(a.date.split(' ')[1]) === dayNum);
                    return (
                      <div key={idx} style={{ border: '1px solid #eee', padding: '0.5rem', borderRadius: '4px', backgroundColor: matchAssignments.length > 0 ? '#FFF8E1' : 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{dayNum}</span>
                        {matchAssignments.map(a => (
                          <span key={a.id} style={{ fontSize: '0.7rem', backgroundColor: 'var(--accent)', color: 'var(--primary)', padding: '2px 4px', borderRadius: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', fontWeight: 'bold' }}>
                            {a.id} {a.maker.substring(0, 8)}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* C. MAP VIEW SUBTAB */}
          {activeSubTab === 'map' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Regional Map Proximity View</h2>
              <div className="card" style={{ padding: 0, overflow: 'hidden', height: '450px', position: 'relative' }}>
                {/* SVG Mock Map Grid */}
                <div style={{ width: '100%', height: '100%', background: '#E0F2F1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ opacity: 0.85 }}>
                    <path d="M 100 200 C 150 150, 200 250, 300 200 S 400 150, 500 250 S 600 200, 700 300" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="5,5" />
                    <circle cx="200" cy="220" r="10" fill="var(--primary)" opacity="0.1" />
                    <circle cx="450" cy="180" r="10" fill="var(--primary)" opacity="0.1" />
                  </svg>
                  {/* Interactive pins */}
                  {assignments.map(a => (
                    <div 
                      key={a.id} 
                      style={{ 
                        position: 'absolute', 
                        top: a.id === 'INS-084' ? '150px' : (a.id === 'INS-085' ? '280px' : '90px'), 
                        left: a.id === 'INS-084' ? '220px' : (a.id === 'INS-085' ? '540px' : '410px'),
                        textAlign: 'center',
                        transform: 'translate(-50%, -50%)',
                        cursor: 'pointer'
                      }}
                      onClick={() => alert(`Pin Details: ${a.maker}\nTarget Location: ${a.location}\nProximity verified status: ${gpsCheckedIn[a.id] ? 'Verified' : 'Pending visit'}`)}
                    >
                      <span style={{ fontSize: '2rem', filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))' }}>
                        {gpsCheckedIn[a.id] ? '📍' : '🔴'}
                      </span>
                      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', whiteSpace: 'nowrap', marginTop: '0.25rem', fontWeight: 'bold' }}>
                        {a.id}: {a.maker}
                      </div>
                    </div>
                  ))}
                  <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #ccc' }}>
                    🟢 Red: Visit Pending • 📍 Pin: GPS Proximity Verified
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* D. INSPECTION HISTORY SUBTAB */}
          {activeSubTab === 'history' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Completed Inspection Archives</h2>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)', fontSize: '0.9rem' }}>
                      <th style={{ padding: '1.2rem 1.5rem' }}>Inspection ID</th>
                      <th style={{ padding: '1.2rem 1.5rem' }}>Maker / Region</th>
                      <th style={{ padding: '1.2rem 1.5rem' }}>Audit Date</th>
                      <th style={{ padding: '1.2rem 1.5rem' }}>Audit Score</th>
                      <th style={{ padding: '1.2rem 1.5rem' }}>Registry Ticket</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>INS-071</td>
                      <td style={{ padding: '1.5rem' }}>
                        <strong style={{ display: 'block' }}>Kente Weavers Studio</strong>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Kumasi, Ghana</span>
                      </td>
                      <td style={{ padding: '1.5rem' }}>Sep 15, 2025</td>
                      <td style={{ padding: '1.5rem', color: 'var(--success)', fontWeight: 'bold' }}>96 / 100</td>
                      <td style={{ padding: '1.5rem' }}><span style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'underline' }}>Active GI Passport</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>INS-072</td>
                      <td style={{ padding: '1.5rem' }}>
                        <strong style={{ display: 'block' }}>Konya Carpets</strong>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Konya, Turkey</span>
                      </td>
                      <td style={{ padding: '1.5rem' }}>Sep 08, 2025</td>
                      <td style={{ padding: '1.5rem', color: 'var(--success)', fontWeight: 'bold' }}>95 / 100</td>
                      <td style={{ padding: '1.5rem' }}><span style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'underline' }}>Active Elite Passport</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Notification drawer & performance scorecard */}
        <div>
          {/* Performance scorecard */}
          <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid var(--accent)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 'bold' }}>My Profile Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>AQL Level</span>
                <strong>Level 3 Lead</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Audits Filed</span>
                <strong>42 audits</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Avg Audit Score</span>
                <strong>94.8 / 100</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Sync Status</span>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ Up-to-date</span>
              </div>
            </div>
          </div>

          {/* Notifications feed */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>Inbox Notifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {notifications.map(n => (
                <div key={n.id} style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '0.75rem' }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', lineHeight: 1.4 }}>{n.text}</p>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{n.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      </div>
    </main>
  );
}

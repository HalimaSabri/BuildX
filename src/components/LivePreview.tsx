import React, { useState } from 'react';
import type { AppTemplate } from '../utils/templates';
import { ShoppingBag, Truck, BarChart2, GraduationCap, Hotel, Users, Heart, Calendar, Plus, RefreshCw, Send, Check } from 'lucide-react';

interface LivePreviewProps {
  template: AppTemplate;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ template }) => {
  // Common states
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // E-COMMERCE LOCAL STATES
  const [ecommerceCart, setEcommerceCart] = useState<any[]>([]);
  const ecommerceProducts = [
    { id: 1, name: "Premium Wireless Headphones", price: 129.99, icon: "🎧", rating: 4.8 },
    { id: 2, name: "Smart Fitness Watch v2", price: 89.99, icon: "⌚", rating: 4.5 },
    { id: 3, name: "Ergonomic Mechanical Keyboard", price: 149.99, icon: "⌨️", rating: 4.9 }
  ];
  const handleAddToCart = (product: any) => {
    setEcommerceCart(prev => [...prev, product]);
    showToast(`🛒 ${product.name} ajouté au panier !`);
  };
  const handleCheckout = () => {
    if (ecommerceCart.length === 0) {
      showToast('⚠️ Votre panier est vide.');
      return;
    }
    setEcommerceCart([]);
    showToast('🎉 Commande passée avec succès ! Merci de votre achat.');
  };

  // DELIVERY LOCAL STATES
  const [deliveries, setDeliveries] = useState<any[]>([
    { id: "DLV-901", dest: "12 Avenue de Paris", status: "En Cours", driver: "Marc L.", eta: "12 min" },
    { id: "DLV-902", dest: "78 Rue Gambetta", status: "Livré", driver: "Sylvie V.", eta: "Terminé" },
    { id: "DLV-903", dest: "4 Boulevard Saint-Germain", status: "Assigné", driver: "Karim B.", eta: "45 min" }
  ]);
  const [pickupAddr, setPickupAddr] = useState('');
  const [destAddr, setDestAddr] = useState('');
  const handleCreateDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddr || !destAddr) {
      showToast('⚠️ Veuillez renseigner le départ et l\'arrivée.');
      return;
    }
    const newId = `DLV-${Math.floor(100 + Math.random() * 900)}`;
    setDeliveries(prev => [
      { id: newId, dest: destAddr, status: "Assigné", driver: "Recherche en cours...", eta: "30 min" },
      ...prev
    ]);
    setPickupAddr('');
    setDestAddr('');
    showToast(`🚚 Course ${newId} créée et livreur recherché !`);
  };

  // BI LOCAL STATES
  const [biPeriod, setBiPeriod] = useState('7d');
  const [biRevenue, setBiRevenue] = useState(143200);
  const handlePeriodChange = (period: string) => {
    setBiPeriod(period);
    // Simulate updating analytics data
    let base = 143200;
    if (period === '24h') base = 4800;
    if (period === '30d') base = 620000;
    if (period === '1y') base = 4892000;
    setBiRevenue(base + Math.floor(Math.random() * 5000));
    showToast(`📊 Filtre analytique appliqué : ${period}`);
  };

  // SCHOOL LOCAL STATES
  const [students, setStudents] = useState<any[]>([
    { id: "STD-104", name: "Sophie Martin", class: "3ème A", avg: 15.6, status: "Présent" },
    { id: "STD-105", name: "Luc Bernard", class: "3ème B", avg: 12.4, status: "Absent" },
    { id: "STD-106", name: "Karima Kadi", class: "3ème A", avg: 18.2, status: "Présent" }
  ]);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('3ème A');
  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;
    const newId = `STD-${Math.floor(100 + Math.random() * 900)}`;
    setStudents(prev => [
      ...prev,
      { id: newId, name: newStudentName, class: newStudentClass, avg: 10 + Math.floor(Math.random() * 10), status: "Présent" }
    ]);
    setNewStudentName('');
    showToast(`🎓 ${newStudentName} inscrit avec succès !`);
  };
  const toggleAttendance = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Présent' ? 'Absent' : 'Présent';
        showToast(`📅 Appel: ${s.name} marqué ${nextStatus}`);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // HOTEL LOCAL STATES
  const [rooms, setRooms] = useState<any[]>([
    { id: 101, type: "Suite Executive", price: 199, status: "Occupé" },
    { id: 102, type: "Double Confort", price: 120, status: "Disponible" },
    { id: 103, type: "Luxe Panoramique", price: 299, status: "Disponible" }
  ]);
  const [guestName, setGuestName] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(102);
  const handleHotelBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName) return;
    setRooms(prev => prev.map(r => {
      if (r.id === selectedRoomId) {
        return { ...r, status: "Occupé" };
      }
      return r;
    }));
    setGuestName('');
    showToast(`🏨 Chambre ${selectedRoomId} réservée pour M./Mme ${guestName} !`);
  };

  // CRM LOCAL STATES
  const [leads, setLeads] = useState<any[]>([
    { id: 1, name: "Acme Corp", contact: "Alice V.", value: "24 000 €", status: "Proposition" },
    { id: 2, name: "Stark Industries", contact: "Tony S.", value: "150 000 €", status: "Négociation" },
    { id: 3, name: "Wayne Ent.", contact: "Bruce W.", value: "95 000 €", status: "Gagné" }
  ]);
  const [leadCompany, setLeadCompany] = useState('');
  const [leadVal, setLeadVal] = useState('');
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCompany || !leadVal) return;
    setLeads(prev => [
      ...prev,
      { id: prev.length + 1, name: leadCompany, contact: "Prospect Web", value: `${parseInt(leadVal).toLocaleString()} €`, status: "Proposition" }
    ]);
    setLeadCompany('');
    setLeadVal('');
    showToast(`💼 Opportunité commerciale créée pour ${leadCompany} !`);
  };

  // PHARMACY LOCAL STATES
  const [medicines, setMedicines] = useState<any[]>([
    { id: 104, name: "Paracétamol 1g", molecules: "Mol. Paracétamol", stock: 142, price: 2.50, rx: false },
    { id: 105, name: "Amoxicilline 500mg", molecules: "Mol. Pénicilline", stock: 12, price: 6.80, rx: true },
    { id: 106, name: "Ibuprofène 400mg", molecules: "Mol. Anti-inflammatoire", stock: 0, price: 3.10, rx: false }
  ]);
  const handleDispense = (id: number) => {
    let dispensedName = '';
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        if (m.stock === 0) {
          showToast(`⚠️ ${m.name} est en rupture de stock !`);
          return m;
        }
        dispensedName = m.name;
        return { ...m, stock: m.stock - 1 };
      }
      return m;
    }));
    if (dispensedName) {
      showToast(`💊 1 boîte de ${dispensedName} délivrée !`);
    }
  };
  const handleRestock = (id: number) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, stock: m.stock + 50 };
      }
      return m;
    }));
    showToast(`📦 Réapprovisionnement de 50 boîtes effectué.`);
  };

  // BOOKING LOCAL STATES
  const [appointments, setAppointments] = useState<any[]>([
    { id: 1, service: "Consultation Cabinet A", time: "10:30 - 11:00", date: "29 Mai 2026", client: "Sophie R." },
    { id: 2, service: "Contrôle Semestriel", time: "14:00 - 14:30", date: "29 Mai 2026", client: "Luc B." }
  ]);
  const [bookingClient, setBookingClient] = useState('');
  const [bookingService, setBookingService] = useState('Consultation Cabinet A');
  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingClient) return;
    setAppointments(prev => [
      ...prev,
      { id: prev.length + 1, service: bookingService, time: "16:00 - 16:30", date: "29 Mai 2026", client: bookingClient }
    ]);
    setBookingClient('');
    showToast(`📅 RDV de ${bookingClient} enregistré pour le service : ${bookingService}`);
  };

  // Render mock templates depending on selection
  const renderSandboxContent = () => {
    switch (template.id) {
      case 'ecommerce':
        return (
          <div className="mock-app-shell">
            <header className="mock-header">
              <span className="mock-logo"><ShoppingBag size={18} /> SwiftShop Live</span>
              <div className="flex gap-4 items-center" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Panier : <strong>{ecommerceCart.length}</strong> items</span>
                <button className="mock-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#10b981' }} onClick={handleCheckout}>Valider</button>
              </div>
            </header>
            <main className="mock-content" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 700 }}>Trending Products Catalog</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {ecommerceProducts.map(p => (
                  <div key={p.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{p.icon}</div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{p.name}</h3>
                    <p style={{ color: '#6366f1', fontWeight: 'bold', margin: '0.25rem 0' }}>{p.price.toFixed(2)} €</p>
                    <button className="mock-btn" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => handleAddToCart(p)}>Ajouter</button>
                  </div>
                ))}
              </div>
            </main>
          </div>
        );
      case 'delivery':
        return (
          <div className="mock-app-shell">
            <header className="mock-header">
              <span className="mock-logo"><Truck size={18} /> LogiSpeed Logistics</span>
              <span style={{ fontSize: '0.8rem', background: '#334155', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>Mode Livreur</span>
            </header>
            <main className="mock-main">
              <div className="mock-sidebar">
                <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>Nouveau Colis</h3>
                <form onSubmit={handleCreateDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input type="text" className="form-input" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.4rem', fontSize: '0.8rem', color: '#000' }} placeholder="Collecte..." value={pickupAddr} onChange={e => setPickupAddr(e.target.value)} />
                  <input type="text" className="form-input" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.4rem', fontSize: '0.8rem', color: '#000' }} placeholder="Livraison..." value={destAddr} onChange={e => setDestAddr(e.target.value)} />
                  <button type="submit" className="mock-btn" style={{ fontSize: '0.8rem' }}><Plus size={12} /> Assigner</button>
                </form>
              </div>
              <div className="mock-content">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Flux des Courses en Cours</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {deliveries.map(d => (
                    <div key={d.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{d.id} - {d.dest}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Livreur : {d.driver}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: d.status === 'Livré' ? '#d1fae5' : '#fef3c7', color: d.status === 'Livré' ? '#065f46' : '#92400e', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>{d.status}</span>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>ETA: {d.eta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        );
      case 'bi':
        return (
          <div className="mock-app-shell">
            <header className="mock-header">
              <span className="mock-logo"><BarChart2 size={18} /> AnalyticBoard BI</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {['24h', '7d', '30d', '1y'].map(p => (
                  <button key={p} className="mock-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: biPeriod === p ? '#4f46e5' : '#334155' }} onClick={() => handlePeriodChange(p)}>{p}</button>
                ))}
              </div>
            </header>
            <main className="mock-content">
              <div className="mock-kpi-grid">
                <div className="mock-kpi-card">
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Revenu Récurrent (MRR)</p>
                  <div className="mock-kpi-val">{biRevenue.toLocaleString()} €</div>
                  <span style={{ color: '#10b981', fontSize: '0.75rem' }}>▲ 18.2% vs last month</span>
                </div>
                <div className="mock-kpi-card">
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Utilisateurs Actifs (MAU)</p>
                  <div className="mock-kpi-val">184,923</div>
                  <span style={{ color: '#10b981', fontSize: '0.75rem' }}>▲ 22.5% vs last month</span>
                </div>
                <div className="mock-kpi-card">
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Taux de Rétention</p>
                  <div className="mock-kpi-val">94.2%</div>
                  <span style={{ color: '#10b981', fontSize: '0.75rem' }}>▲ Stable (+0.5%)</span>
                </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Direct Acquisition Volumes</h3>
                <div style={{ height: '140px', display: 'flex', alignItems: 'end', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  {[30, 50, 45, 60, 80, 75, 110, 95, 120, 100].map((v, i) => (
                    <div key={i} style={{ background: '#6366f1', width: '100%', height: `${v}%`, borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  <span>Janv</span><span>Mars</span><span>Mai</span><span>Juil</span><span>Sept</span><span>Nov</span>
                </div>
              </div>
            </main>
          </div>
        );
      case 'school':
        return (
          <div className="mock-app-shell">
            <header className="mock-header" style={{ background: '#047857' }}>
              <span className="mock-logo"><GraduationCap size={18} /> Academix Portal</span>
              <span style={{ fontSize: '0.8rem' }}>Promo 2025/2026</span>
            </header>
            <main className="mock-main">
              <div className="mock-sidebar">
                <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#047857', marginBottom: '0.5rem' }}>Inscrire un élève</h3>
                <form onSubmit={handleRegisterStudent} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input type="text" className="form-input" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.4rem', fontSize: '0.8rem', color: '#000' }} placeholder="Nom de l'élève..." value={newStudentName} onChange={e => setNewStudentName(e.target.value)} />
                  <select className="form-select" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.4rem', fontSize: '0.8rem', color: '#000' }} value={newStudentClass} onChange={e => setNewStudentClass(e.target.value)}>
                    <option>3ème A</option>
                    <option>3ème B</option>
                  </select>
                  <button type="submit" className="mock-btn" style={{ background: '#047857', fontSize: '0.8rem' }}><Plus size={12} /> Inscrire</button>
                </form>
              </div>
              <div className="mock-content">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#047857' }}>Registre d'appel & Moyennes</h2>
                <table className="mock-table">
                  <thead>
                    <tr>
                      <th>Élève</th>
                      <th>Classe</th>
                      <th>Moyenne</th>
                      <th>Présence</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 'bold' }}>{s.name}</td>
                        <td>{s.class}</td>
                        <td style={{ color: '#047857', fontWeight: 'bold' }}>{s.avg} / 20</td>
                        <td>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: s.status === 'Présent' ? '#d1fae5' : '#fee2e2', color: s.status === 'Présent' ? '#065f46' : '#991b1b', padding: '0.15rem 0.5rem', borderRadius: '50px' }}>{s.status}</span>
                        </td>
                        <td>
                          <button className="mock-btn" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: '#64748b' }} onClick={() => toggleAttendance(s.id)}>Appel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        );
      case 'hotel':
        return (
          <div className="mock-app-shell">
            <header className="mock-header" style={{ background: '#1c1917' }}>
              <span className="mock-logo"><Hotel size={18} /> Grand Palace Luxury</span>
              <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★★★★★</span>
            </header>
            <main className="mock-main">
              <div className="mock-sidebar">
                <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#78716c', marginBottom: '0.5rem' }}>Nouvelle Réservation</h3>
                <form onSubmit={handleHotelBooking} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input type="text" className="form-input" style={{ background: '#f5f5f4', border: '1px solid #d6d3d1', padding: '0.4rem', fontSize: '0.8rem', color: '#000' }} placeholder="Nom du Client..." value={guestName} onChange={e => setGuestName(e.target.value)} />
                  <select className="form-select" style={{ background: '#f5f5f4', border: '1px solid #d6d3d1', padding: '0.4rem', fontSize: '0.8rem', color: '#000' }} value={selectedRoomId} onChange={e => setSelectedRoomId(parseInt(e.target.value))}>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>Chambre {r.id} ({r.type})</option>
                    ))}
                  </select>
                  <button type="submit" className="mock-btn" style={{ background: '#1c1917', color: '#f59e0b', fontSize: '0.8rem' }}><Check size={12} /> Enregistrer</button>
                </form>
              </div>
              <div className="mock-content">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Plan des Chambres</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {rooms.map(r => (
                    <div key={r.id} style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Chambre {r.id} - {r.type}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#78716c' }}>{r.price} € / nuit</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: r.status === 'Disponible' ? '#d1fae5' : '#e7e5e4', color: r.status === 'Disponible' ? '#065f46' : '#78716c', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid ' + (r.status === 'Disponible' ? '#a7f3d0' : '#d6d3d1') }}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        );
      case 'crm':
        return (
          <div className="mock-app-shell">
            <header className="mock-header" style={{ background: '#0f172a' }}>
              <span className="mock-logo"><Users size={18} /> Apex CRM Dashboard</span>
              <span style={{ fontSize: '0.75rem', background: '#3b82f6', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Pipe Commercial</span>
            </header>
            <main className="mock-main">
              <div className="mock-sidebar">
                <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.5rem' }}>Ajouter Opportunité</h3>
                <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input type="text" className="form-input" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.4rem', fontSize: '0.8rem', color: '#000' }} placeholder="Entreprise..." value={leadCompany} onChange={e => setLeadCompany(e.target.value)} />
                  <input type="number" className="form-input" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.4rem', fontSize: '0.8rem', color: '#000' }} placeholder="Valeur (EUR)..." value={leadVal} onChange={e => setLeadVal(e.target.value)} />
                  <button type="submit" className="mock-btn" style={{ background: '#2563eb', fontSize: '0.8rem' }}><Plus size={12} /> Ajouter Deal</button>
                </form>
              </div>
              <div className="mock-content">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Suivi des Négociations</h2>
                <table className="mock-table">
                  <thead>
                    <tr>
                      <th>Entreprise</th>
                      <th>Contact</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(l => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 'bold' }}>{l.name}</td>
                        <td>{l.contact}</td>
                        <td style={{ color: '#2563eb', fontWeight: 'bold' }}>{l.value}</td>
                        <td>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: l.status === 'Gagné' ? '#d1fae5' : '#dbeafe', color: l.status === 'Gagné' ? '#065f46' : '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '50px' }}>{l.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        );
      case 'pharmacy':
        return (
          <div className="mock-app-shell">
            <header className="mock-header" style={{ background: '#0284c7' }}>
              <span className="mock-logo"><Heart size={18} /> PharmaCare Stock</span>
              <span style={{ fontSize: '0.8rem', border: '1px solid #e0f2fe', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Module Dispensaire</span>
            </header>
            <main className="mock-content" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0369a1' }}>Délivrance Directe de Produits</h2>
              <table className="mock-table">
                <thead>
                  <tr>
                    <th>Médicament</th>
                    <th>Molécule</th>
                    <th>Prix</th>
                    <th>Stock Actuel</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 'bold' }}>
                        {m.name}
                        {m.rx && <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#92400e', marginLeft: '0.5rem', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 'bold' }}>Rx</span>}
                      </td>
                      <td style={{ fontStyle: 'italic', color: '#64748b' }}>{m.molecules}</td>
                      <td>{m.price.toFixed(2)} €</td>
                      <td>
                        <span style={{ fontWeight: 'bold', color: m.stock === 0 ? '#b91c1c' : m.stock < 15 ? '#b45309' : '#047857' }}>
                          {m.stock === 0 ? 'Rupture' : `${m.stock} boîtes`}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '0.3rem' }}>
                        <button className="mock-btn" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: '#0284c7' }} onClick={() => handleDispense(m.id)}>Délivrer</button>
                        <button className="mock-btn" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: '#64748b' }} onClick={() => handleRestock(m.id)}>Restock</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </main>
          </div>
        );
      case 'booking':
        return (
          <div className="mock-app-shell">
            <header className="mock-header" style={{ background: '#6d28d9' }}>
              <span className="mock-logo"><Calendar size={18} /> BookySpace Portal</span>
              <span style={{ fontSize: '0.75rem', background: '#8b5cf6', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Agenda Cab</span>
            </header>
            <main className="mock-main">
              <div className="mock-sidebar">
                <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6d28d9', marginBottom: '0.5rem' }}>Prendre un RDV</h3>
                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input type="text" className="form-input" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.4rem', fontSize: '0.8rem', color: '#000' }} placeholder="Nom du Patient/Client..." value={bookingClient} onChange={e => setBookingClient(e.target.value)} />
                  <select className="form-select" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.4rem', fontSize: '0.8rem', color: '#000' }} value={bookingService} onChange={e => setBookingService(e.target.value)}>
                    <option>Consultation Cabinet A</option>
                    <option>Contrôle Semestriel</option>
                    <option>Soin Premium</option>
                  </select>
                  <button type="submit" className="mock-btn" style={{ background: '#6d28d9', fontSize: '0.8rem' }}><Check size={12} /> Réserver</button>
                </form>
              </div>
              <div className="mock-content">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Plan du Jour (Coaching/Consults)</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {appointments.map(a => (
                    <div key={a.id} style={{ background: '#fff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', itemsCenter: 'center' }}>
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{a.service}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Client: {a.client}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: '#ede9fe', color: '#6d28d9', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>{a.time}</span>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>{a.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        );
      default:
        return (
          <div className="flex-center" style={{ height: '100%', color: 'var(--text-secondary)' }}>
            Aperçu non disponible pour cette application.
          </div>
        );
    }
  };

  return (
    <div className="preview-sandbox">
      <div className="sandbox-bar">
        <div className="flex-center" style={{ gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
        </div>
        <div className="sandbox-address">
          http://localhost:3000/{template.id}
        </div>
        <button
          onClick={() => showToast('🔄 Sandbox rafraîchie avec succès !')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          className="flex-center"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="sandbox-frame">
        {renderSandboxContent()}

        {/* Global Simulated Notification Toast */}
        {notification && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            borderLeft: '4px solid var(--accent-primary)',
            borderRadius: '4px',
            padding: '0.75rem 1.25rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {notification}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

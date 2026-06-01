import type { AppTemplate } from '../types.js';

const baseKpis = [
  { label: 'Modules generes', value: '8', change: '+100%', positive: true },
  { label: 'Endpoints API', value: '22', change: '+12', positive: true },
  { label: 'Temps MVP estime', value: '3 jours', change: '-70%', positive: true },
  { label: 'Couverture blueprint', value: '92%', change: '+18%', positive: true },
];

export const APP_TEMPLATES: Record<string, Omit<AppTemplate, 'files'>> = {
  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce Platform',
    icon: 'ShoppingBag',
    description: 'Boutique en ligne avec catalogue produits, panier, commandes et paiement.',
    entities: ['User', 'Product', 'Category', 'Order', 'OrderItem', 'Payment'],
    relations: ['User has Many Orders', 'Order has Many OrderItems', 'Product belongs to Category'],
    roles: ['Visiteur', 'Client', 'Administrateur Boutique'],
    kpis: baseKpis,
    umlData: {
      classes: [
        { name: 'User', attributes: ['id: int', 'email: string', 'role: string'], methods: ['register()', 'login()'] },
        { name: 'Product', attributes: ['id: int', 'name: string', 'price: decimal'], methods: ['updateStock()'] },
        { name: 'Order', attributes: ['id: int', 'status: string', 'total: decimal'], methods: ['create()', 'cancel()'] },
      ],
      links: [
        { from: 'User', to: 'Order', type: 'one-to-many', label: '1..N' },
        { from: 'Order', to: 'Product', type: 'many-to-many', label: 'N..M' },
      ],
      useCases: [
        { actor: 'Client', cases: ['Parcourir le catalogue', 'Ajouter au panier', 'Payer une commande'] },
        { actor: 'Administrateur', cases: ['Gerer les produits', 'Suivre les ventes'] },
      ],
    },
  },
  delivery: {
    id: 'delivery',
    name: 'Delivery Logistics App',
    icon: 'Truck',
    description: 'Application de livraison avec suivi colis, livreurs, clients et dashboard logistique.',
    entities: ['Customer', 'Driver', 'DeliveryOrder', 'Package', 'Location'],
    relations: ['Customer has Many DeliveryOrders', 'Driver handles Many DeliveryOrders', 'DeliveryOrder contains Packages'],
    roles: ['Client', 'Livreur', 'Gestionnaire Logistique'],
    kpis: baseKpis,
    umlData: {
      classes: [
        { name: 'Customer', attributes: ['id: int', 'name: string', 'phone: string'], methods: ['placeOrder()'] },
        { name: 'Driver', attributes: ['id: int', 'vehicle: string', 'status: string'], methods: ['acceptDelivery()'] },
        { name: 'DeliveryOrder', attributes: ['id: int', 'status: string', 'eta: string'], methods: ['assignDriver()'] },
      ],
      links: [
        { from: 'Customer', to: 'DeliveryOrder', type: 'one-to-many', label: '1..N' },
        { from: 'Driver', to: 'DeliveryOrder', type: 'one-to-many', label: '1..N' },
      ],
      useCases: [
        { actor: 'Client', cases: ['Creer une livraison', 'Suivre le colis', 'Noter le livreur'] },
        { actor: 'Livreur', cases: ['Accepter une course', 'Mettre a jour le statut'] },
      ],
    },
  },
  bi: {
    id: 'bi',
    name: 'Business Intelligence Dashboard',
    icon: 'BarChart2',
    description: 'Dashboard BI avec KPIs, filtres, graphiques et tableaux analytiques.',
    entities: ['Metric', 'Report', 'Dataset', 'Dashboard', 'Alert'],
    relations: ['Dashboard has Many Reports', 'Report reads Many Datasets', 'Metric belongs to Dashboard'],
    roles: ['Analyste', 'Manager', 'Administrateur BI'],
    kpis: baseKpis,
    umlData: {
      classes: [
        { name: 'Dashboard', attributes: ['id: int', 'name: string'], methods: ['refresh()'] },
        { name: 'Report', attributes: ['id: int', 'title: string'], methods: ['exportPdf()'] },
        { name: 'Metric', attributes: ['id: int', 'value: decimal'], methods: ['calculate()'] },
      ],
      links: [{ from: 'Dashboard', to: 'Report', type: 'one-to-many', label: '1..N' }],
      useCases: [{ actor: 'Manager', cases: ['Consulter KPIs', 'Filtrer les donnees', 'Exporter un rapport'] }],
    },
  },
  school: {
    id: 'school',
    name: 'School Management System',
    icon: 'GraduationCap',
    description: 'Gestion scolaire avec eleves, enseignants, notes, presence et classes.',
    entities: ['Student', 'Teacher', 'Classroom', 'Grade', 'Attendance'],
    relations: ['Classroom has Many Students', 'Teacher teaches Many Classrooms', 'Student has Many Grades'],
    roles: ['Administrateur', 'Enseignant', 'Parent'],
    kpis: baseKpis,
    umlData: {
      classes: [
        { name: 'Student', attributes: ['id: int', 'name: string'], methods: ['calculateAverage()'] },
        { name: 'Teacher', attributes: ['id: int', 'subject: string'], methods: ['recordGrade()'] },
        { name: 'Attendance', attributes: ['id: int', 'status: string'], methods: ['mark()'] },
      ],
      links: [{ from: 'Student', to: 'Grade', type: 'one-to-many', label: '1..N' }],
      useCases: [{ actor: 'Enseignant', cases: ['Faire appel', 'Saisir notes', 'Consulter classe'] }],
    },
  },
  hotel: {
    id: 'hotel',
    name: 'Hotel Management System',
    icon: 'Hotel',
    description: 'Gestion hoteliere avec chambres, reservations, clients et facturation.',
    entities: ['Guest', 'Room', 'Reservation', 'Invoice', 'Service'],
    relations: ['Guest has Many Reservations', 'Room has Many Reservations', 'Reservation has One Invoice'],
    roles: ['Receptionniste', 'Manager', 'Client'],
    kpis: baseKpis,
    umlData: {
      classes: [
        { name: 'Guest', attributes: ['id: int', 'name: string'], methods: ['checkIn()'] },
        { name: 'Room', attributes: ['id: int', 'status: string'], methods: ['markAvailable()'] },
        { name: 'Reservation', attributes: ['id: int', 'date: date'], methods: ['confirm()'] },
      ],
      links: [{ from: 'Guest', to: 'Reservation', type: 'one-to-many', label: '1..N' }],
      useCases: [{ actor: 'Receptionniste', cases: ['Reserver chambre', 'Check-in', 'Editer facture'] }],
    },
  },
  crm: {
    id: 'crm',
    name: 'CRM Commercial',
    icon: 'Users',
    description: 'CRM avec prospects, comptes, opportunites, interactions et pipeline commercial.',
    entities: ['Lead', 'Account', 'Contact', 'Opportunity', 'Interaction'],
    relations: ['Account has Many Contacts', 'Account has Many Opportunities', 'Lead converts to Opportunity'],
    roles: ['Commercial', 'Manager', 'Support Client'],
    kpis: baseKpis,
    umlData: {
      classes: [
        { name: 'Lead', attributes: ['id: int', 'source: string'], methods: ['convert()'] },
        { name: 'Opportunity', attributes: ['id: int', 'value: decimal'], methods: ['advanceStage()'] },
        { name: 'Interaction', attributes: ['id: int', 'channel: string'], methods: ['log()'] },
      ],
      links: [{ from: 'Lead', to: 'Opportunity', type: 'one-to-one', label: '1..1' }],
      useCases: [{ actor: 'Commercial', cases: ['Creer lead', 'Suivre opportunite', 'Historiser appel'] }],
    },
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'Pharmacy Inventory System',
    icon: 'HeartPulse',
    description: 'Gestion de pharmacie avec medicaments, stock, ordonnances et ventes.',
    entities: ['Medicine', 'Prescription', 'Sale', 'Supplier', 'InventoryAlert'],
    relations: ['Supplier supplies Medicines', 'Prescription references Medicines', 'Sale contains Medicines'],
    roles: ['Pharmacien', 'Assistant', 'Administrateur'],
    kpis: baseKpis,
    umlData: {
      classes: [
        { name: 'Medicine', attributes: ['id: int', 'stock: int'], methods: ['dispense()'] },
        { name: 'Prescription', attributes: ['id: int', 'patient: string'], methods: ['validate()'] },
        { name: 'Sale', attributes: ['id: int', 'total: decimal'], methods: ['checkout()'] },
      ],
      links: [{ from: 'Medicine', to: 'Sale', type: 'one-to-many', label: '1..N' }],
      useCases: [{ actor: 'Pharmacien', cases: ['Verifier stock', 'Traiter ordonnance', 'Vendre medicament'] }],
    },
  },
  booking: {
    id: 'booking',
    name: 'Reservation Planning System',
    icon: 'CalendarDays',
    description: 'Systeme de reservation avec planning, ressources, clients et rendez-vous.',
    entities: ['Customer', 'Resource', 'Appointment', 'ScheduleBlock', 'Review'],
    relations: ['Customer has Many Appointments', 'Resource has Many Appointments', 'Appointment has One Review'],
    roles: ['Client', 'Prestataire', 'Administrateur Planning'],
    kpis: baseKpis,
    umlData: {
      classes: [
        { name: 'Customer', attributes: ['id: int', 'email: string'], methods: ['book()'] },
        { name: 'Resource', attributes: ['id: int', 'capacity: int'], methods: ['checkAvailability()'] },
        { name: 'Appointment', attributes: ['id: int', 'time: datetime'], methods: ['reschedule()'] },
      ],
      links: [{ from: 'Customer', to: 'Appointment', type: 'one-to-many', label: '1..N' }],
      useCases: [{ actor: 'Client', cases: ['Voir disponibilites', 'Reserver', 'Annuler RDV'] }],
    },
  },
};

const TEMPLATE_KEYWORDS: Record<string, string[]> = {
  ecommerce: ['ecommerce', 'e-commerce', 'boutique', 'commerce', 'panier', 'produit', 'commande'],
  delivery: ['delivery', 'livraison', 'logistique', 'livreur', 'colis', 'course', 'chauffeur'],
  bi: ['bi', 'business intelligence', 'analytics', 'analytique', 'dashboard', 'kpi', 'statistique'],
  school: ['school', 'scolaire', 'ecole', 'eleve', 'enseignant', 'classe', 'notes'],
  hotel: ['hotel', 'hoteliere', 'chambre', 'suite', 'facture'],
  crm: ['crm', 'client', 'prospect', 'lead', 'pipeline', 'commercial', 'opportunite'],
  pharmacy: ['pharmacy', 'pharmacie', 'medicament', 'ordonnance', 'stock', 'molecule'],
  booking: ['booking', 'reservation', 'rendez-vous', 'rdv', 'planning', 'calendrier', 'creneau'],
};

export const inferTemplateId = (prompt: string, fallbackId = 'ecommerce') => {
  const normalized = prompt.toLowerCase();
  const match = Object.entries(TEMPLATE_KEYWORDS).find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );

  return match?.[0] ?? fallbackId;
};

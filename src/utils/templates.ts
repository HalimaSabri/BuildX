export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface AppTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  entities: string[];
  relations: string[];
  roles: string[];
  kpis: { label: string; value: string; change: string; positive: boolean }[];
  umlData: {
    classes: { name: string; attributes: string[]; methods: string[] }[];
    links: { from: string; to: string; type: string; label: string }[];
    useCases: { actor: string; cases: string[] }[];
  };
  files: GeneratedFile[];
}

export const APP_TEMPLATES: Record<string, AppTemplate> = {
  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce Platform',
    icon: 'ShoppingBag',
    description: 'Boutique en ligne avec panier, commandes, catalogue produits et paiements sécurisés.',
    entities: ['User', 'Product', 'Order', 'OrderItem', 'Category'],
    relations: [
      'User has Many Orders (1:N)',
      'Order has Many OrderItems (1:N)',
      'Product belongs to Category (N:1)',
      'OrderItem belongs to Product (N:1)'
    ],
    roles: ['Visiteur', 'Client', 'Administrateur Boutique'],
    kpis: [
      { label: 'Ventes Totales', value: '45,892.00 €', change: '+12.4%', positive: true },
      { label: 'Commandes Actives', value: '342', change: '+8.1%', positive: true },
      { label: 'Panier Moyen', value: '85.20 €', change: '+2.3%', positive: true },
      { label: 'Nouveaux Clients', value: '1,240', change: '+15.2%', positive: true }
    ],
    umlData: {
      classes: [
        { name: 'User', attributes: ['id: int', 'email: string', 'password_hash: string', 'role: string'], methods: ['register()', 'login()', 'updateProfile()'] },
        { name: 'Product', attributes: ['id: int', 'name: string', 'price: decimal', 'stock: int', 'category_id: int'], methods: ['getDetails()', 'updateStock()'] },
        { name: 'Order', attributes: ['id: int', 'user_id: int', 'status: string', 'total: decimal', 'created_at: timestamp'], methods: ['create()', 'updateStatus()', 'cancel()'] },
        { name: 'OrderItem', attributes: ['id: int', 'order_id: int', 'product_id: int', 'quantity: int', 'price: decimal'], methods: ['calculateSubtotal()'] }
      ],
      links: [
        { from: 'User', to: 'Order', type: 'one-to-many', label: '1..N (Places)' },
        { from: 'Order', to: 'OrderItem', type: 'one-to-many', label: '1..N (Contains)' },
        { from: 'OrderItem', to: 'Product', type: 'many-to-one', label: 'N..1 (References)' }
      ],
      useCases: [
        { actor: 'Client', cases: ['Parcourir le catalogue', 'Ajouter au panier', 'Passer une commande', 'Suivre ma livraison'] },
        { actor: 'Administrateur', cases: ['Gérer les produits', 'Suivre les statistiques', 'Traiter les commandes', 'Modérer les avis'] }
      ]
    },
    files: [
      {
        name: 'package.json',
        path: 'frontend/package.json',
        language: 'json',
        content: `{
  "name": "ecommerce-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.294.0"
  }
}`
      },
      {
        name: 'App.jsx',
        path: 'frontend/src/App.jsx',
        language: 'javascript',
        content: `import React, { useState } from 'react';
import { ShoppingCart, Heart, User, Search, Package } from 'lucide-react';

export default function App() {
  const [cart, setCart] = useState([]);
  const [products] = useState([
    { id: 1, name: "Premium Wireless Headphones", price: 129.99, image: "🎧", rating: 4.8 },
    { id: 2, name: "Smart Fitness Watch v2", price: 89.99, image: "⌚", rating: 4.5 },
    { id: 3, name: "Ergonomic Mechanical Keyboard", price: 149.99, image: "⌨️", rating: 4.9 }
  ]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Package className="text-indigo-600" /> SwiftShop
        </h1>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <ShoppingCart className="cursor-pointer text-slate-600 hover:text-indigo-600" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </div>
          <User className="cursor-pointer text-slate-600" />
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Trending Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="text-6xl mb-4 text-center">{product.image}</div>
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-slate-500 text-sm">Rating: {product.rating} ⭐</p>
                <p className="text-indigo-600 font-bold text-xl mt-2">{product.price.toFixed(2)} €</p>
              </div>
              <button onClick={() => addToCart(product)} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}`
      },
      {
        name: 'server.js',
        path: 'backend/server.js',
        language: 'javascript',
        content: `const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const { errorHandler } = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Entry point
app.use('/api', apiRoutes);

// Error Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});`
      },
      {
        name: 'api.js',
        path: 'backend/routes/api.js',
        language: 'javascript',
        content: `const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Product catalog
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);

// Order workflows (Secure)
router.post('/orders', authMiddleware.verifyToken, orderController.createOrder);
router.get('/orders/user', authMiddleware.verifyToken, orderController.getUserOrders);

module.exports = router;`
      },
      {
        name: 'orderController.js',
        path: 'backend/controllers/orderController.js',
        language: 'javascript',
        content: `const db = require('../config/db');

exports.createOrder = async (req, res, next) => {
  const { items, total } = req.body;
  const userId = req.user.id;

  try {
    // 1. Insert order
    const [result] = await db.execute(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
      [userId, total, 'PENDING']
    );
    const orderId = result.insertId;

    // 2. Insert items
    for (const item of items) {
      await db.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
      // 3. Update Product Stock
      await db.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    res.status(201).json({ success: true, orderId, message: 'Order created successfully' });
  } catch (error) {
    next(error);
  }
};`
      },
      {
        name: 'schema.sql',
        path: 'database/schema.sql',
        language: 'sql',
        content: `-- Database Schema for E-commerce Platform
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  category_id INT,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);`
      },
      {
        name: 'README.md',
        path: 'README.md',
        language: 'markdown',
        content: `# SwiftShop E-commerce Project

Projet généré automatiquement par **Auto-App Generator**.

## Architecture du Projet

Le projet contient :
- **frontend/** : Interface utilisateur React avec TailwindCSS.
- **backend/** : Serveur Express avec routage d'API et middleware d'authentification JWT.
- **database/** : Schéma de base de données relationnel SQL.

## Démarrage Rapide

### Configuration du Backend
1. Naviguez dans \`backend/\` et installez les dépendances :
   \`\`\`bash
   npm install
   \`\`\`
2. Créez un fichier \`.env\` avec vos configurations de base de données.
3. Démarrez le serveur :
   \`\`\`bash
   npm run start
   \`\`\`

### Configuration du Frontend
1. Naviguez dans \`frontend/\` et installez les dépendances :
   \`\`\`bash
   npm install
   \`\`\`
2. Démarrez le serveur de développement :
   \`\`\`bash
   npm run dev
   \`\`\`
`
      }
    ]
  },
  delivery: {
    id: 'delivery',
    name: 'Delivery Logistics App',
    icon: 'Truck',
    description: 'Application de logistique de livraison avec suivi des colis, coursiers, commandes et clients.',
    entities: ['Driver', 'Package', 'DeliveryOrder', 'Location', 'Customer'],
    relations: [
      'Customer has Many DeliveryOrders (1:N)',
      'Driver delivers Many DeliveryOrders (1:N)',
      'DeliveryOrder contains Many Packages (1:N)'
    ],
    roles: ['Client', 'Livreur / Driver', 'Gestionnaire Logistique'],
    kpis: [
      { label: 'Livraisons Réussies', value: '98.4%', change: '+1.2%', positive: true },
      { label: 'Temps Moyen de Trajet', value: '24 min', change: '-4.1 min', positive: true },
      { label: 'Livreurs Actifs', value: '87', change: '+12.5%', positive: true },
      { label: 'Réclamations Client', value: '0.2%', change: '-0.1%', positive: true }
    ],
    umlData: {
      classes: [
        { name: 'Customer', attributes: ['id: int', 'name: string', 'address: string', 'phone: string'], methods: ['placeRequest()', 'trackPackage()'] },
        { name: 'Driver', attributes: ['id: int', 'name: string', 'vehicle_plate: string', 'status: string'], methods: ['acceptDelivery()', 'updateLocation()', 'completeDelivery()'] },
        { name: 'DeliveryOrder', attributes: ['id: int', 'customer_id: int', 'driver_id: int', 'pickup_time: time', 'delivery_time: time', 'status: string'], methods: ['assignDriver()', 'calculateETA()'] }
      ],
      links: [
        { from: 'Customer', to: 'DeliveryOrder', type: 'one-to-many', label: '1..N (Orders)' },
        { from: 'Driver', to: 'DeliveryOrder', type: 'one-to-many', label: '1..N (Delivers)' }
      ],
      useCases: [
        { actor: 'Livreur', cases: ['Voir ma feuille de route', 'Accepter une livraison', 'Mettre à jour le statut', 'Prendre une photo de preuve'] },
        { actor: 'Client', cases: ['Commander une course', 'Suivre sur la carte', 'Noter le livreur', 'Demander un support'] }
      ]
    },
    files: [
      {
        name: 'package.json',
        path: 'frontend/package.json',
        language: 'json',
        content: `{
  "name": "delivery-frontend",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.294.0"
  }
}`
      },
      {
        name: 'App.jsx',
        path: 'frontend/src/App.jsx',
        language: 'javascript',
        content: `import React, { useState } from 'react';
import { Truck, MapPin, Navigation, Calendar, UserCheck } from 'lucide-react';

export default function App() {
  const [deliveries, setDeliveries] = useState([
    { id: "DLV-901", destination: "12 Avenue de Paris", status: "En Cours", eta: "15 min", driver: "Marc L." },
    { id: "DLV-902", destination: "78 Rue Gambetta", status: "Livré", eta: "Terminé", driver: "Sylvie V." },
    { id: "DLV-903", destination: "4 Boulevard Saint-Germain", status: "Assigné", eta: "45 min", driver: "Karim B." }
  ]);

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
          <Truck /> LogiSpeed Deliveries
        </h1>
        <div className="bg-slate-700 px-3 py-1 rounded text-sm flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Service Connecté
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-300">Suivi en Temps Réel des Courses</h2>
          {deliveries.map(dlv => (
            <div key={dlv.id} className="bg-slate-800 p-5 rounded-lg border border-slate-700 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="bg-indigo-950 p-3 rounded-full text-indigo-400"><Navigation /></div>
                <div>
                  <h3 className="font-semibold text-md">{dlv.id} - {dlv.destination}</h3>
                  <p className="text-xs text-slate-400">Livreur assigné : {dlv.driver}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={\`px-3 py-1 rounded-full text-xs font-semibold \${
                  dlv.status === 'Livré' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                }\`}>
                  {dlv.status}
                </span>
                <p className="text-xs text-slate-400 mt-2">ETA: {dlv.eta}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4 h-fit">
          <h2 className="text-md font-bold border-b border-slate-700 pb-2">Planifier un Coursier</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Adresse de Collecte</label>
              <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" placeholder="Ex. Entrepôt Nord" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Adresse de Livraison</label>
              <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" placeholder="Ex. 14 avenue de Paris" />
            </div>
            <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded text-sm transition">
              Rechercher un Livreur
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}`
      },
      {
        name: 'server.js',
        path: 'backend/server.js',
        language: 'javascript',
        content: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: "UP", service: "Logistics Engine" });
});

// Routing
app.use('/api/orders', require('./routes/deliveryRoutes'));

app.listen(PORT, () => {
  console.log(\`Logistics service running on port \${PORT}\`);
});`
      },
      {
        name: 'deliveryRoutes.js',
        path: 'backend/routes/deliveryRoutes.js',
        language: 'javascript',
        content: `const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all deliveries
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM delivery_orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update location of a courier
router.patch('/:id/location', async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;
  try {
    await db.query('UPDATE drivers SET last_lat = ?, last_lng = ? WHERE id = (SELECT driver_id FROM delivery_orders WHERE id = ?)', [lat, lng, id]);
    res.json({ success: true, message: "Location updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`
      },
      {
        name: 'schema.sql',
        path: 'database/schema.sql',
        language: 'sql',
        content: `-- Schema for logistics delivery system
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  vehicle_plate VARCHAR(30) NOT NULL,
  status VARCHAR(20) DEFAULT 'AVAILABLE',
  last_lat DECIMAL(9, 6),
  last_lng DECIMAL(9, 6)
);

CREATE TABLE IF NOT EXISTS delivery_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  driver_id INT,
  pickup_address VARCHAR(255) NOT NULL,
  delivery_address VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);`
      }
    ]
  },
  bi: {
    id: 'bi',
    name: 'Business Intelligence Dashboard',
    icon: 'BarChart2',
    description: 'Visualisation analytique haute performance de données complexes avec KPIs et filtres interactifs.',
    entities: ['Metric', 'ChartData', 'Dimension', 'FilterReport', 'UserBoard'],
    relations: [
      'UserBoard contains Many Metrics (1:N)',
      'ChartData aggregates Dimension metrics (N:1)'
    ],
    roles: ['Analyste', 'Data Scientist', 'Décideur / VIP'],
    kpis: [
      { label: 'Utilisateurs Uniques', value: '184,923', change: '+22.5%', positive: true },
      { label: 'Revenu Récurrent (MRR)', value: '143,200.00 €', change: '+18.1%', positive: true },
      { label: 'Taux de Rétention', value: '94.2%', change: '+0.5%', positive: true },
      { label: 'Temps Session Moyen', value: '14 min 32s', change: '-2.1%', positive: false }
    ],
    umlData: {
      classes: [
        { name: 'UserBoard', attributes: ['id: int', 'title: string', 'owner_id: int', 'filters: json'], methods: ['addWidget()', 'shareWithTeam()'] },
        { name: 'Metric', attributes: ['id: int', 'key_name: string', 'formula_sql: string', 'current_value: float'], methods: ['calculate()'] },
        { name: 'ChartData', attributes: ['id: int', 'widget_type: string', 'query_dataset: string'], methods: ['fetchReportData()'] }
      ],
      links: [
        { from: 'UserBoard', to: 'Metric', type: 'one-to-many', label: '1..N (Displays)' },
        { from: 'UserBoard', to: 'ChartData', type: 'one-to-many', label: '1..N (Contains widgets)' }
      ],
      useCases: [
        { actor: 'Analyste', cases: ['Créer des rapports personnalisés', 'Exporter en Excel/CSV', 'Configurer des alertes de seuil', 'Créer des dashboards'] },
        { actor: 'Décideur', cases: ['Consulter les KPIs en direct', 'Appliquer des filtres géographiques', 'Partager les graphiques'] }
      ]
    },
    files: [
      {
        name: 'App.jsx',
        path: 'frontend/src/App.jsx',
        language: 'javascript',
        content: `import React, { useState } from 'react';
import { BarChart, TrendingUp, DollarSign, Users, Award, Percent } from 'lucide-react';

export default function App() {
  const [activeDate, setActiveDate] = useState('7d');

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
          <Award /> AnalyticBoard Pro
        </h1>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
          {['24h', '7d', '30d', '1y'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveDate(tab)}
              className={\`px-3 py-1 rounded text-xs font-semibold transition \${
                activeDate === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }\`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex justify-between text-slate-400 mb-2"><span className="text-xs">MRR</span> <DollarSign size={16} /></div>
            <div className="text-2xl font-bold">143K €</div>
            <p className="text-xs text-emerald-400 mt-2">▲ 18.2% vs last month</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex justify-between text-slate-400 mb-2"><span className="text-xs">Actifs (MAU)</span> <Users size={16} /></div>
            <div className="text-2xl font-bold">184K</div>
            <p className="text-xs text-emerald-400 mt-2">▲ 22.5% vs last month</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex justify-between text-slate-400 mb-2"><span className="text-xs">Churn Rate</span> <Percent size={16} /></div>
            <div className="text-2xl font-bold">1.8%</div>
            <p className="text-xs text-emerald-400 mt-2">▼ 0.3% improvement</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex justify-between text-slate-400 mb-2"><span className="text-xs">LTV Moyen</span> <TrendingUp size={16} /></div>
            <div className="text-2xl font-bold">2,490 €</div>
            <p className="text-xs text-slate-400 mt-2">Consistent performance</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart className="text-indigo-400" /> Graphique d'Acquisition Directe</h2>
          <div className="h-64 flex items-end justify-between gap-4 pt-10 border-b border-slate-800">
            {[45, 60, 50, 75, 90, 85, 110, 95, 120, 135].map((val, idx) => (
              <div key={idx} className="bg-indigo-600 rounded-t w-full transition-all hover:bg-indigo-400 cursor-pointer" style={{ height: \`\${(val / 150) * 100}%\` }}></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Janv</span><span>Mars</span><span>Mai</span><span>Juil</span><span>Sept</span><span>Nov</span>
          </div>
        </div>
      </main>
    </div>
  );
}`
      },
      {
        name: 'schema.sql',
        path: 'database/schema.sql',
        language: 'sql',
        content: `-- Schema for BI analytics tracker
CREATE TABLE IF NOT EXISTS metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(30) NOT NULL,
  current_value DECIMAL(12, 2) DEFAULT 0.0,
  formula VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS daily_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  page_views INT DEFAULT 0,
  signups INT DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0.0,
  active_users INT DEFAULT 0
);`
      }
    ]
  },
  school: {
    id: 'school',
    name: 'School Management Portal',
    icon: 'GraduationCap',
    description: 'Gestion des étudiants, des classes, des enseignants, des notes et de l\'assiduité scolaire.',
    entities: ['Student', 'Teacher', 'Classroom', 'Grade', 'Attendance'],
    relations: [
      'Classroom has Many Students (1:N)',
      'Teacher teaches Classroom (1:1)',
      'Student has Many Grades (1:N)',
      'Student has Many Attendance entries (1:N)'
    ],
    roles: ['Élève', 'Enseignant', 'Administration Scolaire'],
    kpis: [
      { label: 'Taux de Réussite', value: '91.8%', change: '+3.4%', positive: true },
      { label: 'Étudiants Inscrits', value: '842', change: '+4.2%', positive: true },
      { label: 'Enseignants Actifs', value: '43', change: 'Stable', positive: true },
      { label: 'Taux d\'Assiduité', value: '96.5%', change: '+0.5%', positive: true }
    ],
    umlData: {
      classes: [
        { name: 'Student', attributes: ['id: int', 'first_name: string', 'last_name: string', 'classroom_id: int', 'birth_date: date'], methods: ['getAverageGrade()', 'recordAttendance()'] },
        { name: 'Teacher', attributes: ['id: int', 'name: string', 'subject: string', 'email: string'], methods: ['assignGrade()', 'markAttendance()'] },
        { name: 'Classroom', attributes: ['id: int', 'name: string', 'grade_level: string'], methods: ['getStudentCount()'] },
        { name: 'Grade', attributes: ['id: int', 'student_id: int', 'subject: string', 'value: float', 'term: string'], methods: [] }
      ],
      links: [
        { from: 'Classroom', to: 'Student', type: 'one-to-many', label: '1..N (Enrolls)' },
        { from: 'Student', to: 'Grade', type: 'one-to-many', label: '1..N (Receives)' }
      ],
      useCases: [
        { actor: 'Enseignant', cases: ['Saisir les notes trimestrielles', 'Faire l\'appel de présence', 'Publier des devoirs'] },
        { actor: 'Administration', cases: ['Inscrire un nouvel étudiant', 'Gérer les plannings de classe', 'Éditer les bulletins scolaires'] }
      ]
    },
    files: [
      {
        name: 'App.jsx',
        path: 'frontend/src/App.jsx',
        language: 'javascript',
        content: `import React, { useState } from 'react';
import { GraduationCap, Users, Calendar, Award, BookOpen } from 'lucide-react';

export default function App() {
  const [students] = useState([
    { id: "STD-104", name: "Sophie Martin", class: "3ème A", avg: 15.6, status: "Présent" },
    { id: "STD-105", name: "Luc Bernard", class: "3ème B", avg: 12.4, status: "Absent" },
    { id: "STD-106", name: "Karima Kadi", class: "3ème A", avg: 18.2, status: "Présent" }
  ]);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      <header className="bg-emerald-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <GraduationCap /> Academix Portal
        </h1>
        <div className="bg-emerald-800 px-3 py-1 rounded text-sm font-semibold">
          Année Scolaire 2025/2026
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 border rounded-lg shadow-sm flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full"><Users /></div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Étudiants Inscrits</p>
              <h2 className="text-2xl font-bold">842</h2>
            </div>
          </div>
          <div className="bg-white p-6 border rounded-lg shadow-sm flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full"><Award /></div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Taux de Réussite</p>
              <h2 className="text-2xl font-bold">91.8%</h2>
            </div>
          </div>
          <div className="bg-white p-6 border rounded-lg shadow-sm flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full"><Calendar /></div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Taux de Présence</p>
              <h2 className="text-2xl font-bold">96.5%</h2>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-700"><BookOpen /> Registre d'Appel & Classement</h2>
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 font-semibold text-slate-600">ID</th>
                <th className="p-3 font-semibold text-slate-600">Nom & Prénom</th>
                <th className="p-3 font-semibold text-slate-600">Classe</th>
                <th className="p-3 font-semibold text-slate-600">Moyenne Générale</th>
                <th className="p-3 font-semibold text-slate-600">Statut Présence</th>
              </tr>
            </thead>
            <tbody>
              {students.map(std => (
                <tr key={std.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 text-slate-500 font-mono">{std.id}</td>
                  <td className="p-3 font-semibold">{std.name}</td>
                  <td className="p-3 text-slate-600">{std.class}</td>
                  <td className="p-3 font-semibold text-emerald-600">{std.avg} / 20</td>
                  <td className="p-3">
                    <span className={\`px-2.5 py-0.5 rounded-full text-xs font-semibold \${
                      std.status === 'Présent' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }\`}>
                      {std.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}`
      },
      {
        name: 'schema.sql',
        path: 'database/schema.sql',
        language: 'sql',
        content: `-- Schema for School Management Platform
CREATE TABLE IF NOT EXISTS classrooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  grade_level VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  birth_date DATE,
  classroom_id INT,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  subject VARCHAR(50) NOT NULL,
  value DECIMAL(4, 2) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);`
      }
    ]
  },
  hotel: {
    id: 'hotel',
    name: 'Hotel Booking System',
    icon: 'Hotel',
    description: 'Gestion hôtelière complète avec chambres, réservations, facturation et calendrier d\'occupation.',
    entities: ['Room', 'Guest', 'Booking', 'Invoice', 'Staff'],
    relations: [
      'Room has Many Bookings (1:N)',
      'Guest has Many Bookings (1:N)',
      'Booking produces One Invoice (1:1)'
    ],
    roles: ['Visiteur', 'Client / Guest', 'Réceptionniste', 'Manager Hôtelier'],
    kpis: [
      { label: 'Occupation Actuelle', value: '82.4%', change: '+5.1%', positive: true },
      { label: 'Réservations du Jour', value: '28', change: '+2.5%', positive: true },
      { label: 'Revenu Journalier', value: '4,890.00 €', change: '+10.2%', positive: true },
      { label: 'Satisfaction Client', value: '4.8/5', change: '+0.1', positive: true }
    ],
    umlData: {
      classes: [
        { name: 'Room', attributes: ['id: int', 'room_number: string', 'type: string', 'price_per_night: decimal', 'is_cleaned: bool'], methods: ['checkAvailability()', 'toggleCleanliness()'] },
        { name: 'Guest', attributes: ['id: int', 'name: string', 'email: string', 'passport_number: string'], methods: ['makeReservation()', 'processCheckout()'] },
        { name: 'Booking', attributes: ['id: int', 'guest_id: int', 'room_id: int', 'check_in: date', 'check_out: date', 'total_amount: decimal', 'status: string'], methods: ['confirm()', 'cancel()'] }
      ],
      links: [
        { from: 'Guest', to: 'Booking', type: 'one-to-many', label: '1..N (Books)' },
        { from: 'Room', to: 'Booking', type: 'one-to-many', label: '1..N (Allocates)' }
      ],
      useCases: [
        { actor: 'Réceptionniste', cases: ['Enregistrer un Check-in', 'Attribuer les clés de chambre', 'Éditer la facture finale', 'Vérifier l\'état des chambres'] },
        { actor: 'Client', cases: ['Réserver en ligne', 'Choisir ses options (petit déj)', 'Annuler ma réservation'] }
      ]
    },
    files: [
      {
        name: 'App.jsx',
        path: 'frontend/src/App.jsx',
        language: 'javascript',
        content: `import React, { useState } from 'react';
import { Hotel, Calendar, Key, UserCheck, Star } from 'lucide-react';

export default function App() {
  const [rooms] = useState([
    { id: 101, type: "Suite Executive", price: 199.0, status: "Occupé" },
    { id: 102, type: "Double Confort", price: 120.0, status: "Disponible" },
    { id: 103, type: "Luxe Panoramique", price: 299.0, status: "Disponible" }
  ]);

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen font-sans">
      <header className="bg-stone-900 text-stone-100 px-6 py-4 flex justify-between items-center border-b border-stone-850">
        <h1 className="text-xl font-serif font-bold flex items-center gap-2 tracking-wide">
          <Hotel className="text-amber-500" /> Grand Palace Resort
        </h1>
        <div className="flex gap-1 text-amber-500"><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /></div>
      </header>
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2 text-stone-800"><Key /> Vue d'Ensemble des Chambres</h2>
            <div className="grid grid-cols-1 gap-4">
              {rooms.map(room => (
                <div key={room.id} className="bg-white p-5 border border-stone-200 rounded flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-semibold text-md font-serif">Chambre {room.id} - {room.type}</h3>
                    <p className="text-stone-500 font-bold text-sm mt-1">{room.price.toFixed(2)} € / Nuit</p>
                  </div>
                  <span className={\`px-3 py-1 rounded text-xs font-semibold \${
                    room.status === 'Disponible' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500 border border-stone-200'
                  }\`}>
                    {room.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 border border-stone-200 rounded shadow-sm space-y-4">
            <h2 className="text-lg font-bold font-serif text-stone-800 flex items-center gap-2"><Calendar /> Enregistrer une Réservation</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Nom du Client</label>
                <input type="text" className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-sm" placeholder="Ex. Arthur Rimbaud" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-500 block mb-1">Date d'Arrivée</label>
                  <input type="date" className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-stone-500 block mb-1">Date de Départ</label>
                  <input type="date" className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-sm" />
                </div>
              </div>
              <button className="w-full bg-stone-900 hover:bg-stone-800 text-amber-500 font-semibold py-2 px-4 rounded text-sm transition">
                Confirmer & Payer
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}`
      },
      {
        name: 'schema.sql',
        path: 'database/schema.sql',
        language: 'sql',
        content: `-- Schema for Hotel Reservation System
CREATE TABLE IF NOT EXISTS guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'AVAILABLE'
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guest_id INT,
  room_id INT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'CONFIRMED',
  FOREIGN KEY (guest_id) REFERENCES guests(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);`
      }
    ]
  },
  ecommerce_simple: {
    id: 'ecommerce_simple',
    name: 'Simple E-commerce',
    icon: 'ShoppingBag',
    description: 'Boutique en ligne avec panier.',
    entities: ['User', 'Product'],
    relations: [],
    roles: [],
    kpis: [],
    umlData: { classes: [], links: [], useCases: [] },
    files: []
  }
};

// Add standard CRM, Pharmacy, Booking presets to populate all 8 options
APP_TEMPLATES.crm = {
  id: 'crm',
  name: 'Client Relation Manager (CRM)',
  icon: 'Users',
  description: 'Portail de gestion des clients, des opportunités commerciales, des interactions et des tâches d\'équipe.',
  entities: ['Lead', 'Contact', 'Account', 'Opportunity', 'Interaction'],
  relations: [
    'Account has Many Contacts (1:N)',
    'Contact has Many Interactions (1:N)',
    'Account has Many Opportunities (1:N)'
  ],
  roles: ['Commercial / Agent Sales', 'Manager Commercial', 'Support Client'],
  kpis: [
    { label: 'Deals Gagnés', value: '42,900.00 €', change: '+14.2%', positive: true },
    { label: 'Taux de Conversion', value: '28.4%', change: '+3.1%', positive: true },
    { label: 'Nouveaux Leads', value: '184', change: '+8.3%', positive: true },
    { label: 'Tâches Terminées', value: '94.2%', change: '+5.0%', positive: true }
  ],
  umlData: {
    classes: [
      { name: 'Lead', attributes: ['id: int', 'company: string', 'email: string', 'status: string', 'source: string'], methods: ['convertOpportunity()'] },
      { name: 'Contact', attributes: ['id: int', 'first_name: string', 'last_name: string', 'email: string', 'account_id: int'], methods: ['sendEmail()', 'logCall()'] },
      { name: 'Opportunity', attributes: ['id: int', 'name: string', 'value: decimal', 'stage: string', 'close_date: date'], methods: ['advanceStage()', 'closeWon()'] }
    ],
    links: [
      { from: 'Lead', to: 'Opportunity', type: 'one-to-one', label: '1..1 (Converts)' },
      { from: 'Contact', to: 'Lead', type: 'many-to-one', label: 'N..1 (Initiates)' }
    ],
    useCases: [
      { actor: 'Commercial', cases: ['Saisir un prospect (lead)', 'Mettre à jour l\'opportunité', 'Historiser un appel', 'Planifier un rappel'] },
      { actor: 'Manager', cases: ['Suivre le pipe commercial', 'Répartir les portefeuilles clients', 'Générer des rapports trimestriels'] }
    ]
  },
  files: [
    {
      name: 'App.jsx',
      path: 'frontend/src/App.jsx',
      language: 'javascript',
      content: `import React, { useState } from 'react';
import { Users, PhoneCall, TrendingUp, ShieldCheck, Mail } from 'lucide-react';

export default function App() {
  const [leads] = useState([
    { id: 1, name: "Acme Corp", contact: "Alice V.", value: "24,000 €", status: "Proposition" },
    { id: 2, name: "Stark Industries", contact: "Tony S.", value: "150,000 €", status: "Négociation" },
    { id: 3, name: "Wayne Ent.", contact: "Bruce W.", value: "95,000 €", status: "Gagné" }
  ]);

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen font-sans flex">
      <aside className="w-64 bg-slate-900 text-slate-300 p-5 space-y-6">
        <h1 className="text-white font-bold text-lg flex items-center gap-2"><TrendingUp className="text-indigo-400" /> ApexCRM</h1>
        <nav className="space-y-2 text-sm">
          <div className="bg-indigo-600 text-white p-2.5 rounded font-semibold cursor-pointer">Tableau de Bord</div>
          <div className="hover:bg-slate-800 p-2.5 rounded cursor-pointer">Contacts & Comptes</div>
          <div className="hover:bg-slate-800 p-2.5 rounded cursor-pointer">Opportunités</div>
        </nav>
      </aside>
      <main className="flex-1 p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Vue Pipeline Commercial</h2>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-semibold transition">+ Nouveau Lead</button>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 font-semibold text-slate-500">Entreprise</th>
                <th className="p-3 font-semibold text-slate-500">Contact</th>
                <th className="p-3 font-semibold text-slate-500">Montant Estimé</th>
                <th className="p-3 font-semibold text-slate-500">Étape</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{lead.name}</td>
                  <td className="p-3 text-slate-600">{lead.contact}</td>
                  <td className="p-3 font-bold text-indigo-600">{lead.value}</td>
                  <td className="p-3">
                    <span className={\`px-2.5 py-0.5 rounded-full text-xs font-semibold \${
                      lead.status === 'Gagné' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                    }\`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}`
    },
    {
      name: 'schema.sql',
      path: 'database/schema.sql',
      language: 'sql',
      content: `-- Schema for CRM System
CREATE TABLE IF NOT EXISTS accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  industry VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  account_id INT,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS opportunities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  stage VARCHAR(30) DEFAULT 'LEAD',
  account_id INT,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);`
    }
  ]
};

APP_TEMPLATES.pharmacy = {
  id: 'pharmacy',
  name: 'Pharmacy Inventory System',
  icon: 'HeartPulse',
  description: 'Système de gestion de pharmacie avec base de médicaments, prescriptions, ordonnances et ventes.',
  entities: ['Medicine', 'Prescription', 'Sale', 'Supplier', 'InventoryAlert'],
  relations: [
    'Medicine has Many Sales (1:N)',
    'Prescription references Many Medicines (N:M)',
    'Supplier supplies Medicine (1:N)'
  ],
  roles: ['Pharmacien', 'Assistant Pharmacien', 'Administrateur Système'],
  kpis: [
    { label: 'Ventes du Jour', value: '1,450.00 €', change: '+8.4%', positive: true },
    { label: 'Ordonnances Traitées', value: '42', change: '+12.5%', positive: true },
    { label: 'Alertes Rupture Stock', value: '3', change: '-4', positive: true },
    { label: 'Médicaments Référencés', value: '1,842', change: 'Stable', positive: true }
  ],
  umlData: {
    classes: [
      { name: 'Medicine', attributes: ['id: int', 'name: string', 'molecular_name: string', 'price: decimal', 'stock: int', 'requires_prescription: bool'], methods: ['dispense()', 'updateStock()'] },
      { name: 'Prescription', attributes: ['id: int', 'doctor_name: string', 'patient_name: string', 'issued_date: date'], methods: ['validate()'] },
      { name: 'Sale', attributes: ['id: int', 'prescription_id: int', 'total_price: decimal', 'payment_method: string'], methods: ['processReceipt()'] }
    ],
    links: [
      { from: 'Prescription', to: 'Sale', type: 'one-to-one', label: '1..1 (Fulfills)' },
      { from: 'Medicine', to: 'Sale', type: 'one-to-many', label: '1..N (Contains)' }
    ],
    useCases: [
      { actor: 'Pharmacien', cases: ['Saisir une ordonnance', 'Vérifier la compatibilité des molécules', 'Enregistrer la vente', 'Commander aux fournisseurs'] },
      { actor: 'Assistant', cases: ['Encaisser le paiement', 'Vérifier le niveau de stock'] }
    ]
  },
  files: [
    {
      name: 'App.jsx',
      path: 'frontend/src/App.jsx',
      language: 'javascript',
      content: `import React, { useState } from 'react';
import { Pill, Activity, Receipt, PackageCheck, AlertCircle } from 'lucide-react';

export default function App() {
  const [medicines] = useState([
    { id: 104, name: "Paracétamol 1g", molecules: "Mol. Paracétamol", stock: 142, price: 2.50, rx: false },
    { id: 105, name: "Amoxicilline 500mg", molecules: "Mol. Pénicilline", stock: 12, price: 6.80, rx: true },
    { id: 106, name: "Ibuprofène 400mg", molecules: "Mol. Anti-inflammatoire", stock: 0, price: 3.10, rx: false }
  ]);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      <header className="bg-sky-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Activity /> PharmaCare Pro
        </h1>
        <div className="flex gap-2">
          <span className="bg-rose-600 text-white text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
            <AlertCircle size={12} /> 1 Rupture de Stock
          </span>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 border rounded-lg shadow-sm flex items-center gap-4">
            <div className="bg-sky-50 text-sky-600 p-3 rounded-full"><Pill /></div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Molécules</p>
              <h2 className="text-2xl font-bold">1,842</h2>
            </div>
          </div>
          <div className="bg-white p-6 border rounded-lg shadow-sm flex items-center gap-4">
            <div className="bg-sky-50 text-sky-600 p-3 rounded-full"><Receipt /></div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Ventes du Jour</p>
              <h2 className="text-2xl font-bold">1,450.00 €</h2>
            </div>
          </div>
          <div className="bg-white p-6 border rounded-lg shadow-sm flex items-center gap-4">
            <div className="bg-sky-50 text-sky-600 p-3 rounded-full"><PackageCheck /></div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Ordonnances</p>
              <h2 className="text-2xl font-bold">42</h2>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-sky-700">Inventaire en Temps Réel</h2>
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 font-semibold text-slate-500">ID</th>
                <th className="p-3 font-semibold text-slate-500">Dénomination</th>
                <th className="p-3 font-semibold text-slate-500">Molécules</th>
                <th className="p-3 font-semibold text-slate-500">Prix Pub</th>
                <th className="p-3 font-semibold text-slate-500">Quantité en Stock</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map(med => (
                <tr key={med.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 text-slate-400 font-mono">{med.id}</td>
                  <td className="p-3 font-semibold flex items-center gap-2">
                    {med.name}
                    {med.rx && <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded font-bold">Ordonnance Obligatoire</span>}
                  </td>
                  <td className="p-3 text-slate-500 italic">{med.molecules}</td>
                  <td className="p-3 font-bold">{med.price.toFixed(2)} €</td>
                  <td className="p-3">
                    <span className={\`px-2.5 py-0.5 rounded-full text-xs font-semibold \${
                      med.stock === 0 ? 'bg-rose-100 text-rose-700' : med.stock < 15 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }\`}>
                      {med.stock === 0 ? 'En Rupture' : \`\${med.stock} Unités\`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}`
    },
    {
      name: 'schema.sql',
      path: 'database/schema.sql',
      language: 'sql',
      content: `-- Schema for Pharmacy Inventory System
CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  molecule_name VARCHAR(100) NOT NULL,
  price DECIMAL(8, 2) NOT NULL,
  stock INT DEFAULT 0,
  requires_prescription BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_name VARCHAR(100) NOT NULL,
  patient_name VARCHAR(100) NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total DECIMAL(10, 2) NOT NULL,
  prescription_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE SET NULL
);`
    }
  ]
};

APP_TEMPLATES.booking = {
  id: 'booking',
  name: 'General Reservation System',
  icon: 'CalendarDays',
  description: 'Plateforme générique de réservation de créneaux (coiffeurs, consultations médicales, ressources).',
  entities: ['Resource', 'Appointment', 'Customer', 'ScheduleBlock', 'Review'],
  relations: [
    'Resource has Many Appointments (1:N)',
    'Customer has Many Appointments (1:N)',
    'Appointment has One Review (1:1)'
  ],
  roles: ['Client', 'Prestataire', 'Administrateur Planning'],
  kpis: [
    { label: 'Rendez-vous Planifiés', value: '234', change: '+15.2%', positive: true },
    { label: 'Taux de No-Show', value: '1.2%', change: '-0.5%', positive: true },
    { label: 'Note Moyenne Review', value: '4.9/5', change: '+0.2', positive: true },
    { label: 'Revenu du Mois', value: '14,892.00 €', change: '+8.1%', positive: true }
  ],
  umlData: {
    classes: [
      { name: 'Resource', attributes: ['id: int', 'name: string', 'type: string', 'capacity: int'], methods: ['checkAvailability()'] },
      { name: 'Appointment', attributes: ['id: int', 'customer_id: int', 'resource_id: int', 'appointment_time: datetime', 'duration_minutes: int', 'status: string'], methods: ['reschedule()', 'cancel()'] },
      { name: 'Customer', attributes: ['id: int', 'name: string', 'phone: string', 'email: string'], methods: ['bookAppointment()'] }
    ],
    links: [
      { from: 'Customer', to: 'Appointment', type: 'one-to-many', label: '1..N (Books)' },
      { from: 'Resource', to: 'Appointment', type: 'one-to-many', label: '1..N (Allocated)' }
    ],
    useCases: [
      { actor: 'Client', cases: ['Parcourir les créneaux disponibles', 'Réserver un rendez-vous', 'Modifier ma réservation', 'Payer un acompte'] },
      { actor: 'Prestataire', cases: ['Configurer mes horaires de travail', 'Valider un rendez-vous', 'Gérer les indisponibilités'] }
    ]
  },
  files: [
    {
      name: 'App.jsx',
      path: 'frontend/src/App.jsx',
      language: 'javascript',
      content: `import React, { useState } from 'react';
import { CalendarDays, Clock, ShieldAlert, Award, Star } from 'lucide-react';

export default function App() {
  const [appointments] = useState([
    { id: 1, name: "Consultation Cabinet A", time: "10:30 - 11:00", date: "29 Mai 2026", client: "Sophie R." },
    { id: 2, name: "Contrôle Semestriel", time: "14:00 - 14:30", date: "29 Mai 2026", client: "Luc B." },
    { id: 3, name: "Soin Premium", time: "16:15 - 17:15", date: "29 Mai 2026", client: "Karim H." }
  ]);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      <header className="bg-violet-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <CalendarDays /> BookySpace Appointments
        </h1>
        <div className="bg-violet-850 px-3 py-1 rounded text-sm">
          Calendrier Actif
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Clock /> Agenda du Jour</h2>
          {appointments.map(apt => (
            <div key={apt.id} className="bg-white p-5 border border-slate-200 rounded-lg flex justify-between items-center shadow-sm">
              <div className="flex gap-4 items-center">
                <div className="bg-violet-50 p-3 rounded-full text-violet-600"><Clock /></div>
                <div>
                  <h3 className="font-semibold text-md text-slate-900">{apt.name}</h3>
                  <p className="text-xs text-slate-500">Client : {apt.client}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {apt.time}
                </span>
                <p className="text-xs text-slate-400 mt-2">{apt.date}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 border rounded-lg shadow-sm space-y-4 h-fit">
          <h2 className="text-md font-bold text-violet-700 pb-2 border-b">Réserver un créneau</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Nom Complet</label>
              <input type="text" className="w-full bg-slate-50 border rounded p-2 text-sm" placeholder="Ex. Arthur Pendragon" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Sélectionner un Service</label>
              <select className="w-full bg-slate-50 border rounded p-2 text-sm">
                <option>Consultation Simple</option>
                <option>Soin Premium</option>
                <option>Contrôle Général</option>
              </select>
            </div>
            <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded text-sm transition">
              Vérifier les disponibilités
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}`
    },
    {
      name: 'schema.sql',
      path: 'database/schema.sql',
      language: 'sql',
      content: `-- Schema for general reservation portal
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  capacity INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  resource_id INT,
  appointment_time DATETIME NOT NULL,
  duration_minutes INT DEFAULT 30,
  status VARCHAR(20) DEFAULT 'SCHEDULED',
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (resource_id) REFERENCES resources(id)
);`
    }
  ]
};

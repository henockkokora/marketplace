const dotenv = require('dotenv');
const result = dotenv.config({ path: __dirname + '/.env' });

if (result.error) {
  console.error('Erreur de chargement du fichier .env:', result.error);
} else {
  console.log('Fichier .env chargé avec succès');
  console.log('JWT_SECRET défini:', !!process.env.JWT_SECRET);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const Admin = require('./models/Admin');
const categoriesRouter = require('./routes/categories');
const subcategoriesRouter = require('./routes/subcategories');
const subsubcategoriesRouter = require('./routes/subsubcategories');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const analyticsRouter = require('./routes/analytics');

const app = express();

// Gestion des erreurs non attrapées
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Configuration CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (comme les applications mobiles ou Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// Middleware pour parser le JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware de journalisation (désactivé en production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    next();
  });
}

// Configuration des fichiers statiques
const setupStaticFiles = () => {
  const dirs = [
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'uploads', 'products')
  ];

  dirs.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Dossier créé: ${dir}`);
      }
    } catch (err) {
      console.error(`Erreur création dossier ${dir}:`, err);
    }
  });

  // Servir les fichiers statiques
  app.use('/uploads', express.static(dirs[0], {
    etag: true,
    lastModified: true,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }));
};

// Initialisation des fichiers statiques
setupStaticFiles();

// Log des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/categories/:categoryId/subcategories', subcategoriesRouter);
app.use('/api/subcategories', subcategoriesRouter); // Nouvelle route pour toutes les sous-catégories
app.use('/api/categories/:categoryId/subcategories/:subcategoryId/subsubcategories', subsubcategoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/analytics', analyticsRouter);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ 
    error: 'Une erreur est survenue sur le serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Fonction pour créer un admin par défaut
async function createAdminIfNotExists() {
  try {
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin existe déjà');
      return;
    }

    const hashedPassword = await bcrypt.hash('ecefa2025', 10);
    const admin = new Admin({
      username: 'admin',
      password: hashedPassword,
    });

    await admin.save();
    console.log('Admin créé avec succès');
  } catch (err) {
    console.error('Erreur création admin:', err);
    throw err;
  }
}

// Gestion de la fermeture propre
const shutdown = async () => {
  console.log('Fermeture du serveur...');
  await mongoose.connection.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Connexion à MongoDB et démarrage du serveur
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB connecté');
    await createAdminIfNotExists();
    
    const PORT = process.env.PORT || 4000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Le port ${PORT} est déjà utilisé`);
      } else {
        console.error('❌ Erreur du serveur:', err);
      }
      process.exit(1);
    });

  } catch (err) {
    console.error('❌ Erreur de démarrage du serveur:', err);
    process.exit(1);
  }
};

startServer();

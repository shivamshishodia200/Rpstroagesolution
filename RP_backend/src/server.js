import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cityProductRoutes from './routes/cityProductRoutes.js';
import cityHomepageRoutes from './routes/cityHomepageRoutes.js';
import productCityMappingRoutes from './routes/productCityMappingRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import stateRoutes from './routes/stateRoutes.js';
import homepageRoutes from './routes/homepageRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import userRoutes from './routes/userRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js';
import { seoRenderMiddleware } from './services/seoRenderer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security & Parsing Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration
const allowedDevOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
];

const allowedProdOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'https://www.rpstoragesolution.com',
  'https://rpstoragesolution.com',
  'https://admin.rpstoragesolution.com',
].filter(Boolean);

const isProduction = process.env.NODE_ENV === 'production';

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl, health probes)
    if (!origin) return callback(null, true);

    // Development & Staging: allow explicit development origins and localhost range
    if (!isProduction) {
      if (
        allowedDevOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):(517[0-9]|3000|5000|5001)$/.test(origin) ||
        allowedProdOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: Origin ${origin} not permitted in development allowlist.`));
    }

    // Production: strictly enforce verified domains + render.com preview/live domains
    if (allowedProdOrigins.includes(origin) || (typeof origin === 'string' && origin.endsWith('.onrender.com'))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: Origin ${origin} not permitted.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static Uploads
app.use('/uploads', express.static(path.resolve('uploads')));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'RP Storage Solution Backend', timestamp: new Date() });
});

// Dynamic XML Sitemaps
app.use('/', sitemapRoutes);

// Public Content Routes
app.use('/api/public', publicRoutes);

// Protected Admin Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/cities', cityRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/states', stateRoutes);
app.use('/api/admin/city-products', cityProductRoutes);
app.use('/api/admin/city-homepages', cityHomepageRoutes);
app.use('/api/admin/product-city-mappings', productCityMappingRoutes);
app.use('/api/admin/homepage', homepageRoutes);
app.use('/api/admin/enquiries', enquiryRoutes);
app.use('/api/admin/seo', seoRoutes);
app.use('/api/admin/media', mediaRoutes);
app.use('/api/admin', userRoutes);

// Static Client Assets (if production build exists)
const clientDistPath = fs.existsSync(path.resolve('../dist'))
  ? path.resolve('../dist')
  : fs.existsSync(path.resolve('dist'))
  ? path.resolve('dist')
  : null;

if (clientDistPath) {
  const assetsPath = path.join(clientDistPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    app.use('/assets', express.static(assetsPath, { maxAge: '1y', immutable: true }));
  }
  app.use(express.static(clientDistPath, { index: false, maxAge: '1h' }));
}

// Universal Production SEO Server Rendering Middleware
// Ordinary visitors and crawlers receive equivalent semantic HTML, metadata, and pre-hydrated state
app.use(seoRenderMiddleware);

// API 404 Fallback
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint '${req.originalUrl}' not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` RP Storage Solution Backend Running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Public APIs: http://localhost:${PORT}/api/public`);
  console.log(` Admin APIs:  http://localhost:${PORT}/api/admin`);
  console.log(` Sitemaps:    http://localhost:${PORT}/sitemap.xml`);
  console.log(`======================================================\n`);
});

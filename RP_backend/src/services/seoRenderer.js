import fs from 'fs';
import path from 'path';
import { City } from '../models/City.js';
import { Product } from '../models/Product.js';
import { CityProduct } from '../models/CityProduct.js';
import { ProductCityMapping } from '../models/ProductCityMapping.js';
import { Redirect } from '../models/Redirect.js';
import { resolveHomepageContent } from './homepageResolver.js';
import { resolveProductUrlsBulk } from './productUrlResolver.js';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  generateProductSchema,
  generateLocalBusinessSchema,
} from './schemaService.js';
import crypto from 'crypto';
import {
  getPageCache,
  setPageCache,
  invalidateRoute,
  invalidateCityCache,
  invalidateProductCache,
  purgeAllCache,
} from './cacheManager.js';

function verifyDraftPreviewToken(token, recordId) {
  if (!token || !recordId) return false;
  const parts = String(token).split('.');
  if (parts.length !== 2) return false;
  const [expiresAtStr, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() >= expiresAt) return false;

  const secret = process.env.JWT_SECRET || 'rp-storage-preview-secret-key-development';
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${recordId}:${expiresAt}`)
    .digest('hex');
  return signature === expectedSig;
}

const BASE_URL = process.env.BASE_URL || 'https://www.rpstoragesolution.com';

// Forward legacy purgeSeoCache to cacheManager for backwards compatibility
export const purgeSeoCache = () => {
  purgeAllCache('Legacy purgeSeoCache invocation');
};

/**
 * Escapes unsafe characters for HTML text insertion
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips HTML tags for clean meta descriptions
 */
function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect client asset bundles from dist directory if available
 */
let clientAssetsCache = null;
function getClientAssets() {
  if (clientAssetsCache) return clientAssetsCache;

  const distDir = path.resolve(process.cwd(), '..', 'dist');
  const localDistDir = path.resolve(process.cwd(), 'dist');
  const targetDir = fs.existsSync(distDir) ? distDir : fs.existsSync(localDistDir) ? localDistDir : null;

  if (targetDir) {
    const assetsDir = path.join(targetDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      const jsFile = files.find((f) => f.startsWith('index-') && f.endsWith('.js'));
      const cssFile = files.find((f) => f.startsWith('index-') && f.endsWith('.css'));
      if (jsFile && cssFile) {
        clientAssetsCache = {
          js: `/assets/${jsFile}`,
          css: `/assets/${cssFile}`,
        };
        return clientAssetsCache;
      }
    }
  }

  // Fallback default assets if dist not pre-built
  clientAssetsCache = {
    js: '/assets/index-BMEW4f8q.js',
    css: '/assets/index-DStUbM9g.css',
  };
  return clientAssetsCache;
}

/**
 * Common HTML Shell Builder
 */
function buildHtmlDocument({
  title,
  description,
  canonical,
  noindex = false,
  bodyContentHtml,
  initialData = null,
  schemas = [],
  ogImage = `${BASE_URL}/images/banner3.jpeg`,
  extraHeaders = '',
}) {
  const assets = getClientAssets();
  const robotsDirective = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const schemaScripts = schemas
    .filter(Boolean)
    .map((s) => `  <script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n  </script>`)
    .join('\n');

  const initialDataScript = initialData
    ? `  <script>\n    window.__INITIAL_DATA__ = ${JSON.stringify(initialData).replace(/</g, '\\u003c')};\n  </script>`
    : '';

  return `<!doctype html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="title" content="${escapeHtml(title)}" />
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="${robotsDirective}" />

  <!-- Open Graph / Social -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:site_name" content="RP Storage Solution" />
  <meta property="og:locale" content="en_IN" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonical}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImage}" />

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/images/logorp.png" />
  <link rel="apple-touch-icon" href="/images/logorp.png" />
  <meta name="theme-color" content="#FFFFFF" />

  <!-- Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet" />

  <!-- Client Application Stylesheet -->
  <link rel="stylesheet" crossorigin href="${assets.css}" />
  <style>
    /* Standalone Critical Fallback Styles */
    :root { --brand-orange: #E85B12; --brand-navy: #1B2A4A; --brand-dark: #161616; --brand-bg: #F8FAFC; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #161616; background-color: #FFFFFF; margin: 0; line-height: 1.6; }
    .site-nav { background: #FFFFFF; border-bottom: 1px solid #E2E8F0; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
    .site-brand { font-size: 1.25rem; font-weight: 800; color: #1B2A4A; text-decoration: none; display: flex; align-items: center; gap: 8px; }
    .site-brand span { color: #E85B12; }
    .site-links { display: flex; align-items: center; gap: 20px; }
    .site-links a { color: #475569; text-decoration: none; font-size: 0.95rem; font-weight: 500; }
    .site-links a:hover { color: #E85B12; }
    .btn-quote { background: #E85B12; color: #FFFFFF !important; padding: 8px 18px; border-radius: 6px; font-weight: 600; }
    .content-container { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }
    .breadcrumb-bar { font-size: 0.875rem; color: #64748B; margin-bottom: 24px; }
    .breadcrumb-bar a { color: #64748B; text-decoration: none; }
    .breadcrumb-bar a:hover { color: #E85B12; }
    .hero-heading { font-size: 2.25rem; font-weight: 800; color: #0F172A; line-height: 1.25; margin: 12px 0 16px; }
    .badge-pill { display: inline-flex; align-items: center; gap: 6px; background: #FFF3EB; color: #E85B12; border: 1px solid #FED7AA; font-size: 0.8125rem; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; }
    .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 32px; }
    .card-item { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; transition: border-color 0.2s, box-shadow 0.2s; }
    .card-item:hover { border-color: #E85B12; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
    .spec-table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 0.95rem; }
    .spec-table th, .spec-table td { padding: 12px 16px; border-bottom: 1px solid #E2E8F0; text-align: left; }
    .spec-table th { background: #F8FAFC; color: #334155; font-weight: 600; width: 35%; }
    .faq-block { margin-top: 48px; border-top: 1px solid #E2E8F0; padding-top: 40px; }
    .faq-item { margin-bottom: 16px; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px 20px; background: #FAFAFA; }
    .faq-question { font-weight: 700; color: #0F172A; font-size: 1.05rem; margin-bottom: 8px; }
    .faq-answer { color: #475569; font-size: 0.95rem; line-height: 1.6; }
    .cta-banner { background: #1B2A4A; color: #FFFFFF; border-radius: 16px; padding: 48px 32px; margin-top: 56px; text-align: center; }
    .cta-banner h2 { font-size: 1.875rem; font-weight: 800; margin-bottom: 12px; }
    .cta-banner p { color: #CBD5E1; max-width: 680px; margin: 0 auto 28px; font-size: 1.05rem; }
    .site-footer { background: #0B132B; color: #94A3B8; padding: 60px 24px 32px; margin-top: 80px; font-size: 0.9rem; }
    .footer-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 40px; }
    .footer-col h4 { color: #FFFFFF; font-weight: 700; margin-bottom: 16px; }
    .footer-col ul { list-style: none; padding: 0; margin: 0; }
    .footer-col li { margin-bottom: 10px; }
    .footer-col a { color: #94A3B8; text-decoration: none; }
    .footer-col a:hover { color: #E85B12; }
    .footer-bottom { max-width: 1200px; margin: 40px auto 0; padding-top: 24px; border-top: 1px solid #1E293B; text-align: center; font-size: 0.8125rem; color: #64748B; }
  </style>

${schemaScripts}
${initialDataScript}
${extraHeaders}
</head>
<body class="bg-white text-slate-900 font-sans antialiased selection:bg-orange-500 selection:text-white">
  <div id="root">
${bodyContentHtml}
  </div>

  <!-- Client React Application Bundle for Isomorphic Hydration -->
  <script type="module" crossorigin src="${assets.js}"></script>
</body>
</html>`;
}

/**
 * Universal Shared Layout Elements
 */
function renderHeader() {
  return `  <header class="site-nav">
    <a href="/" class="site-brand">
      <img src="/images/logorp.png" alt="RP Storage Solution" style="height: 38px; width: auto;" onerror="this.style.display='none'" />
      <span>RP STORAGE</span> SOLUTION
    </a>
    <nav class="site-links">
      <a href="/">Home</a>
      <a href="/products">Products</a>
      <a href="/locations">Locations</a>
      <a href="tel:+919990023436" class="site-phone font-semibold text-orange-600">📞 +91 99900 23436</a>
      <a href="/products" class="btn-quote">Request Factory Quote</a>
    </nav>
  </header>`;
}

function renderFooter() {
  return `  <footer class="site-footer">
    <div class="footer-grid">
      <div class="footer-col">
        <h4>RP Storage Solution</h4>
        <p>India's leading ISO 9001:2015 certified manufacturer of heavy-duty industrial warehouse racking systems and supermarket retail fixtures.</p>
        <p style="margin-top: 12px; color: #E2E8F0;">Direct Factory: Kh No. 13/7, Nangali Sakrawati, Najafgarh, New Delhi 110043</p>
      </div>
      <div class="footer-col">
        <h4>Core Product Lines</h4>
        <ul>
          <li><a href="/products/heavy-duty-pallet-rack">Heavy Duty Pallet Racks</a></li>
          <li><a href="/products/supermarket-display-rack">Supermarket Display Racks</a></li>
          <li><a href="/products/multi-tier-mezzanine-floor">Mezzanine Storage Floors</a></li>
          <li><a href="/products/heavy-duty-cantilever-rack">Cantilever Storage Racks</a></li>
          <li><a href="/products">View Complete Catalog &rarr;</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Key Service Areas</h4>
        <ul>
          <li><a href="/locations/delhi">Delhi Industrial Hub</a></li>
          <li><a href="/locations/gurgaon">Gurgaon Logistics Corridor</a></li>
          <li><a href="/locations/noida">Noida / Greater Noida Hub</a></li>
          <li><a href="/locations/faridabad">Faridabad Manufacturing Belt</a></li>
          <li><a href="/locations">All Verified Delivery Hubs &rarr;</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Engineering Desk</h4>
        <p>Phone: <a href="tel:+919990023436" style="color: #FFF;">+91 99900 23436</a></p>
        <p>Email: <a href="mailto:rpstoragesolution12@gmail.com" style="color: #FFF;">rpstoragesolution12@gmail.com</a></p>
        <p style="margin-top: 12px; font-size: 0.8125rem;">Standard Dispatch: 24–48 Hours Across NCR with Certified Site Rigging.</p>
      </div>
    </div>
    <div class="footer-bottom">
      &copy; ${new Date().getFullYear()} RP Storage Solution. All Rights Reserved. ISO 9001:2015 Certified Manufacturing Facility.
    </div>
  </footer>`;
}

function renderBreadcrumbHtml(crumbs = []) {
  const items = crumbs.map((crumb, idx) => {
    if (idx === crumbs.length - 1) {
      return `<span>${escapeHtml(crumb.name)}</span>`;
    }
    return `<a href="${crumb.url}">${escapeHtml(crumb.name)}</a> &rsaquo; `;
  }).join('');
  return `<div class="breadcrumb-bar">${items}</div>`;
}

/**
 * SEO Rendering Middleware
 * Handles all public HTML routes with 100% semantic HTML, JSON-LD, and pre-hydration state.
 */
export const seoRenderMiddleware = async (req, res, next) => {
  if (req.method !== 'GET') return next();

  const rawPath = req.path.toLowerCase().replace(/\/$/, '') || '/';
  const query = req.query || {};

  // Bypass API, uploads, health, and static asset extensions
  if (
    rawPath.startsWith('/api') ||
    rawPath.startsWith('/uploads') ||
    rawPath.includes('.') ||
    rawPath === '/health'
  ) {
    return next();
  }

  const isPreview = query.preview === 'true';
  const previewToken = query.token;

  try {
    // 1. Check for Active 301/308 / 302 Redirects
    const redirect = await Redirect.findOne({
      sourcePath: { $in: [rawPath, `${rawPath}/`] },
      isActive: true,
    });
    if (redirect) {
      redirect.hitCount = (redirect.hitCount || 0) + 1;
      await redirect.save();
      const code = redirect.statusCode === 308 ? 308 : redirect.statusCode === 302 ? 302 : 301;
      return res.redirect(code, redirect.targetPath);
    }

    // 2. Draft Preview Security Handling
    if (isPreview) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    } else {
      // Check Cache for normal public requests
      const cached = getPageCache(rawPath);
      if (cached) {
        res.status(cached.status);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-SEO-Cache', 'HIT');
        res.setHeader('X-Robots-Tag', cached.noindex ? 'noindex, nofollow' : 'index, follow');
        return res.send(cached.html);
      }
    }

    // Standard Organization & WebSite Schemas
    const orgSchema = generateOrganizationSchema();
    const webSiteSchema = generateWebSiteSchema();

    // =========================================================================
    // ROUTE A: Dynamic City + Product SEO Landing Page (/locations/:city/:product)
    // =========================================================================
    const cityProductMatch = rawPath.match(/^\/locations\/([a-z0-9-]+)\/([a-z0-9-]+)$/);
    if (cityProductMatch) {
      const [, citySlug, productSlug] = cityProductMatch;
      const combinedSlug = `${citySlug}/${productSlug}`;

      let cp = null;
      let isAuthorizedPreview = false;

      if (isPreview && previewToken) {
        const candidate = await CityProduct.findOne({ slug: combinedSlug })
          .populate('city')
          .populate('product')
          .lean();
        if (candidate && verifyDraftPreviewToken(previewToken, candidate._id)) {
          cp = candidate;
          isAuthorizedPreview = true;
        }
      }

      if (!isAuthorizedPreview) {
        cp = await CityProduct.findOne({ slug: combinedSlug, status: 'published' })
          .populate('city')
          .populate('product')
          .lean();
      }

      let isValidCombination = false;
      if (
        cp &&
        cp.city &&
        (isAuthorizedPreview || (cp.city.status === 'published' && cp.city.isVerified)) &&
        cp.product &&
        (isAuthorizedPreview || (cp.product.status === 'published' && cp.product.isActive))
      ) {
        const mapping = await ProductCityMapping.findOne({
          product: cp.product._id,
          city: cp.city._id,
          isAvailable: true,
        }).lean();

        if (mapping || isAuthorizedPreview) {
          isValidCombination = true;
        }
      }

      if (!isValidCombination) {
        const notFoundTitle = 'Product or Service Hub Not Available | RP Storage Solution';
        const notFoundDesc = 'The requested industrial storage product is not mapped or verified for supply in this city delivery sector.';
        const bodyHtml = `${renderHeader()}
<main class="content-container text-center" style="padding: 80px 24px;">
  <span class="badge-pill" style="color: #DC2626; background: #FEF2F2; border-color: #FECACA;">404 Delivery Status</span>
  <h1 class="hero-heading" style="margin-top: 16px;">Product Not Available In This Location</h1>
  <p style="max-width: 600px; margin: 0 auto 32px; color: #64748B;">
    We could not verify active dispatch or inventory mapping for <strong>${escapeHtml(productSlug)}</strong> in <strong>${escapeHtml(citySlug)}</strong>.
  </p>
  <div style="display: flex; justify-content: center; gap: 16px;">
    <a href="/locations" class="btn-quote" style="background: #1B2A4A;">Browse Verified Cities</a>
    <a href="/products" class="btn-quote">Explore Product Catalog</a>
  </div>
</main>
${renderFooter()}`;

        const html = buildHtmlDocument({
          title: notFoundTitle,
          description: notFoundDesc,
          canonical: `${BASE_URL}${rawPath}`,
          noindex: true,
          bodyContentHtml: bodyHtml,
          schemas: [orgSchema],
        });

        res.status(404);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        return res.send(html);
      }

      // Valid City Product Page Render
      const pageTitle = cp.seoTitle || `${cp.productName} in ${cp.cityName} | Direct Factory Manufacturer`;
      const metaDesc = cp.metaDescription || `Heavy-duty ${cp.productName} manufacturer in ${cp.cityName}. Direct factory pricing, IS 2062 certified structural steel, 48-hr dispatch & on-site rigging.`;
      const canonical = cp.canonicalUrl || `${BASE_URL}/locations/${combinedSlug}`;
      const h1Heading = cp.h1Heading || `${cp.productName} Manufacturer in ${cp.cityName}`;
      const effectiveNoindex = isAuthorizedPreview || cp.noIndex === true;

      // Other Products in this City
      const otherMappings = await ProductCityMapping.find({ city: cp.city._id, isAvailable: true })
        .populate('product', 'name slug shortDesc')
        .limit(6)
        .lean();

      const otherProducts = otherMappings
        .filter((m) => m.product && m.product.slug !== productSlug)
        .map((m) => m.product);

      // JSON-LD Schemas
      const crumbs = [
        { name: 'Home', url: '/' },
        { name: 'Locations', url: '/locations' },
        { name: cp.cityName, url: `/locations/${citySlug}` },
        { name: cp.productName, url: `/locations/${combinedSlug}` },
      ];
      const breadcrumbSchema = generateBreadcrumbSchema(crumbs);
      const productSchema = generateProductSchema({
        product: {
          name: `${cp.productName} in ${cp.cityName}`,
          metaDescription: metaDesc,
          slug: combinedSlug,
          images: cp.product?.images,
          image: cp.product?.image,
        },
        city: cp.city,
        canonicalUrl: canonical,
      });
      const localBusinessSchema = generateLocalBusinessSchema({
        city: cp.city,
        localInfo: {
          hubName: `RP Storage Solution - ${cp.cityName} Service Hub`,
          warehouseAddress: `${cp.cityName} Logistics & Industrial Corridor`,
          servicePhone: '+91-9990023436',
        },
        canonicalUrl: `${BASE_URL}/locations/${citySlug}`,
      });

      const initialData = {
        success: true,
        cityProduct: cp,
        otherCityProducts: otherProducts,
      };

      const defaultFaqs = [
        {
          q: `What is the certified load-bearing capacity for ${cp.productName} in ${cp.cityName}?`,
          a: `Every ${cp.productName} unit is engineered from high-yield IS 2062 Grade steel, supporting from 500 kg UDL up to 4,000 kg per pallet level. All installations undergo load-deflection testing adhering to IS 800 standards.`,
        },
        {
          q: `How quickly can installation and site assembly occur in ${cp.cityName}?`,
          a: `Factory direct shipments reach ${cp.cityName} within 24 to 48 hours. Our verified rigging crews complete on-site leveling, chemical floor anchoring, and safety handoff within 1 to 3 working days.`,
        },
        {
          q: `Can upright frames and shelf beam heights be reconfigured as our warehouse expands?`,
          a: `Yes. All upright frames feature 50mm pitch adjustable slotted hook connectors with safety locking pins, allowing seamless height repositioning without structural cutting.`,
        },
      ];
      const faqs = (cp.faqs && cp.faqs.length > 0) ? cp.faqs : defaultFaqs;

      const bodyHtml = `${renderHeader()}
<main class="content-container">
  ${renderBreadcrumbHtml(crumbs)}

  <div style="margin-top: 16px;">
    <span class="badge-pill">📍 Verified Industrial Hub: ${escapeHtml(cp.cityName)}</span>
    <h1 class="hero-heading">${escapeHtml(h1Heading)}</h1>
    <p style="font-size: 1.125rem; color: #475569; max-width: 860px; line-height: 1.7;">
      ${escapeHtml(stripHtml(cp.customContent) || metaDesc)}
    </p>
  </div>

  <!-- Key Engineering Highlights -->
  <div class="grid-cards">
    <div class="card-item">
      <h3 style="font-size: 1.1rem; font-weight: 700; color: #1B2A4A; margin-bottom: 8px;">🏭 Direct Factory Supply</h3>
      <p style="font-size: 0.925rem; color: #64748B;">Dispatched directly from our 50,000+ sq ft Najafgarh manufacturing plant. Zero distributor margins.</p>
    </div>
    <div class="card-item">
      <h3 style="font-size: 1.1rem; font-weight: 700; color: #1B2A4A; margin-bottom: 8px;">⏱️ 48-Hour Rapid Dispatch</h3>
      <p style="font-size: 0.925rem; color: #64748B;">Dedicated logistics corridor serving industrial zones across ${escapeHtml(cp.cityName)} and NCR.</p>
    </div>
    <div class="card-item">
      <h3 style="font-size: 1.1rem; font-weight: 700; color: #1B2A4A; margin-bottom: 8px;">🛡️ Certified IS 2062 Steel</h3>
      <p style="font-size: 0.925rem; color: #64748B;">Precision roll-formed high-tensile steel with multi-stage chemical degreasing & 7-tank powder coating.</p>
    </div>
  </div>

  <!-- Technical Specifications Table -->
  <div style="margin-top: 48px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin-bottom: 16px;">Verified Technical Specifications</h2>
    <table class="spec-table">
      <tbody>
        <tr>
          <th>Standard Material</th>
          <td>High-Yield Structural Steel (IS 2062 / IS 1079 Standard)</td>
        </tr>
        <tr>
          <th>Load Capacity</th>
          <td>500 kg to 4,000 kg UDL per shelf level (Custom Engineered)</td>
        </tr>
        <tr>
          <th>Surface Coating</th>
          <td>Electrostatically Applied Pure Polyester Powder Coating (70–90 Microns)</td>
        </tr>
        <tr>
          <th>Upright Pitch Adjustment</th>
          <td>50mm / 75mm Center-to-Center Adjustable Hook Connectors</td>
        </tr>
        <tr>
          <th>Local Service Coverage</th>
          <td>${escapeHtml(cp.cityName)}, ${escapeHtml(cp.city.state || 'Delhi NCR')} with On-Site Rigging</td>
        </tr>
        <tr>
          <th>Quality Certification</th>
          <td>ISO 9001:2015 Quality Management System Verified</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Rich Custom Content Section -->
  ${cp.customContent ? `<section style="margin-top: 40px; padding: 24px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
    <h2 style="font-size: 1.35rem; font-weight: 700; color: #1E293B; margin-bottom: 16px;">Application Overview & Engineering Details</h2>
    <div style="color: #334155; line-height: 1.7;">${cp.customContent}</div>
  </section>` : ''}

  <!-- FAQ Section -->
  <section class="faq-block">
    <h2 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin-bottom: 24px;">Frequently Asked Questions in ${escapeHtml(cp.cityName)}</h2>
    <div>
      ${faqs.map((faq) => `
      <div class="faq-item">
        <div class="faq-question">${escapeHtml(faq.q)}</div>
        <div class="faq-answer">${escapeHtml(faq.a)}</div>
      </div>`).join('')}
    </div>
  </section>

  <!-- Internal Cross Links -->
  <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #E2E8F0;">
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #0F172A; margin-bottom: 16px;">Other Available Storage Systems in ${escapeHtml(cp.cityName)}</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 12px;">
      ${otherProducts.map((p) => `
        <a href="/locations/${citySlug}/${p.slug}" style="background: #FFFFFF; border: 1px solid #CBD5E1; color: #334155; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 0.9rem; font-weight: 500;">
          ${escapeHtml(p.name)} in ${escapeHtml(cp.cityName)} &rarr;
        </a>
      `).join('')}
      <a href="/products/${productSlug}" style="background: #FFF3EB; border: 1px solid #FED7AA; color: #E85B12; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 0.9rem; font-weight: 600;">
        Master Catalog Specifications for ${escapeHtml(cp.productName)} &rarr;
      </a>
    </div>
  </div>

  <!-- Direct Technical Quotation CTA -->
  <div class="cta-banner">
    <h2>Order Factory-Direct ${escapeHtml(cp.productName)} in ${escapeHtml(cp.cityName)}</h2>
    <p>Get instant layout drawings, certified weight distribution calculations, and direct factory pricing within 2 hours.</p>
    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
      <a href="tel:+919990023436" class="btn-quote" style="background: #FFFFFF; color: #1B2A4A !important; font-size: 1.05rem;">
        📞 Call Technical Desk: +91 99900 23436
      </a>
      <a href="mailto:rpstoragesolution12@gmail.com" class="btn-quote" style="font-size: 1.05rem;">
        ✉️ Submit Layout Blueprint
      </a>
    </div>
  </div>
</main>
${renderFooter()}`;

      const html = buildHtmlDocument({
        title: pageTitle,
        description: metaDesc,
        canonical,
        noindex: effectiveNoindex,
        bodyContentHtml: bodyHtml,
        initialData,
        schemas: [orgSchema, webSiteSchema, breadcrumbSchema, productSchema, localBusinessSchema],
      });

      if (!isAuthorizedPreview && cp.status === 'published' && !effectiveNoindex) {
        setPageCache(rawPath, { status: 200, html, noindex: false });
      }

      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-SEO-Cache', 'MISS');
      res.setHeader('X-Robots-Tag', effectiveNoindex ? 'noindex, nofollow' : 'index, follow');
      return res.send(html);
    }

    // =========================================================================
    // ROUTE B: Dynamic City Landing Page (/locations/:citySlug)
    // =========================================================================
    else if (rawPath.startsWith('/locations/') && rawPath.split('/').length === 3) {
      const citySlug = rawPath.split('/')[2];
      const city = await City.findOne({ slug: citySlug, status: 'published', isVerified: true }).lean();

      if (!city) {
        const notFoundTitle = 'Delivery Hub Not Verified | RP Storage Solution';
        const notFoundDesc = 'The requested city hub is currently unverified or not active for direct factory delivery.';
        const bodyHtml = `${renderHeader()}
<main class="content-container text-center" style="padding: 80px 24px;">
  <span class="badge-pill" style="color: #DC2626; background: #FEF2F2; border-color: #FECACA;">404 Location Status</span>
  <h1 class="hero-heading" style="margin-top: 16px;">Delivery Hub Not Verified</h1>
  <p style="max-width: 600px; margin: 0 auto 32px; color: #64748B;">
    We could not locate an authorized RP Storage Solution distribution hub for <strong>${escapeHtml(citySlug)}</strong>.
  </p>
  <a href="/locations" class="btn-quote">View Verified Delivery Hubs</a>
</main>
${renderFooter()}`;

        const html = buildHtmlDocument({
          title: notFoundTitle,
          description: notFoundDesc,
          canonical: `${BASE_URL}${rawPath}`,
          noindex: true,
          bodyContentHtml: bodyHtml,
          schemas: [orgSchema],
        });

        res.status(404);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        return res.send(html);
      }

      // Resolve City Homepage Content (Phase 8)
      let resolved = null;
      try {
        resolved = await resolveHomepageContent({ citySlug });
      } catch (e) {
        // Fallback to safe defaults
      }

      // Valid City Landing Page Render
      const pageTitle = resolved?.seo?.title || city.seoTitle || `Industrial Warehouse Racks & Supermarket Display Shelving in ${city.name} | RP Storage Solution`;
      const metaDesc = resolved?.seo?.description || city.metaDescription || `Leading manufacturer of heavy-duty pallet racking systems, mezzanine floors & supermarket display racks in ${city.name}. Direct factory pricing & rapid installation.`;
      const canonical = resolved?.seo?.canonicalUrl || city.canonicalUrl || `${BASE_URL}/locations/${city.slug}`;
      const h1Heading = resolved?.seo?.h1 || city.h1Heading || `Industrial Storage & Supermarket Racks in ${city.name}`;

      // Fetch Available Mapped Products for this City
      const mappings = await ProductCityMapping.find({ city: city._id, isAvailable: true })
        .populate('product', 'name slug shortDesc image')
        .lean();

      const rawProducts = mappings.filter((m) => m.product && m.product.name).map((m) => m.product);
      const availableProducts = await resolveProductUrlsBulk(rawProducts, city);

      // Schemas
      const crumbs = [
        { name: 'Home', url: '/' },
        { name: 'Locations', url: '/locations' },
        { name: city.name, url: `/locations/${city.slug}` },
      ];
      const breadcrumbSchema = generateBreadcrumbSchema(crumbs);
      const localBusinessSchema = generateLocalBusinessSchema({
        city,
        localInfo: {
          hubName: `RP Storage Solution - ${city.name} Service Hub`,
          warehouseAddress: `${city.name} Distribution Center, ${city.state}`,
          servicePhone: '+91-9990023436',
        },
        canonicalUrl: canonical,
      });

      const initialData = {
        success: true,
        city,
        availableProducts,
        sections: resolved?.sections || {},
        seo: resolved?.seo || {},
        isCityHomepage: true,
      };

      const bodyHtml = `${renderHeader()}
<main class="content-container">
  ${renderBreadcrumbHtml(crumbs)}

  <div style="margin-top: 16px;">
    <span class="badge-pill">📍 Verified Distribution Hub — ${escapeHtml(city.name)}, ${escapeHtml(city.state)}</span>
    <h1 class="hero-heading">${escapeHtml(h1Heading)}</h1>
    <p style="font-size: 1.125rem; color: #475569; max-width: 860px; line-height: 1.7;">
      ${escapeHtml(city.introContent || city.description || metaDesc)}
    </p>
  </div>

  <!-- Available Storage Systems in City -->
  <div style="margin-top: 48px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin-bottom: 24px;">Available Engineered Storage Systems in ${escapeHtml(city.name)}</h2>
    <div class="grid-cards">
      ${availableProducts.map((p) => `
      <div class="card-item">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: #0F172A; margin-bottom: 8px;">${escapeHtml(p.name)}</h3>
        <p style="font-size: 0.925rem; color: #64748B; margin-bottom: 16px;">${escapeHtml(p.shortDesc || `Factory direct supply and certified installation of ${p.name} across ${city.name}.`)}</p>
        <a href="${p.targetUrl}" style="color: #E85B12; font-weight: 600; text-decoration: none; font-size: 0.95rem;">
          View ${escapeHtml(city.name)} Specifications &rarr;
        </a>
      </div>`).join('')}
    </div>
  </div>

  <!-- Local Service Hub Capabilities -->
  <div style="margin-top: 56px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 36px 32px;">
    <h2 style="font-size: 1.4rem; font-weight: 700; color: #1E293B; margin-bottom: 16px;">Local Warehouse Installation & Support in ${escapeHtml(city.name)}</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; color: #475569; font-size: 0.95rem;">
      <div>
        <strong style="color: #0F172A; display: block; margin-bottom: 4px;">🚚 Direct Fleet Dispatch:</strong>
        Daily scheduled shipments directly to manufacturing zones and 3PL warehouses across ${escapeHtml(city.name)}.
      </div>
      <div>
        <strong style="color: #0F172A; display: block; margin-bottom: 4px;">📐 Free CAD Site Survey:</strong>
        Our structural engineers visit your ${escapeHtml(city.name)} facility for precise floor leveling and load-bearing measurements.
      </div>
      <div>
        <strong style="color: #0F172A; display: block; margin-bottom: 4px;">🔨 Certified Rigger Crews:</strong>
        In-house installation technicians compliant with OSHA and IS industrial safety standards.
      </div>
    </div>
  </div>

  <!-- Direct Call CTA -->
  <div class="cta-banner">
    <h2>Setup Your Warehouse Storage in ${escapeHtml(city.name)}</h2>
    <p>Contact our regional industrial desk for layout planning, technical datasheets, and direct factory pricing.</p>
    <a href="tel:+919990023436" class="btn-quote" style="background: #FFFFFF; color: #1B2A4A !important; font-size: 1.05rem;">
      📞 Regional Desk: +91 99900 23436
    </a>
  </div>
</main>
${renderFooter()}`;

      const html = buildHtmlDocument({
        title: pageTitle,
        description: metaDesc,
        canonical,
        noindex: false,
        bodyContentHtml: bodyHtml,
        initialData,
        schemas: [orgSchema, webSiteSchema, breadcrumbSchema, localBusinessSchema],
      });

      setPageCache(rawPath, { status: 200, html, noindex: false });

      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-SEO-Cache', 'MISS');
      res.setHeader('X-Robots-Tag', 'index, follow');
      return res.send(html);
    }

    // =========================================================================
    // ROUTE C: Locations Directory (/locations)
    // =========================================================================
    else if (rawPath === '/locations') {
      const verifiedCities = await City.find({ status: 'published', isVerified: true })
        .select('name slug state description')
        .sort({ name: 1 })
        .lean();

      const pageTitle = 'Our Service Locations | RP Storage Solution';
      const metaDesc = "Explore RP Storage Solution's verified service areas and discover relevant storage solutions for your business.";
      const canonical = `${BASE_URL}/locations/`;

      const crumbs = [
        { name: 'Home', url: '/' },
        { name: 'Locations', url: '/locations/' },
      ];
      const breadcrumbSchema = generateBreadcrumbSchema(crumbs);

      const initialData = {
        success: true,
        cities: verifiedCities,
      };

      const bodyHtml = `${renderHeader()}
<main class="content-container" style="padding-top: 130px; padding-bottom: 80px; min-height: 70vh;">
  <div style="max-width: 900px; margin: 0 auto 40px;">
    <span class="badge-pill" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; color: #E85B12; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px;">📍 Verified Service Areas</span>
    <h1 class="hero-heading" style="font-size: 2.75rem; font-weight: 900; color: #161616; letter-spacing: -0.025em; line-height: 1.15; margin: 0 0 16px;">Our Service Locations</h1>
    <p style="font-size: 1.125rem; color: #525252; line-height: 1.7; margin: 0;">
      Explore RP Storage Solution's verified service areas and discover relevant storage solutions for your business.
    </p>
  </div>

  <div class="grid-cards" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
    ${verifiedCities.map((c) => `
    <div class="card-item" style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease;">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #E85B12; background: #FFF7ED; padding: 4px 10px; border-radius: 9999px; border: 1px solid #FFEDD5;">📍 Verified</span>
          <span style="font-size: 0.75rem; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(c.state || 'India')}</span>
        </div>
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #161616; margin: 0 0 10px;">${escapeHtml(c.name)}</h2>
        <p style="font-size: 0.875rem; color: #525252; line-height: 1.6; margin: 0 0 20px;">
          ${escapeHtml(c.description || `Verified industrial storage systems, heavy-duty racking, and retail display racks in ${c.name}.`)}
        </p>
      </div>
      <div style="padding-top: 16px; border-top: 1px solid #F3F4F6;">
        <a href="/locations/${c.slug}/" style="color: #161616; font-weight: 700; text-decoration: none; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 6px;">
          <span>Explore Location</span> &rarr;
        </a>
      </div>
    </div>`).join('')}
  </div>
</main>
${renderFooter()}`;

      const html = buildHtmlDocument({
        title: pageTitle,
        description: metaDesc,
        canonical,
        noindex: false,
        bodyContentHtml: bodyHtml,
        initialData,
        schemas: [orgSchema, webSiteSchema, breadcrumbSchema],
      });

      setPageCache(rawPath, { status: 200, html, noindex: false });

      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-SEO-Cache', 'MISS');
      res.setHeader('X-Robots-Tag', 'index, follow');
      return res.send(html);
    }

    // =========================================================================
    // ROUTE D: Product Detail Page (/products/:slug)
    // =========================================================================
    else if (rawPath.startsWith('/products/') && rawPath.split('/').length === 3) {
      const productSlug = rawPath.split('/')[2];
      const prod = await Product.findOne({ slug: productSlug, status: 'published', isActive: true }).lean();

      if (!prod) {
        const notFoundTitle = 'Product Not Found | RP Storage Solution';
        const notFoundDesc = 'The requested industrial storage product could not be located in our active manufacturing catalog.';
        const bodyHtml = `${renderHeader()}
<main class="content-container text-center" style="padding: 80px 24px;">
  <span class="badge-pill" style="color: #DC2626; background: #FEF2F2; border-color: #FECACA;">404 Catalog Status</span>
  <h1 class="hero-heading" style="margin-top: 16px;">Product Not Found</h1>
  <p style="max-width: 600px; margin: 0 auto 32px; color: #64748B;">
    We could not locate <strong>${escapeHtml(productSlug)}</strong> in our published catalog.
  </p>
  <a href="/products" class="btn-quote">Return to Catalog</a>
</main>
${renderFooter()}`;

        const html = buildHtmlDocument({
          title: notFoundTitle,
          description: notFoundDesc,
          canonical: `${BASE_URL}${rawPath}`,
          noindex: true,
          bodyContentHtml: bodyHtml,
          schemas: [orgSchema],
        });

        res.status(404);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        return res.send(html);
      }

      // Valid Product Detail Page Render
      const pageTitle = prod.seoTitle || `${prod.name} Manufacturer & Supplier | RP Storage Solution`;
      const metaDesc = prod.metaDescription || prod.shortDesc || `Heavy-duty ${prod.name} direct from manufacturer in Delhi NCR. High tensile steel, precision load deflection ratings, ISO 9001 certified.`;
      const canonical = prod.canonicalUrl || `${BASE_URL}/products/${prod.slug}`;
      const h1Heading = prod.name;

      // Available City Service Hubs for this Product
      const mappings = await ProductCityMapping.find({ product: prod._id, isAvailable: true })
        .populate('city', 'name slug isVerified status')
        .lean();

      const availableCities = mappings
        .filter((m) => m.city && m.city.isVerified && m.city.status === 'published')
        .map((m) => m.city);

      // Schemas
      const crumbs = [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        { name: prod.name, url: `/products/${prod.slug}` },
      ];
      const breadcrumbSchema = generateBreadcrumbSchema(crumbs);
      const productSchema = generateProductSchema({
        product: prod,
        canonicalUrl: canonical,
      });

      const initialData = {
        success: true,
        product: prod,
        availableCities,
      };

      const bodyHtml = `${renderHeader()}
<main class="content-container">
  ${renderBreadcrumbHtml(crumbs)}

  <div style="margin-top: 16px;">
    <span class="badge-pill">⚙️ ISO 9001:2015 Certified Manufacturing</span>
    <h1 class="hero-heading">${escapeHtml(h1Heading)}</h1>
    <p style="font-size: 1.125rem; color: #475569; max-width: 860px; line-height: 1.7;">
      ${escapeHtml(prod.shortDesc || prod.description || metaDesc)}
    </p>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; margin-top: 36px; align-items: start;">
    <div>
      <img
        src="${prod.image || '/images/gallery/mfg-1.jpg'}"
        alt="${escapeHtml(prod.name)}"
        style="width: 100%; border-radius: 12px; border: 1px solid #E2E8F0; max-height: 440px; object-fit: cover;"
      />
    </div>
    <div>
      <h2 style="font-size: 1.4rem; font-weight: 700; color: #0F172A; margin-bottom: 16px;">Standard Technical Parameters</h2>
      <table class="spec-table">
        <tbody>
          <tr>
            <th>Primary Application</th>
            <td>Industrial Warehouses, Retail Showrooms, Distribution Centers</td>
          </tr>
          <tr>
            <th>Steel Grade</th>
            <td>IS 2062 Structural High Tensile Steel</td>
          </tr>
          <tr>
            <th>Surface Finish</th>
            <td>Electrostatically Applied Pure Polyester Powder Coating</td>
          </tr>
          <tr>
            <th>Manufacturing Standard</th>
            <td>ISO 9001:2015 Quality Verified</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 24px; display: flex; gap: 16px;">
        <a href="tel:+919990023436" class="btn-quote" style="font-size: 1rem;">📞 Inquire Now</a>
        <a href="/locations" class="btn-quote" style="background: #1B2A4A; font-size: 1rem;">Check Delivery Hubs</a>
      </div>
    </div>
  </div>

  ${prod.detailedDesc ? `<div style="margin-top: 48px; padding: 28px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; line-height: 1.7; color: #334155;">
    <h2 style="font-size: 1.35rem; font-weight: 700; color: #1E293B; margin-bottom: 12px;">Engineering Overview</h2>
    ${prod.detailedDesc}
  </div>` : ''}

  <!-- Verified Cities for this Product -->
  <div style="margin-top: 56px;">
    <h3 style="font-size: 1.3rem; font-weight: 700; color: #0F172A; margin-bottom: 16px;">Verified Service Areas for ${escapeHtml(prod.name)}</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
      ${availableCities.map((c) => `
        <a href="/locations/${c.slug}/${prod.slug}" style="background: #FFFFFF; border: 1px solid #CBD5E1; color: #334155; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 0.9rem;">
          ${escapeHtml(prod.name)} in ${escapeHtml(c.name)} &rarr;
        </a>
      `).join('')}
    </div>
  </div>

  <div class="cta-banner">
    <h2>Custom Engineering & Dimension Tailoring</h2>
    <p>Need custom upright depths, extra heavy-duty load capacities, or mezzanine integration? Our CAD team delivers detailed layouts within 24 hours.</p>
    <a href="tel:+919990023436" class="btn-quote" style="background: #FFFFFF; color: #1B2A4A !important;">
      📞 Speak with an Engineer: +91 99900 23436
    </a>
  </div>
</main>
${renderFooter()}`;

      const html = buildHtmlDocument({
        title: pageTitle,
        description: metaDesc,
        canonical,
        noindex: false,
        bodyContentHtml: bodyHtml,
        initialData,
        schemas: [orgSchema, webSiteSchema, breadcrumbSchema, productSchema],
      });

      setPageCache(rawPath, { status: 200, html, noindex: false });

      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-SEO-Cache', 'MISS');
      res.setHeader('X-Robots-Tag', 'index, follow');
      return res.send(html);
    }

    // =========================================================================
    // ROUTE E: Products Catalog (/products)
    // =========================================================================
    else if (rawPath === '/products') {
      const activeProducts = await Product.find({ status: 'published', isActive: true })
        .select('name slug shortDesc image')
        .sort({ name: 1 })
        .lean();

      const pageTitle = 'Industrial Storage & Supermarket Rack Catalog | RP Storage Solution';
      const metaDesc = 'Explore our complete manufacturing catalog: heavy-duty pallet racks, supermarket display fixtures, cantilever systems, and multi-tier mezzanine floors. Direct factory pricing.';
      const canonical = `${BASE_URL}/products`;

      const crumbs = [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
      ];
      const breadcrumbSchema = generateBreadcrumbSchema(crumbs);

      const initialData = {
        success: true,
        products: activeProducts,
      };

      const bodyHtml = `${renderHeader()}
<main class="content-container">
  ${renderBreadcrumbHtml(crumbs)}

  <div style="margin-top: 16px;">
    <span class="badge-pill">🏭 Direct Manufacturer Catalog</span>
    <h1 class="hero-heading">Industrial Storage & Supermarket Racking Catalog</h1>
    <p style="font-size: 1.125rem; color: #475569; max-width: 860px; line-height: 1.7;">
      From automated warehouse pallet systems to aesthetic supermarket retail display fixtures, RP Storage Solution engineers heavy-duty, high-tensile steel equipment built to maximize cubic floor utilization.
    </p>
  </div>

  <div class="grid-cards">
    ${activeProducts.map((p) => `
    <div class="card-item">
      <img src="${p.image || '/images/gallery/mfg-1.jpg'}" alt="${escapeHtml(p.name)}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;" />
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #0F172A; margin-bottom: 8px;">${escapeHtml(p.name)}</h2>
      <p style="font-size: 0.925rem; color: #64748B; margin-bottom: 16px;">${escapeHtml(p.shortDesc || `Engineered storage system built to IS 2062 structural standards.`)}</p>
      <a href="/products/${p.slug}" style="color: #E85B12; font-weight: 600; text-decoration: none; font-size: 0.95rem;">
        View Specifications &rarr;
      </a>
    </div>`).join('')}
  </div>

  <div class="cta-banner">
    <h2>Bulk Corporate & Institutional Procurement</h2>
    <p>Contact our Najafgarh engineering headquarters for project tenders, volume discounts, and pan-India turnkey installation.</p>
    <a href="tel:+919990023436" class="btn-quote" style="background: #FFFFFF; color: #1B2A4A !important;">
      📞 Factory Direct Line: +91 99900 23436
    </a>
  </div>
</main>
${renderFooter()}`;

      const html = buildHtmlDocument({
        title: pageTitle,
        description: metaDesc,
        canonical,
        noindex: false,
        bodyContentHtml: bodyHtml,
        initialData,
        schemas: [orgSchema, webSiteSchema, breadcrumbSchema],
      });

      setPageCache(rawPath, { status: 200, html, noindex: false });

      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-SEO-Cache', 'MISS');
      res.setHeader('X-Robots-Tag', 'index, follow');
      return res.send(html);
    }

    // =========================================================================
    // ROUTE F: Homepage (/)
    // =========================================================================
    else if (rawPath === '/') {
      const [products, cities] = await Promise.all([
        Product.find({ status: 'published', isActive: true }).select('name slug shortDesc image').limit(8).lean(),
        City.find({ status: 'published', isVerified: true }).select('name slug state').limit(8).lean(),
      ]);

      const pageTitle = 'RP Storage Solution | Industrial Storage & Supermarket Rack Manufacturers';
      const metaDesc = 'ISO 9001:2015 certified manufacturer of heavy-duty warehouse pallet racks, supermarket display fixtures, mezzanine floors & storage systems in Delhi NCR. 35+ years engineering precision.';
      const canonical = BASE_URL;

      const initialData = {
        success: true,
        featuredProducts: products,
        verifiedCities: cities,
      };

      const bodyHtml = `${renderHeader()}
<main class="content-container">
  <div style="text-align: center; padding: 48px 0 32px;">
    <span class="badge-pill">⭐ 35+ Years Of Engineering Precision</span>
    <h1 class="hero-heading" style="font-size: 2.75rem; max-width: 900px; margin: 16px auto 20px;">
      Industrial Warehouse Storage Racks & Supermarket Display Systems
    </h1>
    <p style="font-size: 1.15rem; color: #475569; max-width: 760px; margin: 0 auto 32px; line-height: 1.7;">
      Direct factory manufacturing from Najafgarh, New Delhi. Precision roll-formed high-tensile steel racking systems engineered for maximum load capacity, spatial efficiency, and workplace safety.
    </p>
    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
      <a href="/products" class="btn-quote" style="font-size: 1.05rem; padding: 12px 28px;">Explore Products</a>
      <a href="/locations" class="btn-quote" style="background: #1B2A4A; font-size: 1.05rem; padding: 12px 28px;">Delivery Locations</a>
    </div>
  </div>

  <!-- Featured Products Section -->
  <div style="margin-top: 56px;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
      <div>
        <span class="badge-pill">Core Engineering Lines</span>
        <h2 style="font-size: 1.75rem; font-weight: 800; color: #0F172A; margin-top: 8px;">Heavy-Duty Industrial & Retail Systems</h2>
      </div>
      <a href="/products" style="color: #E85B12; font-weight: 600; text-decoration: none;">View All &rarr;</a>
    </div>

    <div class="grid-cards">
      ${products.map((p) => `
      <div class="card-item">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #0F172A; margin-bottom: 8px;">${escapeHtml(p.name)}</h3>
        <p style="font-size: 0.925rem; color: #64748B; margin-bottom: 16px;">${escapeHtml(p.shortDesc || `Factory direct manufacturing with certified load-deflection testing.`)}</p>
        <a href="/products/${p.slug}" style="color: #E85B12; font-weight: 600; text-decoration: none; font-size: 0.95rem;">
          View Specifications &rarr;
        </a>
      </div>`).join('')}
    </div>
  </div>

  <!-- Verified Delivery Hubs Section -->
  <div style="margin-top: 64px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px 32px;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
      <div>
        <span class="badge-pill">Active Service Corridors</span>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #1E293B; margin-top: 8px;">Verified Service Areas & Installation Hubs</h2>
      </div>
      <a href="/locations" style="color: #E85B12; font-weight: 600; text-decoration: none;">All Locations &rarr;</a>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 12px;">
      ${cities.map((c) => `
        <a href="/locations/${c.slug}" style="background: #FFFFFF; border: 1px solid #CBD5E1; color: #1E293B; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 500;">
          📍 ${escapeHtml(c.name)} Hub &rarr;
        </a>
      `).join('')}
    </div>
  </div>

  <!-- Direct Technical Quotation CTA -->
  <div class="cta-banner">
    <h2>Schedule a Free Warehouse Site Inspection</h2>
    <p>Our senior structural engineers evaluate your floor plan, pallet dimensions, and clearance requirements to design the optimal racking layout.</p>
    <a href="tel:+919990023436" class="btn-quote" style="background: #FFFFFF; color: #1B2A4A !important; font-size: 1.05rem;">
      📞 Book Consultation: +91 99900 23436
    </a>
  </div>
</main>
${renderFooter()}`;

      const html = buildHtmlDocument({
        title: pageTitle,
        description: metaDesc,
        canonical,
        noindex: false,
        bodyContentHtml: bodyHtml,
        initialData,
        schemas: [orgSchema, webSiteSchema],
      });

      setPageCache(rawPath, { status: 200, html, noindex: false });

      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-SEO-Cache', 'MISS');
      res.setHeader('X-Robots-Tag', 'index, follow');
      return res.send(html);
    }

    // =========================================================================
    // ROUTE G: 404 Fallback for Nonexistent Public Routes
    // =========================================================================
    else {
      const notFoundTitle = 'Page Not Found (404) | RP Storage Solution';
      const notFoundDesc = 'The requested industrial storage or racking resource does not exist on our server.';
      const bodyHtml = `${renderHeader()}
<main class="content-container text-center" style="padding: 80px 24px;">
  <span class="badge-pill" style="color: #DC2626; background: #FEF2F2; border-color: #FECACA;">HTTP 404 Error</span>
  <h1 class="hero-heading" style="margin-top: 16px;">404 - Page Not Found</h1>
  <p style="max-width: 600px; margin: 0 auto 32px; color: #64748B;">
    The requested address <code>${escapeHtml(rawPath)}</code> could not be located in our verified directory.
  </p>
  <div style="display: flex; justify-content: center; gap: 16px;">
    <a href="/" class="btn-quote">Return to Homepage</a>
    <a href="/products" class="btn-quote" style="background: #1B2A4A;">Browse Products</a>
  </div>
</main>
${renderFooter()}`;

      const html = buildHtmlDocument({
        title: notFoundTitle,
        description: notFoundDesc,
        canonical: `${BASE_URL}${rawPath}`,
        noindex: true,
        bodyContentHtml: bodyHtml,
        schemas: [orgSchema],
      });

      res.status(404);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      return res.send(html);
    }
  } catch (error) {
    console.error('[SEO Render Engine Exception]', error);
    return next(error);
  }
};

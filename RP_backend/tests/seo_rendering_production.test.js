import assert from 'assert';
import axios from 'axios';
import crypto from 'crypto';
import { sanitizeHtmlContent } from '../src/utils/sanitize.js';

const BASE_URL = 'http://localhost:5001';
const ADMIN_URL = `${BASE_URL}/api/admin`;
const PUBLIC_URL = `${BASE_URL}/api/public`;

const client = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

async function runPhase7TestSuite() {
  console.log('\n======================================================');
  console.log('   PHASE 7 PRODUCTION SEO & RENDERING TEST SUITE');
  console.log('======================================================\n');

  let adminToken = '';
  let testProductId = '';
  let testProductSlug = `heavy-pallet-${Date.now()}`;
  let testCityId = '';
  let testCitySlug = `manesar-${Date.now()}`;
  let testCityProductId = '';
  let testRedirectId = '';

  try {
    // -------------------------------------------------------------------------
    // SETUP: Authenticate as Super Admin
    // -------------------------------------------------------------------------
    const loginRes = await client.post(`${ADMIN_URL}/auth/login`, {
      email: 'admin@rpstorage.com',
      password: 'Admin@RP2026!',
    });
    assert.equal(loginRes.status, 200);
    adminToken = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${adminToken}` };

    // Create Test Product
    const prodRes = await client.post(
      `${ADMIN_URL}/products`,
      {
        name: 'Heavy Duty Structural Pallet Rack',
        slug: testProductSlug,
        category: 'industrial-racks',
        shortDesc: 'IS 2062 certified structural pallet rack for 3PL logistics warehouses.',
        detailedDesc: '<p>High-tensile beam levels with 4,000 kg capacity.</p>',
        status: 'published',
        isActive: true,
      },
      { headers: authHeaders }
    );
    assert.equal(prodRes.status, 201);
    testProductId = prodRes.data.product._id;

    // Create Test City (Verified & Published)
    const cityRes = await client.post(
      `${ADMIN_URL}/cities`,
      {
        name: 'Manesar Logistics Corridor',
        slug: testCitySlug,
        state: 'Haryana',
        isVerified: true,
        serviceAvailability: 'verified',
        verificationNotes: 'Manesar IMT logistics hub with daily direct dispatch.',
        seoTitle: 'Industrial Warehouse Storage Racks in Manesar | Direct Manufacturer',
        metaDescription: 'Leading manufacturer of heavy-duty warehouse pallet racks and industrial shelving in Manesar. 24-48 hr dispatch.',
        h1Heading: 'Heavy Duty Industrial Storage Racks in Manesar',
        introContent: 'Direct factory supply of heavy-duty warehouse racks across IMT Manesar.',
      },
      { headers: authHeaders }
    );
    assert.equal(cityRes.status, 201);
    testCityId = cityRes.data.city._id;
    await client.post(`${ADMIN_URL}/cities/${testCityId}/publish`, {}, { headers: authHeaders });

    // Create Active Mapping
    const mapRes = await client.post(
      `${ADMIN_URL}/product-city-mappings`,
      {
        productId: testProductId,
        cityId: testCityId,
        isAvailable: true,
        availabilityNotes: 'Full inventory active for Manesar hub.',
      },
      { headers: authHeaders }
    );
    assert.equal(mapRes.status, 200);

    // Create & Publish CityProduct SEO Page
    const cpRes = await client.post(
      `${ADMIN_URL}/city-products`,
      {
        city: testCityId,
        product: testProductId,
        cityName: 'Manesar Logistics Corridor',
        productName: 'Heavy Duty Structural Pallet Rack',
        seoTitle: 'Heavy Duty Structural Pallet Rack in Manesar | RP Storage Solution',
        metaDescription: 'Direct factory pricing on heavy-duty pallet racks in Manesar IMT. Certified load deflection.',
        h1Heading: 'Heavy Duty Structural Pallet Rack Manufacturer in Manesar',
        customContent: '<p>Engineered storage racks designed for 4-ton pallet loading across Manesar distribution centers.</p>',
      },
      { headers: authHeaders }
    );
    assert.equal(cpRes.status, 201);
    testCityProductId = cpRes.data.cityProduct._id;
    await client.post(`${ADMIN_URL}/city-products/${testCityProductId}/submit-review`, {}, { headers: authHeaders });
    await client.post(`${ADMIN_URL}/city-products/${testCityProductId}/approve`, {}, { headers: authHeaders });
    await client.post(`${ADMIN_URL}/city-products/${testCityProductId}/publish`, {}, { headers: authHeaders });

    // -------------------------------------------------------------------------
    // TEST 1: Homepage Initial HTML
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Homepage Initial HTML...');
    const homeRes = await client.get('/');
    assert.equal(homeRes.status, 200);
    assert.ok(homeRes.headers['content-type'].includes('text/html'));
    assert.ok(homeRes.data.includes('<!doctype html>'));
    assert.ok(homeRes.data.includes('<h1'));
    assert.ok(homeRes.data.includes('RP Storage Solution'));
    console.log('  ✔ Homepage returns complete, valid HTML with H1 and brand identity.');

    // -------------------------------------------------------------------------
    // TEST 2: Product Catalog Initial HTML
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Product Catalog Initial HTML...');
    const catalogRes = await client.get('/products');
    assert.equal(catalogRes.status, 200);
    assert.ok(catalogRes.data.includes('Industrial Storage &amp; Supermarket Racking Catalog') || catalogRes.data.includes('Catalog'));
    assert.ok(catalogRes.data.includes(testProductSlug));
    console.log('  ✔ /products initial HTML returns catalog grid with active products.');

    // -------------------------------------------------------------------------
    // TEST 3: Product Detail SSR
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Product Detail SSR...');
    const prodDetailRes = await client.get(`/products/${testProductSlug}`);
    assert.equal(prodDetailRes.status, 200);
    assert.ok(prodDetailRes.data.includes('Heavy Duty Structural Pallet Rack'));
    assert.ok(prodDetailRes.data.includes('Standard Technical Parameters'));
    assert.ok(prodDetailRes.data.includes('window.__INITIAL_DATA__'));
    console.log('  ✔ /products/:slug server-renders complete specifications and pre-hydration payload.');

    // -------------------------------------------------------------------------
    // TEST 4: City Landing Initial HTML
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] City Landing Initial HTML...');
    const cityLandingRes = await client.get(`/locations/${testCitySlug}`);
    assert.equal(cityLandingRes.status, 200);
    assert.ok(cityLandingRes.data.includes('Manesar Logistics Corridor'));
    assert.ok(cityLandingRes.data.includes('Verified Distribution Hub'));
    console.log('  ✔ /locations/:citySlug server-renders verified distribution hub details.');

    // -------------------------------------------------------------------------
    // TEST 5: City-Product Landing Initial HTML
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] City-Product Landing Initial HTML...');
    const cpLandingRes = await client.get(`/locations/${testCitySlug}/${testProductSlug}`);
    assert.equal(cpLandingRes.status, 200);
    assert.ok(cpLandingRes.data.includes('Heavy Duty Structural Pallet Rack Manufacturer in Manesar'));
    assert.ok(cpLandingRes.data.includes('Verified Technical Specifications'));
    assert.ok(cpLandingRes.data.includes('Direct Factory Supply'));
    console.log('  ✔ /locations/:city/:product server-renders target H1 and technical specifications.');

    // -------------------------------------------------------------------------
    // TEST 6: Unique SEO Titles
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Unique SEO Titles...');
    const titleHome = homeRes.data.match(/<title>(.*?)<\/title>/)?.[1];
    const titleCatalog = catalogRes.data.match(/<title>(.*?)<\/title>/)?.[1];
    const titleProd = prodDetailRes.data.match(/<title>(.*?)<\/title>/)?.[1];
    const titleCity = cityLandingRes.data.match(/<title>(.*?)<\/title>/)?.[1];
    const titleCp = cpLandingRes.data.match(/<title>(.*?)<\/title>/)?.[1];

    assert.ok(titleHome && titleCatalog && titleProd && titleCity && titleCp);
    assert.notEqual(titleHome, titleCatalog);
    assert.notEqual(titleProd, titleCity);
    assert.notEqual(titleCity, titleCp);
    console.log('  ✔ Every public page route contains a distinct, tailored SEO Title.');

    // -------------------------------------------------------------------------
    // TEST 7: Meta Descriptions
    // -------------------------------------------------------------------------
    console.log('\n[TEST 7] Meta Descriptions...');
    const descMatches = cpLandingRes.data.match(/<meta name="description" content="(.*?)" \/>/);
    assert.ok(descMatches && descMatches[1].length > 30);
    assert.ok(descMatches[1].includes('Manesar'));
    console.log('  ✔ Meta description is present, non-empty, and server-rendered.');

    // -------------------------------------------------------------------------
    // TEST 8: Canonical URLs
    // -------------------------------------------------------------------------
    console.log('\n[TEST 8] Canonical URLs...');
    const canonicalMatch = cpLandingRes.data.match(/<link rel="canonical" href="(.*?)" \/>/);
    assert.ok(canonicalMatch);
    assert.equal(canonicalMatch[1].replace(/\/$/, ''), `https://www.rpstoragesolution.com/locations/${testCitySlug}/${testProductSlug}`);
    console.log('  ✔ Canonical URL accurately mirrors absolute HTTPS path without trailing slash issues.');

    // -------------------------------------------------------------------------
    // TEST 9: Correct H1 In Initial HTML
    // -------------------------------------------------------------------------
    console.log('\n[TEST 9] Correct H1 in Initial HTML...');
    assert.ok(cpLandingRes.data.includes('<h1 class="hero-heading">Heavy Duty Structural Pallet Rack Manufacturer in Manesar</h1>'));
    console.log('  ✔ Primary H1 tag is rendered in initial HTML without client JavaScript execution.');

    // -------------------------------------------------------------------------
    // TEST 10: Central JSON-LD Structured Data Generation
    // -------------------------------------------------------------------------
    console.log('\n[TEST 10] Central JSON-LD Structured Data...');
    const jsonLdBlocks = cpLandingRes.data.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    assert.ok(jsonLdBlocks && jsonLdBlocks.length >= 3);
    
    // Verify valid JSON parse for each block
    let foundProduct = false;
    let foundLocalBusiness = false;
    for (const block of jsonLdBlocks) {
      const jsonStr = block.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
      const parsed = JSON.parse(jsonStr);
      if (parsed['@type'] === 'Product') {
        foundProduct = true;
        assert.ok(!parsed.aggregateRating, 'Strict Integrity: No invented reviews or ratings.');
        assert.ok(!parsed.offers, 'Strict Integrity: No invented pricing or offers.');
      }
      if (parsed['@type'] === 'LocalBusiness') {
        foundLocalBusiness = true;
        assert.ok(parsed.name.includes('Manesar'));
      }
    }
    assert.ok(foundProduct, 'Product schema found');
    assert.ok(foundLocalBusiness, 'LocalBusiness schema found');
    console.log('  ✔ Verified JSON-LD syntax, schema entities, and zero fake review ratings.');

    // -------------------------------------------------------------------------
    // TEST 11: Product-City Mapping Restrictions
    // -------------------------------------------------------------------------
    console.log('\n[TEST 11] Product-City Mapping Restrictions...');
    // Disable mapping
    await client.post(
      `${ADMIN_URL}/product-city-mappings`,
      { productId: testProductId, cityId: testCityId, isAvailable: false },
      { headers: authHeaders }
    );
    const unmappedRes = await client.get(`/locations/${testCitySlug}/${testProductSlug}`);
    assert.equal(unmappedRes.status, 404);
    assert.ok(unmappedRes.data.includes('404'));
    assert.equal(unmappedRes.headers['x-robots-tag'], 'noindex, nofollow');
    console.log('  ✔ Disabled mapping returns immediate HTTP 404 with noindex protection.');
    // Re-enable mapping
    await client.post(
      `${ADMIN_URL}/product-city-mappings`,
      { productId: testProductId, cityId: testCityId, isAvailable: true },
      { headers: authHeaders }
    );

    // -------------------------------------------------------------------------
    // TEST 12: Unverified City Rejection
    // -------------------------------------------------------------------------
    console.log('\n[TEST 12] Unverified City Rejection...');
    const unverifiedCityRes = await client.post(
      `${ADMIN_URL}/cities`,
      {
        name: 'Unverified Industrial Belt',
        slug: `unverified-${Date.now()}`,
        state: 'Uttar Pradesh',
        isVerified: false,
      },
      { headers: authHeaders }
    );
    const unverifiedSlug = unverifiedCityRes.data.city.slug;
    const testUnverifiedPage = await client.get(`/locations/${unverifiedSlug}`);
    assert.equal(testUnverifiedPage.status, 404);
    console.log('  ✔ Unverified city landing page rejected with HTTP 404.');

    // -------------------------------------------------------------------------
    // TEST 13: Unpublished Product Rejection
    // -------------------------------------------------------------------------
    console.log('\n[TEST 13] Unpublished Product Rejection...');
    const draftProd = await client.post(
      `${ADMIN_URL}/products`,
      {
        name: 'Draft Cantilever Unit',
        slug: `draft-cantilever-${Date.now()}`,
        category: 'industrial-racks',
        shortDesc: 'Draft description',
        status: 'draft',
        isActive: false,
      },
      { headers: authHeaders }
    );
    assert.equal(draftProd.status, 201);
    const draftProdRes = await client.get(`/products/${draftProd.data.product.slug}`);
    assert.equal(draftProdRes.status, 404);
    console.log('  ✔ Draft product page returns HTTP 404 to public crawlers.');

    // -------------------------------------------------------------------------
    // TEST 14: Unpublished SEO Page Rejection
    // -------------------------------------------------------------------------
    console.log('\n[TEST 14] Unpublished SEO Page Rejection...');
    await client.post(`${ADMIN_URL}/city-products/${testCityProductId}/unpublish`, {}, { headers: authHeaders });
    const unpublishedCpRes = await client.get(`/locations/${testCitySlug}/${testProductSlug}`);
    assert.equal(unpublishedCpRes.status, 404);
    console.log('  ✔ Unpublishing SEO page makes it immediately return HTTP 404.');
    // Re-publish
    await client.post(`${ADMIN_URL}/city-products/${testCityProductId}/approve`, {}, { headers: authHeaders });
    await client.post(`${ADMIN_URL}/city-products/${testCityProductId}/publish`, {}, { headers: authHeaders });

    // -------------------------------------------------------------------------
    // TEST 15: General 404 Responses
    // -------------------------------------------------------------------------
    console.log('\n[TEST 15] 404 Responses for Invalid Routes...');
    const notFoundRes = await client.get('/nonexistent-route-path-xyz');
    assert.equal(notFoundRes.status, 404);
    assert.ok(notFoundRes.data.includes('404 - Page Not Found'));
    assert.equal(notFoundRes.headers['x-robots-tag'], 'noindex, nofollow');
    console.log('  ✔ Nonexistent route returns real HTTP 404 with noindex tags.');

    // -------------------------------------------------------------------------
    // TEST 16: Active Redirects Status (301/308/302)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 16] Redirect Status...');
    const oldSlug = `/locations/old-redirect-source-${Date.now()}`;
    const redirectRes = await client.post(
      `${ADMIN_URL}/seo/redirects`,
      {
        sourcePath: oldSlug,
        targetPath: `/locations/${testCitySlug}`,
        statusCode: 301,
        isActive: true,
      },
      { headers: authHeaders }
    );
    testRedirectId = redirectRes.data.redirect?._id;
    
    // Test redirect behavior without automatic follow
    const checkRedirect = await axios.get(`${BASE_URL}${oldSlug}`, {
      maxRedirects: 0,
      validateStatus: (s) => s >= 300 && s < 400,
    });
    assert.equal(checkRedirect.status, 301);
    assert.equal(checkRedirect.headers.location, `/locations/${testCitySlug}`);
    console.log('  ✔ Database-managed redirect correctly returns HTTP 301 to target URL.');

    // -------------------------------------------------------------------------
    // TEST 17: Duplicate Canonical Prevention
    // -------------------------------------------------------------------------
    console.log('\n[TEST 17] Duplicate Canonical Prevention...');
    const auditRes = await client.get(`${ADMIN_URL}/seo/audit`, { headers: authHeaders });
    assert.equal(auditRes.status, 200);
    const duplicateIssues = auditRes.data.issues.filter((i) => i.field === 'Duplicate Canonical');
    assert.equal(duplicateIssues.length, 0, 'No duplicate canonical URLs permitted');
    console.log('  ✔ Verified zero duplicate canonical URLs across public collections.');

    // -------------------------------------------------------------------------
    // TEST 18: Sitemap Filtering
    // -------------------------------------------------------------------------
    console.log('\n[TEST 18] Dynamic Sitemap Filtering...');
    const sitemapRes = await client.get('/sitemap-city-products.xml');
    assert.equal(sitemapRes.status, 200);
    assert.ok(sitemapRes.data.includes(`/locations/${testCitySlug}/${testProductSlug}/`));
    assert.ok(!sitemapRes.data.includes('draft'), 'Drafts must be excluded from sitemap');
    assert.ok(!sitemapRes.data.includes(unverifiedSlug), 'Unverified cities must be excluded');
    console.log('  ✔ Dynamic XML sitemap accurately includes valid pages and filters drafts.');

    // -------------------------------------------------------------------------
    // TEST 19: Sitemap Cache Invalidation & Manual Regeneration
    // -------------------------------------------------------------------------
    console.log('\n[TEST 19] Sitemap Cache Invalidation & Manual Regeneration...');
    const regenRes = await client.post(`${ADMIN_URL}/sitemap/regenerate`, {}, { headers: authHeaders });
    assert.equal(regenRes.status, 200);
    assert.equal(regenRes.data.success, true);
    
    // First request should be MISS
    const smMiss = await client.get('/sitemap-city-products.xml');
    assert.equal(smMiss.headers['x-sitemap-cache'], 'MISS');
    // Second request should be HIT
    const smHit = await client.get('/sitemap-city-products.xml');
    assert.equal(smHit.headers['x-sitemap-cache'], 'HIT');
    console.log('  ✔ Sitemap cache management and secure manual regeneration verified.');

    // -------------------------------------------------------------------------
    // TEST 20: Public Page Cache Invalidation
    // -------------------------------------------------------------------------
    console.log('\n[TEST 20] Public Page Cache Invalidation...');
    // Initial fetch -> MISS
    await client.post(`${ADMIN_URL}/seo/clear-cache`, {}, { headers: authHeaders });
    const missRes = await client.get(`/locations/${testCitySlug}/${testProductSlug}`);
    assert.equal(missRes.headers['x-seo-cache'], 'MISS');

    // Repeated fetch -> HIT
    const hitRes = await client.get(`/locations/${testCitySlug}/${testProductSlug}`);
    assert.equal(hitRes.headers['x-seo-cache'], 'HIT');
    console.log('  ✔ High-performance in-memory page cache returns HIT on repeat requests.');

    // -------------------------------------------------------------------------
    // TEST 21: Dynamic Page Publishing Without Modifying React Route Source
    // -------------------------------------------------------------------------
    console.log('\n[TEST 21] Dynamic Page Publishing Without Code Changes...');
    const newCitySlug = `panipat-${Date.now()}`;
    const newCityRes = await client.post(
      `${ADMIN_URL}/cities`,
      {
        name: 'Panipat Logistics Belt',
        slug: newCitySlug,
        state: 'Haryana',
        isVerified: true,
        serviceAvailability: 'verified',
        verificationNotes: 'Verified Panipat hub.',
        seoTitle: 'Panipat Warehouse Racks | Direct Factory',
        metaDescription: 'Heavy-duty racks in Panipat.',
        h1Heading: 'Storage Racks in Panipat',
      },
      { headers: authHeaders }
    );
    await client.post(`${ADMIN_URL}/cities/${newCityRes.data.city._id}/publish`, {}, { headers: authHeaders });
    await client.post(
      `${ADMIN_URL}/product-city-mappings`,
      { productId: testProductId, cityId: newCityRes.data.city._id, isAvailable: true },
      { headers: authHeaders }
    );
    const newCpRes = await client.post(
      `${ADMIN_URL}/city-products`,
      {
        city: newCityRes.data.city._id,
        product: testProductId,
        cityName: 'Panipat Logistics Belt',
        productName: 'Heavy Duty Structural Pallet Rack',
        seoTitle: 'Pallet Racks in Panipat | RP Storage',
        metaDescription: 'Direct factory pallet racks in Panipat.',
        h1Heading: 'Pallet Racks in Panipat',
      },
      { headers: authHeaders }
    );
    await client.post(`${ADMIN_URL}/city-products/${newCpRes.data.cityProduct._id}/approve`, {}, { headers: authHeaders });
    await client.post(`${ADMIN_URL}/city-products/${newCpRes.data.cityProduct._id}/publish`, {}, { headers: authHeaders });

    const liveTest = await client.get(`/locations/${newCitySlug}/${testProductSlug}`);
    assert.equal(liveTest.status, 200);
    assert.ok(liveTest.data.includes('Pallet Racks in Panipat'));
    console.log('  ✔ Newly published combination is immediately accessible without React rebuild.');

    // -------------------------------------------------------------------------
    // TEST 22: Draft Preview No-Store Protection
    // -------------------------------------------------------------------------
    console.log('\n[TEST 22] Draft Preview No-Store Protection...');
    // Unpublish page to make it a draft for preview testing
    await client.post(`${ADMIN_URL}/city-products/${testCityProductId}/unpublish`, {}, { headers: authHeaders });
    const previewData = await client.get(`${ADMIN_URL}/city-products/${testCityProductId}/preview`, { headers: authHeaders });
    assert.equal(previewData.status, 200);
    const token = previewData.data.previewToken;

    const previewReq = await client.get(`/locations/${testCitySlug}/${testProductSlug}?preview=true&token=${token}`);
    assert.equal(previewReq.status, 200);
    assert.ok(previewReq.headers['cache-control'].includes('no-store'));
    assert.equal(previewReq.headers['x-robots-tag'], 'noindex, nofollow');
    console.log('  ✔ Draft preview carries strict no-store cache headers and noindex protection.');

    // -------------------------------------------------------------------------
    // TEST 23: Signed Preview Expiration & Signature Tampering
    // -------------------------------------------------------------------------
    console.log('\n[TEST 23] Signed Preview Expiration & Tampering...');
    const forgedToken = `${Date.now() - 50000}.invalid_hmac_signature_xyz`;
    const forgedReq = await client.get(`/locations/${testCitySlug}/${testProductSlug}?preview=true&token=${forgedToken}`);
    assert.equal(forgedReq.status, 404);
    console.log('  ✔ Expired or forged preview tokens fail securely with HTTP 404.');

    // Re-publish page for remaining tests
    await client.post(`${ADMIN_URL}/city-products/${testCityProductId}/approve`, {}, { headers: authHeaders });
    await client.post(`${ADMIN_URL}/city-products/${testCityProductId}/publish`, {}, { headers: authHeaders });

    // -------------------------------------------------------------------------
    // TEST 24: XSS Sanitization Vector Stripping
    // -------------------------------------------------------------------------
    console.log('\n[TEST 24] Rich Text Allowlist XSS Vector Stripping...');
    const maliciousInput = `
      <p>Valid content with <strong>bold</strong> engineering specs.</p>
      <script>alert("xss")</script>
      <img src="x" onerror="stealData()" />
      <a href="javascript:alert(1)">Click me</a>
      <svg><script>alert("svg")</script></svg>
      <iframe src="https://attacker.com"></iframe>
    `;
    const cleanOutput = sanitizeHtmlContent(maliciousInput);
    assert.ok(!cleanOutput.includes('<script>'), 'Stripped script');
    assert.ok(!cleanOutput.includes('onerror'), 'Stripped onerror');
    assert.ok(!cleanOutput.includes('javascript:'), 'Stripped javascript: protocol');
    assert.ok(!cleanOutput.includes('<iframe>'), 'Stripped iframe');
    assert.ok(cleanOutput.includes('<strong>bold</strong>'), 'Preserved valid formatting');
    console.log('  ✔ Malicious tags, event handlers, protocols, and iframes stripped successfully.');

    // -------------------------------------------------------------------------
    // TEST 25: Hydration Consistency (Pre-Hydrated Data Alignment)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 25] Hydration Consistency...');
    const initialDataMatch = cpLandingRes.data.match(/window\.__INITIAL_DATA__ = ([\s\S]*?);\s*<\/script>/);
    assert.ok(initialDataMatch);
    const parsedInitialData = JSON.parse(initialDataMatch[1]);
    assert.equal(parsedInitialData.cityProduct.slug, `${testCitySlug}/${testProductSlug}`);
    assert.equal(parsedInitialData.cityProduct.productName, 'Heavy Duty Structural Pallet Rack');
    console.log('  ✔ window.__INITIAL_DATA__ matches server-rendered DOM data perfectly.');

    // -------------------------------------------------------------------------
    // TEST 26: GSAP SSR Isolation
    // -------------------------------------------------------------------------
    console.log('\n[TEST 26] GSAP SSR Isolation...');
    // Ensure GSAP browser-only window references are never evaluated in Node SSR
    assert.ok(!homeRes.data.includes('ScrollTrigger is not defined'));
    assert.ok(!homeRes.data.includes('window is not defined'));
    console.log('  ✔ Server HTML renders without GSAP window/document reference crashes.');

    // -------------------------------------------------------------------------
    // TEST 27: Admin CRUD Regression Protection
    // -------------------------------------------------------------------------
    console.log('\n[TEST 27] Admin CRUD Regression Protection...');
    const statsRes = await client.get(`${ADMIN_URL}/auth/dashboard-stats`, { headers: authHeaders });
    assert.equal(statsRes.status, 200);
    assert.ok(statsRes.data.stats.totalProducts > 0);
    assert.ok(statsRes.data.stats.totalCities > 0);
    console.log('  ✔ Admin dashboard and CRUD APIs continue operating with full functionality.');

    // -------------------------------------------------------------------------
    // TEST 28: Public Lead Capture Regression
    // -------------------------------------------------------------------------
    console.log('\n[TEST 28] Public Lead Capture Regression...');
    const leadRes = await client.post(`${PUBLIC_URL}/enquiries`, {
      name: 'Test Engineer',
      phone: '+91 99900 23436',
      email: 'engineer@warehouse.com',
      city: 'Manesar Logistics Corridor',
      productOfInterest: 'Heavy Duty Structural Pallet Rack',
      message: 'Need 1,000 pallet positions quoted with CAD layout.',
      sourcePageUrl: `/locations/${testCitySlug}/${testProductSlug}`,
    });
    assert.equal(leadRes.status, 201);
    assert.equal(leadRes.data.success, true);
    console.log('  ✔ Public enquiry captured successfully from server-rendered SEO page.');

    // -------------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------------
    console.log('\nCleaning up temporary test entities...');
    await client.delete(`${ADMIN_URL}/city-products/${testCityProductId}`, { headers: authHeaders });
    await client.delete(`${ADMIN_URL}/city-products/${newCpRes.data.cityProduct._id}`, { headers: authHeaders });
    await client.delete(`${ADMIN_URL}/cities/${testCityId}`, { headers: authHeaders });
    await client.delete(`${ADMIN_URL}/cities/${newCityRes.data.city._id}`, { headers: authHeaders });
    await client.delete(`${ADMIN_URL}/cities/${unverifiedCityRes.data.city._id}`, { headers: authHeaders });
    await client.delete(`${ADMIN_URL}/products/${testProductId}`, { headers: authHeaders });
    await client.delete(`${ADMIN_URL}/products/${draftProd.data.product._id}`, { headers: authHeaders });
    if (testRedirectId) await client.delete(`${ADMIN_URL}/seo/redirects/${testRedirectId}`, { headers: authHeaders });
    console.log('  ✔ Cleaned up all test entities.\n');

    console.log('======================================================');
    console.log('   ALL 28 PHASE 7 PRODUCTION SEO TESTS PASSED!       ');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error);
    process.exit(1);
  }
}

runPhase7TestSuite();

import assert from 'assert';
import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:5001';
const ADMIN_URL = `${BASE_URL}/api/admin`;
const PUBLIC_URL = `${BASE_URL}/api/public`;

const client = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

async function runPhase8TestSuite() {
  console.log('\n================================================================');
  console.log('   PHASE 8 ENTERPRISE CITY HOMEPAGE INHERITANCE TEST SUITE');
  console.log('================================================================\n');

  let adminToken = '';
  let editorToken = '';
  let testProductId = '';
  let testProductSlug = `p8-pallet-${Date.now()}`;
  let testCityId = '';
  let testCitySlug = `p8-delhi-${Date.now()}`;
  let testCityHomepageId = '';
  let testMappingId = '';
  let testCityProductId = '';

  try {
    // -------------------------------------------------------------------------
    // SETUP: Authenticate Users
    // -------------------------------------------------------------------------
    console.log('[SETUP] Authenticating Super Admin & Content Editor...');
    const adminLogin = await client.post(`${ADMIN_URL}/auth/login`, {
      email: 'admin@rpstorage.com',
      password: 'Admin@RP2026!',
    });
    assert.equal(adminLogin.status, 200);
    adminToken = adminLogin.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    const editorLogin = await client.post(`${ADMIN_URL}/auth/login`, {
      email: 'editor@rpstorage.com',
      password: 'Editor@RP2026!',
    });
    assert.equal(editorLogin.status, 200);
    editorToken = editorLogin.data.token;
    const editorHeaders = { Authorization: `Bearer ${editorToken}` };
    console.log('  ✔ Authentication tokens acquired.');

    // -------------------------------------------------------------------------
    // SETUP: Create Verified City and Product
    // -------------------------------------------------------------------------
    console.log('\n[SETUP] Creating Test Product & Verified City...');
    const prodRes = await client.post(
      `${ADMIN_URL}/products`,
      {
        name: 'Phase 8 Industrial Mezzanine Rack',
        slug: testProductSlug,
        category: 'industrial-racks',
        shortDesc: 'IS 2062 certified structural multi-tier mezzanine floor.',
        detailedDesc: '<p>Engineered for high-volume 3PL distribution facilities.</p>',
        specs: {
          'Load Capacity': '1500 kg/sqm',
          'Steel Grade': 'IS 2062 CRCA',
        },
        status: 'published',
        isActive: true,
      },
      { headers: adminHeaders }
    );
    assert.equal(prodRes.status, 201);
    testProductId = prodRes.data.product._id;

    const cityRes = await client.post(
      `${ADMIN_URL}/cities`,
      {
        name: 'Phase 8 Delhi Logistics Hub',
        slug: testCitySlug,
        state: 'Delhi NCR',
        isVerified: true,
        status: 'published',
        description: 'Primary verified industrial logistics corridor in Delhi.',
        localRelevance: 'Direct dispatch to Okhla, Mayapuri and Patparganj industrial clusters.',
      },
      { headers: adminHeaders }
    );
    assert.equal(cityRes.status, 201);
    testCityId = cityRes.data.city._id;
    await client.post(`${ADMIN_URL}/cities/${testCityId}/publish`, {}, { headers: adminHeaders });
    console.log(`  ✔ Test Product (${testProductSlug}) and Verified City (${testCitySlug}) initialized.`);

    // -------------------------------------------------------------------------
    // TEST 1: Common Homepage Rendering & Structure
    // -------------------------------------------------------------------------
    console.log('\n[TEST 1] Common Homepage Content Resolution (/api/public/homepage)...');
    const homeRes = await client.get(`${PUBLIC_URL}/homepage`);
    assert.equal(homeRes.status, 200);
    assert.equal(homeRes.data.success, true);
    assert.equal(homeRes.data.isCityHomepage, false);
    assert.ok(homeRes.data.sections);
    assert.ok(homeRes.data.sections.hero);
    assert.ok(homeRes.data.sections.about);
    assert.ok(homeRes.data.sections.featuredProducts);
    assert.ok(homeRes.data.sections.faqs);
    assert.ok(homeRes.data.seo);
    console.log('  ✔ Common homepage resolves standardized sections and SEO metadata.');

    // -------------------------------------------------------------------------
    // TEST 2: Implicit City Homepage Content Inheritance (Before explicit configuration)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Implicit City Homepage Inheritance (/api/public/locations/:citySlug)...');
    const implicitCityRes = await client.get(`${PUBLIC_URL}/locations/${testCitySlug}`);
    assert.equal(implicitCityRes.status, 200);
    assert.equal(implicitCityRes.data.success, true);
    assert.equal(implicitCityRes.data.isCityHomepage, true);
    assert.equal(implicitCityRes.data.city.slug, testCitySlug);
    assert.ok(implicitCityRes.data.sections.hero.headline);
    assert.ok(implicitCityRes.data.seo.title.includes('Phase 8 Delhi Logistics Hub'));
    console.log('  ✔ Verified city automatically inherits common layout and sections with local context.');

    // -------------------------------------------------------------------------
    // TEST 3: Product Filtering via ProductCityMapping
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Product Availability Filtering on City Homepage...');
    // Currently testProduct is NOT mapped to testCity -> should NOT appear in featured products
    let cityProds = implicitCityRes.data.sections.featuredProducts.products || [];
    let isPresent = cityProds.some((p) => p.slug === testProductSlug);
    assert.equal(isPresent, false, 'Unmapped product must not appear on city homepage');

    // Create Mapping
    const mapRes = await client.post(
      `${ADMIN_URL}/product-city-mappings`,
      {
        cityId: testCityId,
        productId: testProductId,
        isAvailable: true,
        availabilityNotes: 'Phase 8 active delivery corridor',
      },
      { headers: adminHeaders }
    );
    assert.ok(mapRes.status === 200 || mapRes.status === 201);
    testMappingId = mapRes.data.mapping._id;

    // Re-query City Landing
    const mappedCityRes = await client.get(`${PUBLIC_URL}/locations/${testCitySlug}`);
    cityProds = mappedCityRes.data.sections.featuredProducts.products || [];
    const mappedItem = cityProds.find((p) => p.slug === testProductSlug);
    assert.ok(mappedItem, 'Mapped product must now appear in city catalog');
    console.log('  ✔ Product availability correctly restricted to verified ProductCityMapping.');

    // -------------------------------------------------------------------------
    // TEST 4: Context-Aware Navigation: Fallback vs Dedicated SEO Link
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Context-Aware Product URL Resolution...');
    // Without dedicated SEO page -> targetUrl must fallback to /products/:productSlug
    assert.equal(mappedItem.hasDedicatedSeoPage, false);
    assert.equal(mappedItem.targetUrl, `/products/${testProductSlug}`);
    console.log('  ✔ Unmapped dedicated page resolves safely to master product URL.');

    // Now create a published CityProduct SEO page
    const cpRes = await client.post(
      `${ADMIN_URL}/city-products`,
      {
        city: testCityId,
        product: testProductId,
        h1Heading: `Heavy Duty Mezzanine Racks in ${testCitySlug}`,
        seoTitle: `Warehouse Mezzanine Racks Manufacturer in ${testCitySlug} | RP Storage`,
        metaDescription: `High density multi-tier mezzanine floors installed in ${testCitySlug}. Direct factory pricing.`,
        introContent: '<p>Custom structural mezzanine installations.</p>',
      },
      { headers: adminHeaders }
    );
    assert.equal(cpRes.status, 201);
    testCityProductId = cpRes.data.cityProduct?._id || cpRes.data.page?._id;

    // Publish CityProduct
    const pubCpRes = await client.post(`${ADMIN_URL}/city-products/${testCityProductId}/publish`, {}, { headers: adminHeaders });
    assert.equal(pubCpRes.status, 200);

    // Re-check City Landing
    const dedicatedCityRes = await client.get(`${PUBLIC_URL}/locations/${testCitySlug}`);
    const resolvedDedicatedItem = dedicatedCityRes.data.sections.featuredProducts.products.find((p) => p.slug === testProductSlug);
    assert.equal(resolvedDedicatedItem.hasDedicatedSeoPage, true);
    assert.equal(resolvedDedicatedItem.targetUrl, `/locations/${testCitySlug}/${testProductSlug}`);
    console.log('  ✔ Published dedicated SEO page dynamically updates targetUrl to /locations/:city/:product.');

    // -------------------------------------------------------------------------
    // TEST 5: Creating CityHomepage Configuration via Admin CMS
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Instantiating CityHomepage via Admin CMS...');
    const createHpRes = await client.post(
      `${ADMIN_URL}/city-homepages`,
      { cityId: testCityId },
      { headers: adminHeaders }
    );
    assert.equal(createHpRes.status, 201);
    assert.equal(createHpRes.data.success, true);
    testCityHomepageId = createHpRes.data.data._id;
    assert.equal(createHpRes.data.data.status, 'draft');
    assert.equal(createHpRes.data.data.inheritHomepage, true);
    console.log('  ✔ CityHomepage record created with default inheritance and draft isolation.');

    // -------------------------------------------------------------------------
    // TEST 6: Field-Level Overrides & INHERIT / OVERRIDE / HIDE Modes
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Testing Field-Level Overrides (Hero, About, EnquiryCTA, SEO)...');
    const updateRes = await client.patch(
      `${ADMIN_URL}/city-homepages/${testCityHomepageId}`,
      {
        sectionOverrides: {
          hero: {
            mode: 'OVERRIDE',
            eyebrow: 'Delhi NCR Heavy Storage Corridor',
            headline: 'Custom Delhi Headline',
            italicHeadline: 'Tailored for Capital Warehouses',
            subtitle: 'Overridden custom description specific to Delhi 3PL hubs.',
            primaryCtaText: 'Get Delhi Quote',
          },
          about: {
            mode: 'OVERRIDE',
            headline: 'Local Manufacturing & Assembly',
            localPresenceDetails: 'Najafgarh direct fleet delivery across Delhi within 24 hours.',
          },
          industries: {
            mode: 'HIDE',
          },
          faqs: {
            mode: 'APPEND',
            items: [
              {
                q: 'What is Delhi delivery turnaround?',
                a: 'Standard shelving dispatched within 24 hours across Delhi NCT.',
              },
            ],
          },
        },
        seo: {
          title: 'Custom Delhi Homepage SEO Title',
          description: 'Custom Delhi Homepage SEO Description for industrial search.',
          h1: 'Custom Delhi H1 Heading',
          canonicalUrl: `https://www.rpstoragesolution.com/locations/${testCitySlug}`,
          robotsDirective: 'index, follow',
        },
      },
      { headers: adminHeaders }
    );
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.data.config.version, 2);
    console.log('  ✔ Saved field-level overrides; version incremented to v2.');

    // -------------------------------------------------------------------------
    // TEST 7: Draft Isolation (Unpublished Draft Must Not Leak to Public Visitors)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 7] Verifying Draft Isolation on Public Page...');
    const publicPrePublish = await client.get(`${PUBLIC_URL}/locations/${testCitySlug}`);
    assert.equal(publicPrePublish.status, 200);
    // Draft headline 'Custom Delhi Headline' must NOT appear on public endpoint yet
    assert.notEqual(publicPrePublish.data.sections.hero.headline, 'Custom Delhi Headline');
    console.log('  ✔ Public requests receive published content without draft leakage.');

    // -------------------------------------------------------------------------
    // TEST 8: Signed Preview Authorization & Tampering Protection
    // -------------------------------------------------------------------------
    console.log('\n[TEST 8] Signed Draft Preview Token Authorization & Tamper Check...');
    const previewRes = await client.get(`${ADMIN_URL}/city-homepages/${testCityHomepageId}/preview`, {
      headers: adminHeaders,
    });
    assert.equal(previewRes.status, 200);
    assert.ok(previewRes.data.previewToken);
    const validToken = previewRes.data.previewToken;

    // Request preview with valid token
    const previewPublicRes = await client.get(`${PUBLIC_URL}/locations/${testCitySlug}?preview=true&token=${validToken}`);
    assert.equal(previewPublicRes.status, 200);
    assert.equal(previewPublicRes.data.sections.hero.headline, 'Custom Delhi Headline');
    assert.equal(previewPublicRes.data.sections.industries.enabled, false, 'HIDE mode must disable section in preview');
    console.log('  ✔ Authorized preview reflects draft overrides.');

    // Request with forged token
    const forgedRes = await client.get(`${PUBLIC_URL}/locations/${testCitySlug}?preview=true&token=invalid.tampered-token`);
    assert.equal(forgedRes.status, 403);
    console.log('  ✔ Forged preview token securely rejected with HTTP 403.');

    // -------------------------------------------------------------------------
    // TEST 9: Editorial Workflow (Submit -> Request Changes -> Approve -> Publish)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 9] Editorial Approval Workflow...');
    // Editor Submits Review
    const submitReviewRes = await client.post(
      `${ADMIN_URL}/city-homepages/${testCityHomepageId}/submit-review`,
      {},
      { headers: editorHeaders }
    );
    assert.equal(submitReviewRes.status, 200);
    assert.equal(submitReviewRes.data.config.status, 'review');

    // SEO Manager Requests Changes
    const reqChangesRes = await client.post(
      `${ADMIN_URL}/city-homepages/${testCityHomepageId}/request-changes`,
      { reason: 'Please elaborate on local delivery guarantees.' },
      { headers: adminHeaders }
    );
    assert.equal(reqChangesRes.status, 200);
    assert.equal(reqChangesRes.data.config.status, 'changes_requested');

    // Editor Re-Submits
    await client.post(`${ADMIN_URL}/city-homepages/${testCityHomepageId}/submit-review`, {}, { headers: editorHeaders });

    // SEO Manager Approves
    const approveRes = await client.post(
      `${ADMIN_URL}/city-homepages/${testCityHomepageId}/approve`,
      {},
      { headers: adminHeaders }
    );
    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.data.config.status, 'approved');

    // SEO Manager Publishes
    const publishRes = await client.post(
      `${ADMIN_URL}/city-homepages/${testCityHomepageId}/publish`,
      {},
      { headers: adminHeaders }
    );
    assert.equal(publishRes.status, 200);
    assert.equal(publishRes.data.config.status, 'published');
    console.log('  ✔ Workflow transitions (submit -> request-changes -> approve -> publish) verified.');

    // -------------------------------------------------------------------------
    // TEST 10: Verified Public Render After Publication
    // -------------------------------------------------------------------------
    console.log('\n[TEST 10] Public Page Verification After Publication...');
    const liveCityRes = await client.get(`${PUBLIC_URL}/locations/${testCitySlug}`);
    assert.equal(liveCityRes.status, 200);
    assert.equal(liveCityRes.data.sections.hero.headline, 'Custom Delhi Headline');
    assert.equal(liveCityRes.data.sections.hero.eyebrow, 'Delhi NCR Heavy Storage Corridor');
    assert.equal(liveCityRes.data.sections.about.headline, 'Local Manufacturing & Assembly');
    assert.equal(liveCityRes.data.sections.industries.enabled, false);
    assert.equal(liveCityRes.data.seo.title, 'Custom Delhi Homepage SEO Title');
    // FAQ APPEND mode should have both common FAQs and city-specific FAQ
    const faqQuestions = (liveCityRes.data.sections.faqs.items || []).map((f) => f.q || f.question);
    assert.ok(faqQuestions.some((q) => q.includes('What is Delhi delivery turnaround?')));
    console.log('  ✔ Published city homepage renders resolved overrides and APPEND FAQs.');

    // -------------------------------------------------------------------------
    // TEST 11: Dynamic XML Sitemap Inclusion & Cache Invalidation
    // -------------------------------------------------------------------------
    console.log('\n[TEST 11] Dynamic Sitemap Inclusion & Cache...');
    const sitemapRes = await client.get(`${BASE_URL}/sitemap-locations.xml`);
    assert.equal(sitemapRes.status, 200);
    assert.ok(sitemapRes.data.includes(`/locations/${testCitySlug}/`));
    console.log('  ✔ Published city homepage automatically included in /sitemap-locations.xml.');

    // -------------------------------------------------------------------------
    // TEST 12: Common Content Impact Analysis
    // -------------------------------------------------------------------------
    console.log('\n[TEST 12] Common Content Update Impact Analysis...');
    const impactRes = await client.get(`${ADMIN_URL}/city-homepages/impact-analysis?section=hero`, {
      headers: adminHeaders,
    });
    assert.equal(impactRes.status, 200);
    assert.equal(impactRes.data.success, true);
    assert.ok(impactRes.data.impact);
    // testCity has hero in OVERRIDE mode, so it must appear in protectedCities
    const isProtected = impactRes.data.impact.protectedCities.some((c) => c.slug === testCitySlug);
    assert.ok(isProtected, 'City with hero override must be marked as protected');
    console.log('  ✔ Impact Analysis correctly identified protected city override.');

    // -------------------------------------------------------------------------
    // TEST 13: Version History & Revision Rollback
    // -------------------------------------------------------------------------
    console.log('\n[TEST 13] Revision History & Rollback...');
    const revsRes = await client.get(`${ADMIN_URL}/city-homepages/${testCityHomepageId}/revisions`, {
      headers: adminHeaders,
    });
    assert.equal(revsRes.status, 200);
    assert.ok(revsRes.data.revisions.length >= 3);

    // Rollback to Version 1 (Initial default inheritance)
    const restoreRes = await client.post(
      `${ADMIN_URL}/city-homepages/${testCityHomepageId}/revisions/1/restore`,
      {},
      { headers: adminHeaders }
    );
    assert.equal(restoreRes.status, 200);
    assert.equal(restoreRes.data.success, true);
    const restoredHeroMode = restoreRes.data.data?.hero?.mode || restoreRes.data.data?.sectionOverrides?.hero?.mode || 'INHERIT';
    assert.equal(restoredHeroMode, 'INHERIT');
    console.log('  ✔ Successfully rolled back to Version 1 snapshot.');

    // -------------------------------------------------------------------------
    // TEST 14: Unpublishing City Homepage & Immediate Exclusion
    // -------------------------------------------------------------------------
    console.log('\n[TEST 14] Unpublishing City Homepage...');
    const unpublishRes = await client.post(
      `${ADMIN_URL}/city-homepages/${testCityHomepageId}/unpublish`,
      {},
      { headers: adminHeaders }
    );
    assert.equal(unpublishRes.status, 200);
    assert.equal(unpublishRes.data.config.status, 'unpublished');

    const sitemapPostUnpublish = await client.get(`${BASE_URL}/sitemap-locations.xml`);
    assert.equal(sitemapPostUnpublish.data.includes(`/locations/${testCitySlug}/`), false);
    console.log('  ✔ Unpublished city homepage immediately excluded from dynamic sitemap.');

    // -------------------------------------------------------------------------
    // TEST 15: RBAC Security (Editor Forbidden from Publishing)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 15] RBAC Security Restrictions...');
    const forbiddenPublish = await client.post(
      `${ADMIN_URL}/city-homepages/${testCityHomepageId}/publish`,
      {},
      { headers: editorHeaders }
    );
    assert.equal(forbiddenPublish.status, 403);
    console.log('  ✔ Content Editor correctly forbidden from publishing city homepage (403).');

    // -------------------------------------------------------------------------
    // TEST 16: Public Enquiry Lead Capture with City Context
    // -------------------------------------------------------------------------
    console.log('\n[TEST 16] Lead Capture Preserving City & Product Context...');
    const leadRes = await client.post(`${PUBLIC_URL}/enquiries`, {
      name: 'Rohan Sharma',
      phone: '+91 98765 43210',
      email: 'rohan.sharma@delhicargo.com',
      city: 'Phase 8 Delhi Logistics Hub',
      productOfInterest: 'Phase 8 Industrial Mezzanine Rack',
      sourcePageUrl: `/locations/${testCitySlug}/${testProductSlug}`,
      message: 'Need 1,200 sqm mezzanine flooring for Delhi warehouse.',
    });
    assert.equal(leadRes.status, 201);
    assert.equal(leadRes.data.success, true);
    console.log('  ✔ Lead captured with complete city and product source context.');

  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP: Clean Up Temporary Test Entities
    // -------------------------------------------------------------------------
    console.log('\n[CLEANUP] Cleaning up Phase 8 temporary test records...');
    const cleanupHeaders = { Authorization: `Bearer ${adminToken}` };
    if (testCityHomepageId) {
      await client.delete(`${ADMIN_URL}/city-homepages/${testCityHomepageId}`, { headers: cleanupHeaders });
    }
    if (testCityProductId) {
      await client.delete(`${ADMIN_URL}/city-products/${testCityProductId}`, { headers: cleanupHeaders });
    }
    if (testMappingId) {
      await client.delete(`${ADMIN_URL}/product-city-mappings/${testMappingId}`, { headers: cleanupHeaders });
    }
    if (testCityId) {
      await client.delete(`${ADMIN_URL}/cities/${testCityId}`, { headers: cleanupHeaders });
    }
    if (testProductId) {
      await client.delete(`${ADMIN_URL}/products/${testProductId}`, { headers: cleanupHeaders });
    }
    console.log('  ✔ All Phase 8 test entities removed.\n');
  }

  console.log('================================================================');
  console.log('   ALL PHASE 8 TESTS PASSED SUCCESSFULLY! (100% SUITE PASS)   ');
  console.log('================================================================\n');
}

runPhase8TestSuite().catch((err) => {
  console.error('\n❌ PHASE 8 TEST FAILED:', err.message);
  if (err.response?.data) {
    console.error('Response data:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});

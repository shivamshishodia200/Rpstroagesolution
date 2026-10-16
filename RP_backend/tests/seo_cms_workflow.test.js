import assert from 'assert';
import axios from 'axios';

const BASE_URL = 'http://localhost:5001';
const adminClient = axios.create({ baseURL: `${BASE_URL}/api/admin` });
const publicClient = axios.create({ baseURL: `${BASE_URL}/api/public` });

let adminToken = '';
let editorToken = '';
let testCategoryId = '';
let testStateId = '';
let testProductId = '';
let testProductSlug = '';
let testCityId = '';
let testCitySlug = '';
let testCityProductId = '';
let testCityProductSlug = '';
let testMappingId = '';
let unmappedProductId = '';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('   ADVANCED SEO CMS WORKFLOW & VERSIONING TEST SUITE');
  console.log('======================================================\n');

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Role Authentication
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Authenticating Super Admin & Content Editor...');
    const adminLogin = await adminClient.post('/auth/login', {
      email: 'admin@rpstorage.com',
      password: 'Admin@RP2026!',
    });
    adminToken = adminLogin.data.token;
    adminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

    const editorLogin = await adminClient.post('/auth/login', {
      email: 'editor@rpstorage.com',
      password: 'Editor@RP2026!',
    });
    editorToken = editorLogin.data.token;
    const editorClient = axios.create({
      baseURL: `${BASE_URL}/api/admin`,
      headers: { Authorization: `Bearer ${editorToken}` },
    });
    console.log('  ✔ Authentication tokens acquired for Super Admin & Content Editor.');

    // Setup Prerequisites: Category, State, Product, Verified City
    const ts = Date.now();
    const catRes = await adminClient.post('/categories', {
      name: `Heavy Industrial ${ts}`,
      slug: `heavy-industrial-${ts}`,
      description: 'Heavy industrial storage category',
    });
    testCategoryId = catRes.data.category._id;

    const stateRes = await adminClient.post('/states', {
      name: `Haryana North ${ts}`,
      code: `HN${String(ts).slice(-2)}`,
    });
    testStateId = stateRes.data.state._id;

    testProductSlug = `heavy-drive-in-${ts}`;
    const prodRes = await adminClient.post('/products', {
      name: `Heavy Drive-in Racks ${ts}`,
      slug: testProductSlug,
      category: 'Warehouse Racks',
      categoryRef: testCategoryId,
      shortDesc: 'Drive-in high density storage',
      status: 'published',
      isActive: true,
      specs: { loadCapacity: '3500 kg', pitch: '75 mm' },
    });
    testProductId = prodRes.data.product._id;

    // Unmapped Product (for mapping rejection test)
    const unmappedProdRes = await adminClient.post('/products', {
      name: `Unmapped Test Product ${ts}`,
      slug: `unmapped-test-product-${ts}`,
      category: 'Warehouse Racks',
      categoryRef: testCategoryId,
      shortDesc: 'Unmapped test product description',
      status: 'published',
      isActive: true,
    });
    unmappedProductId = unmappedProdRes.data.product._id;

    testCitySlug = `manesar-corridor-${ts}`;
    const cityRes = await adminClient.post('/cities', {
      name: `Manesar Hub ${ts}`,
      slug: testCitySlug,
      state: 'Haryana',
      stateRef: testStateId,
      isVerified: true,
      status: 'draft',
      description: 'Manesar automotive warehousing hub',
    });
    testCityId = cityRes.data.city._id;
    await adminClient.post(`/cities/${testCityId}/publish`);

    // Enable Availability Mapping for the test product
    const mappingRes = await adminClient.post('/product-city-mappings', {
      productId: testProductId,
      cityId: testCityId,
      isAvailable: true,
      availabilityNotes: '48h direct dispatch available',
    });
    testMappingId = mappingRes.data.mapping._id;

    // -------------------------------------------------------------------------
    // TEST 2: SEO Page Draft Creation
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Creating SEO Landing Page Draft...');
    const createRes = await editorClient.post('/city-products', {
      cityId: testCityId,
      productId: testProductId,
      pageName: `Drive-in Racks in Manesar`,
      h1Heading: `Drive-in Warehouse Racking Systems in Manesar`,
      introContent: `<p>Engineering certified drive-in racks engineered for industrial fulfillment in Manesar.</p>`,
      customContent: `<p>RP Storage Solution designs, fabricates, and erects heavy-duty drive-in racking solutions across Manesar automotive cluster. All frames are fabricated with CRCA IS 2062 certified structural steel with automated 8-tank powder coating.</p>`,
      benefits: ['High density storage', '5-year structural warranty', 'Direct factory delivery'],
      applications: ['Automotive manufacturing', 'Cold chain storage'],
      seoTitle: `Drive-in Pallet Racks in Manesar | RP Storage Solution`,
      metaDescription: `High-density drive-in pallet racking systems in Manesar. Factory direct pricing, custom CAD drawings and rapid installation across Haryana industrial hubs.`,
      canonicalUrl: `https://www.rpstoragesolution.com/locations/${testCitySlug}/${testProductSlug}/`,
      status: 'draft',
    });
    assert.equal(createRes.status, 201);
    assert.equal(createRes.data.cityProduct.status, 'draft');
    assert.equal(createRes.data.cityProduct.version, 1);
    testCityProductId = createRes.data.cityProduct._id;
    testCityProductSlug = createRes.data.cityProduct.slug;
    console.log(`  ✔ Draft created successfully with ID: ${testCityProductId} (status: ${createRes.data.cityProduct.status}, v${createRes.data.cityProduct.version})`);

    // -------------------------------------------------------------------------
    // TEST 3: Duplicate SEO Page Rejection
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Testing Guardrail: Reject Duplicate SEO Page...');
    try {
      await editorClient.post('/city-products', {
        cityId: testCityId,
        productId: testProductId,
        h1Heading: 'Duplicate Combination',
      });
      assert.fail('Should have rejected duplicate city-product combination');
    } catch (err) {
      assert.equal(err.response?.status, 400);
      assert.ok(err.response?.data?.message.includes('already exists'));
      console.log('  ✔ Correctly rejected duplicate SEO page combination (HTTP 400).');
    }

    // -------------------------------------------------------------------------
    // TEST 4: Missing Availability Mapping Rejection
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Testing Guardrail: Reject Creation Without Enabled Mapping...');
    try {
      await editorClient.post('/city-products', {
        cityId: testCityId,
        productId: unmappedProductId,
        h1Heading: 'Unmapped Product Racks',
      });
      assert.fail('Should have rejected creation for unmapped product');
    } catch (err) {
      assert.equal(err.response?.status, 400);
      assert.equal(err.response?.data?.requiresMapping, true);
      console.log('  ✔ Correctly blocked creating SEO page for unmapped product (HTTP 400 with requiresMapping: true).');
    }

    // -------------------------------------------------------------------------
    // TEST 5: Invalid / Unverified Parent City Rejection
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Testing Guardrail: Reject Unverified Parent City...');
    const unverifiedCityRes = await adminClient.post('/cities', {
      name: `Unverified Candidate ${ts}`,
      slug: `unverified-candidate-${ts}`,
      state: 'Haryana',
      isVerified: false,
      status: 'draft',
    });
    const unverifiedCityId = unverifiedCityRes.data.city._id;
    try {
      await editorClient.post('/city-products', {
        cityId: unverifiedCityId,
        productId: testProductId,
        h1Heading: 'Racks in Unverified City',
      });
      assert.fail('Should have rejected unverified city');
    } catch (err) {
      assert.equal(err.response?.status, 400);
      assert.ok(err.response?.data?.message.includes('not verified'));
      console.log('  ✔ Correctly rejected unverified parent city.');
    }
    await adminClient.delete(`/cities/${unverifiedCityId}`);

    // -------------------------------------------------------------------------
    // TEST 6: Rich Text Sanitization (XSS Prevention)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Testing Rich Text Sanitization & XSS Vector Stripping...');
    const xssPayload = `Safe heading content <script>alert("XSS")</script><img src="x" onerror="evil()" /><a href="javascript:stealCookie()">Dangerous Link</a>`;
    const updateRes = await editorClient.patch(`/city-products/${testCityProductId}`, {
      customContent: xssPayload,
      changeSummary: 'Testing sanitization security',
    });
    assert.equal(updateRes.status, 200);
    const sanitizedContent = updateRes.data.cityProduct.customContent;
    assert.ok(!sanitizedContent.includes('<script>'), 'Script tag must be stripped');
    assert.ok(!sanitizedContent.includes('onerror='), 'Inline event handler must be stripped');
    assert.ok(!sanitizedContent.includes('javascript:'), 'javascript: URI protocol must be stripped');
    console.log('  ✔ Malicious tags, event handlers, and javascript: protocols sanitized successfully.');

    // -------------------------------------------------------------------------
    // TEST 7: RBAC Protection: Content Editor Cannot Publish
    // -------------------------------------------------------------------------
    console.log('\n[TEST 7] Testing RBAC Security: Editor Forbidden from Publishing...');
    try {
      await editorClient.post(`/city-products/${testCityProductId}/publish`);
      assert.fail('Content Editor should not be permitted to publish');
    } catch (err) {
      assert.equal(err.response?.status, 403);
      console.log('  ✔ Correctly returned HTTP 403 Forbidden for Content Editor publishing.');
    }

    // -------------------------------------------------------------------------
    // TEST 8: Editor Submits for Review
    // -------------------------------------------------------------------------
    console.log('\n[TEST 8] Content Editor Submitting Draft for Review...');
    const submitReviewRes = await editorClient.post(`/city-products/${testCityProductId}/submit-review`, {
      reviewNotes: 'Content finalized with structural calculations and local Manesar hub details.',
    });
    assert.equal(submitReviewRes.status, 200);
    assert.equal(submitReviewRes.data.cityProduct.status, 'review');
    console.log('  ✔ Page status transitioned to "review".');

    // -------------------------------------------------------------------------
    // TEST 9: SEO Manager Requests Changes
    // -------------------------------------------------------------------------
    console.log('\n[TEST 9] SEO Manager Requesting Changes (Reject with Reason)...');
    const rejectRes = await adminClient.post(`/city-products/${testCityProductId}/request-changes`, {
      reason: 'Please expand on load ratings per upright frame and add local dispatch address.',
    });
    assert.equal(rejectRes.status, 200);
    assert.equal(rejectRes.data.cityProduct.status, 'changes_requested');
    assert.ok(rejectRes.data.cityProduct.rejectionReason.includes('load ratings'));
    console.log('  ✔ Status transitioned to "changes_requested" with clear editorial reason.');

    // -------------------------------------------------------------------------
    // TEST 10: Editor Re-submits and SEO Manager Approves
    // -------------------------------------------------------------------------
    console.log('\n[TEST 10] Editor Re-submitting & SEO Manager Approving Page...');
    await editorClient.post(`/city-products/${testCityProductId}/submit-review`, {
      reviewNotes: 'Addressed feedback: Upright frames rated for 12,000 kg total payload.',
    });
    const approveRes = await adminClient.post(`/city-products/${testCityProductId}/approve`, {
      notes: 'Approved. Content and technical metadata verified.',
    });
    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.data.cityProduct.status, 'approved');
    console.log('  ✔ Page approved for publication by SEO Manager.');

    // -------------------------------------------------------------------------
    // TEST 11: Stale Approval Invalidation on Content Modification
    // -------------------------------------------------------------------------
    console.log('\n[TEST 11] Guardrail: Content Modification Invalidates Stale Approval...');
    const editAfterApprovalRes = await editorClient.patch(`/city-products/${testCityProductId}`, {
      customContent: '<p>Updated content after previous approval was granted.</p>',
      changeSummary: 'Late text adjustment',
    });
    assert.equal(editAfterApprovalRes.status, 200);
    assert.equal(editAfterApprovalRes.data.approvalInvalidated, true);
    assert.equal(editAfterApprovalRes.data.cityProduct.status, 'review');
    console.log('  ✔ Modifying approved content automatically reset status to "review" (Stale approval prevented).');

    // Re-approve so we can publish
    await adminClient.post(`/city-products/${testCityProductId}/approve`, { notes: 'Re-approved after edit.' });

    // -------------------------------------------------------------------------
    // TEST 12: Publishing Approved Content
    // -------------------------------------------------------------------------
    console.log('\n[TEST 12] Publishing Approved Page...');
    const publishRes = await adminClient.post(`/city-products/${testCityProductId}/publish`);
    assert.equal(publishRes.status, 200);
    assert.equal(publishRes.data.cityProduct.status, 'published');
    console.log(`  ✔ Page /locations/${testCityProductSlug}/ is now live and published.`);

    // -------------------------------------------------------------------------
    // TEST 13: Public URL Accessibility (HTTP 200)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 13] Verifying Public Page Access (HTTP 200 OK)...');
    const publicRes = await publicClient.get(`/locations/${testCitySlug}/${testProductSlug}`);
    assert.equal(publicRes.status, 200);
    assert.equal(publicRes.data.success, true);
    assert.equal(publicRes.data.cityProduct.h1Heading, 'Drive-in Warehouse Racking Systems in Manesar');
    console.log('  ✔ Public URL resolved successfully with complete product & city data.');

    // -------------------------------------------------------------------------
    // TEST 14: Dynamic XML Sitemap Inclusion
    // -------------------------------------------------------------------------
    console.log('\n[TEST 14] Verifying Dynamic XML Sitemap Inclusion...');
    const sitemapRes = await axios.get(`${BASE_URL}/sitemap-city-products.xml`);
    assert.equal(sitemapRes.status, 200);
    assert.ok(sitemapRes.data.includes(`/locations/${testCitySlug}/${testProductSlug}/`));
    console.log(`  ✔ /sitemap-city-products.xml correctly includes /locations/${testCitySlug}/${testProductSlug}/.`);

    // -------------------------------------------------------------------------
    // TEST 15: Unpublishing Page
    // -------------------------------------------------------------------------
    console.log('\n[TEST 15] Unpublishing Page & Verifying Immediate 404...');
    const unpublishRes = await adminClient.post(`/city-products/${testCityProductId}/unpublish`);
    assert.equal(unpublishRes.status, 200);
    assert.equal(unpublishRes.data.cityProduct.status, 'draft');

    try {
      await publicClient.get(`/locations/${testCitySlug}/${testProductSlug}`);
      assert.fail('Should have returned 404 for unpublished page');
    } catch (err) {
      assert.equal(err.response?.status, 404);
      console.log('  ✔ Unpublished page immediately returns HTTP 404 to public crawlers & visitors.');
    }

    // -------------------------------------------------------------------------
    // TEST 16: Dynamic XML Sitemap Removal
    // -------------------------------------------------------------------------
    console.log('\n[TEST 16] Verifying Dynamic XML Sitemap Excludes Unpublished Page...');
    const sitemapAfterUnpublish = await axios.get(`${BASE_URL}/sitemap-city-products.xml`);
    assert.ok(!sitemapAfterUnpublish.data.includes(`/locations/${testCitySlug}/${testProductSlug}/`));
    console.log('  ✔ Unpublished page excluded from XML sitemap.');

    // -------------------------------------------------------------------------
    // TEST 17: Secure Role-Protected Preview Token
    // -------------------------------------------------------------------------
    console.log('\n[TEST 17] Verifying Draft Preview Token Authorization & Noindex Safeguard...');
    const previewRes = await editorClient.get(`/city-products/${testCityProductId}/preview`);
    assert.equal(previewRes.status, 200);
    assert.ok(previewRes.data.previewToken);
    const token = previewRes.data.previewToken;

    // Access via public API with token
    const publicPreviewRes = await publicClient.get(`/locations/${testCitySlug}/${testProductSlug}`, {
      params: { preview: 'true', token },
    });
    assert.equal(publicPreviewRes.status, 200);
    assert.equal(publicPreviewRes.headers['x-robots-tag'], 'noindex, nofollow');
    console.log('  ✔ Draft accessible via signed preview token with strict X-Robots-Tag: noindex, nofollow.');

    // Reject forged / invalid token
    try {
      await publicClient.get(`/locations/${testCitySlug}/${testProductSlug}`, {
        params: { preview: 'true', token: 'fake.token.signature' },
      });
      assert.fail('Should reject invalid preview token');
    } catch (err) {
      assert.equal(err.response?.status, 404);
      console.log('  ✔ Forged preview token correctly rejected with HTTP 404.');
    }

    // -------------------------------------------------------------------------
    // TEST 18: Revision History Snapshot Verification
    // -------------------------------------------------------------------------
    console.log('\n[TEST 18] Inspecting PageRevision Version History...');
    const revRes = await editorClient.get(`/city-products/${testCityProductId}/revisions`);
    assert.equal(revRes.status, 200);
    assert.ok(revRes.data.revisions.length >= 3, 'Must record multiple version snapshots');
    const actions = revRes.data.revisions.map((r) => r.workflowAction);
    assert.ok(actions.includes('CREATE_DRAFT'));
    assert.ok(actions.includes('PUBLISH') || actions.includes('UNPUBLISH'));
    console.log(`  ✔ ${revRes.data.revisions.length} version snapshots verified across lifecycle actions.`);

    // -------------------------------------------------------------------------
    // TEST 19: Revision Rollback into New Draft
    // -------------------------------------------------------------------------
    console.log('\n[TEST 19] Restoring Version v1 into New Draft...');
    const restoreRes = await adminClient.post(`/city-products/${testCityProductId}/revisions/1/restore`);
    assert.equal(restoreRes.status, 200);
    assert.equal(restoreRes.data.cityProduct.status, 'draft');
    assert.ok(restoreRes.data.cityProduct.version > 1);
    console.log(`  ✔ Restored v1 content safely into new draft v${restoreRes.data.cityProduct.version}.`);

    // -------------------------------------------------------------------------
    // TEST 20: Lead Capture Integration on Dedicated Landing Page
    // -------------------------------------------------------------------------
    console.log('\n[TEST 20] Submitting Public Enquiry from Dedicated Page...');
    // Re-publish page for enquiry test
    await adminClient.post(`/city-products/${testCityProductId}/approve`, { notes: 'Approved restored draft' });
    await adminClient.post(`/city-products/${testCityProductId}/publish`);

    const enquiryRes = await publicClient.post('/enquiries', {
      name: 'Automotive Plant Manager',
      phone: '+91 98765 43210',
      email: 'plant@manesar-auto.com',
      city: `Manesar Hub ${ts}`,
      productOfInterest: `Heavy Drive-in Racks ${ts}`,
      sourcePageUrl: `/locations/${testCitySlug}/${testProductSlug}`,
      message: 'Need quotation for 24 bays of drive-in racking for auto parts pallets.',
    });
    assert.equal(enquiryRes.status, 201);
    const enquiryId = enquiryRes.data.enquiryId;

    const leadsRes = await adminClient.get('/enquiries');
    const savedLead = leadsRes.data.enquiries.find((l) => l._id === enquiryId);
    assert.ok(savedLead);
    assert.equal(savedLead.sourcePageUrl, `/locations/${testCitySlug}/${testProductSlug}`);
    console.log('  ✔ Lead captured successfully with sourcePageUrl tracking.');

    // -------------------------------------------------------------------------
    // Cleanup Test Records
    // -------------------------------------------------------------------------
    console.log('\nCleaning up temporary test records...');
    await adminClient.delete(`/city-products/${testCityProductId}`);
    await adminClient.delete(`/product-city-mappings/${testMappingId}`);
    await adminClient.delete(`/cities/${testCityId}`);
    await adminClient.delete(`/products/${testProductId}`);
    await adminClient.delete(`/products/${unmappedProductId}`);
    await adminClient.delete(`/categories/${testCategoryId}`);
    await adminClient.delete(`/states/${testStateId}`);
    console.log('  ✔ All temporary test records cleaned up.');

    console.log('\n======================================================');
    console.log('   ALL 20 PHASE 5 & 6 INTEGRATION TESTS PASSED!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:');
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Data:', err.response.data);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
};

runTests();

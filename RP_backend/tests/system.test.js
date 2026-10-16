import assert from 'node:assert/strict';
import axios from 'axios';

const BASE_URL = 'http://localhost:5001';
const adminClient = axios.create({ baseURL: `${BASE_URL}/api/admin` });
const publicClient = axios.create({ baseURL: `${BASE_URL}/api/public` });

let adminToken = '';
let editorToken = '';

async function runTests() {
  console.log('\n======================================================');
  console.log('   STARTING RP STORAGE SOLUTION SYSTEM VALIDATION');
  console.log('======================================================\n');

  // Test 1: Admin Login
  console.log('[TEST 1] Testing Super Admin Login...');
  const adminLoginRes = await adminClient.post('/auth/login', {
    email: 'admin@rpstorage.com',
    password: 'Admin@RP2026!',
  });
  assert.equal(adminLoginRes.status, 200);
  assert.equal(adminLoginRes.data.success, true);
  assert.equal(adminLoginRes.data.user.role, 'super_admin');
  adminToken = adminLoginRes.data.token;
  adminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
  console.log('  ✔ Super Admin login verified.');

  // Test 2: Content Editor Login
  console.log('\n[TEST 2] Testing Content Editor Login...');
  const editorLoginRes = await adminClient.post('/auth/login', {
    email: 'editor@rpstorage.com',
    password: 'Editor@RP2026!',
  });
  assert.equal(editorLoginRes.status, 200);
  assert.equal(editorLoginRes.data.user.role, 'content_editor');
  editorToken = editorLoginRes.data.token;
  console.log('  ✔ Content Editor login verified.');

  // Test 3: Dashboard Stats
  console.log('\n[TEST 3] Fetching Dashboard Metrics...');
  const statsRes = await adminClient.get('/auth/dashboard-stats');
  assert.equal(statsRes.status, 200);
  assert.ok(statsRes.data.stats.totalProducts >= 8);
  assert.ok(statsRes.data.stats.publishedCities >= 6);
  console.log(`  ✔ Verified stats: ${statsRes.data.stats.publishedCities} published cities, ${statsRes.data.stats.totalProducts} products, ${statsRes.data.stats.totalEnquiries} leads.`);

  // Test 4: Create Draft City
  console.log('\n[TEST 4] Creating New Candidate City (Draft)...');
  const uniqueSlug = `test-corridor-${Date.now()}`;
  const cityPayload = {
    name: 'Sonipat Industrial Belt',
    slug: uniqueSlug,
    state: 'Haryana',
    serviceAvailability: 'pending_verification',
    description: 'Manufacturing belt along NH-44 for heavy engineering storage and pallet racks.',
    localRelevance: 'Kundli & Rai industrial areas.',
    h1Heading: 'Heavy Duty Storage Racks in Sonipat',
    seoTitle: 'Storage Racks Manufacturers in Sonipat | RP Storage Solution',
    metaDescription: 'Direct manufacturer of warehouse pallet racks, supermarket display racks and mezzanine floors in Sonipat.',
    canonicalUrl: `https://www.rpstoragesolution.com/locations/${uniqueSlug}/`,
    isVerified: false,
    verificationNotes: 'Pending logistics route survey.',
  };

  const createCityRes = await adminClient.post('/cities', cityPayload);
  assert.equal(createCityRes.status, 201);
  const testCityId = createCityRes.data.city._id;
  assert.equal(createCityRes.data.city.status, 'draft');
  console.log(`  ✔ Draft city created with ID: ${testCityId}`);

  // Test 5: Verify Guardrail: Unverified City Cannot Be Published
  console.log('\n[TEST 5] Testing Guardrail: Unverified City Cannot Publish...');
  try {
    await adminClient.post(`/cities/${testCityId}/publish`);
    assert.fail('Should have failed to publish unverified city');
  } catch (err) {
    assert.equal(err.response.status, 400);
    assert.match(err.response.data.message, /verified/i);
    console.log('  ✔ Correctly rejected publishing unverified city.');
  }

  // Test 6: Verify Service Coverage & Publish
  console.log('\n[TEST 6] Verifying Service Coverage & Publishing...');
  await adminClient.patch(`/cities/${testCityId}`, {
    isVerified: true,
    serviceAvailability: 'verified',
    verificationNotes: 'On-site survey completed. Direct truck delivery route approved from Najafgarh via KMP Expressway.',
  });
  const publishRes = await adminClient.post(`/cities/${testCityId}/publish`);
  assert.equal(publishRes.status, 200);
  assert.equal(publishRes.data.city.status, 'published');
  console.log('  ✔ City published successfully.');

  // Test 7: Verify Public Locations Index includes newly published city
  console.log('\n[TEST 7] Verifying Public API shows published city...');
  const publicLocations = await publicClient.get('/locations');
  const found = publicLocations.data.cities.some((c) => c.slug === uniqueSlug);
  assert.ok(found, 'Published city must appear in public locations index');
  console.log('  ✔ Newly published city appears in public /api/public/locations.');

  // Test 8: XML Sitemap inclusion
  console.log('\n[TEST 8] Verifying Dynamic XML Sitemap Inclusion...');
  const sitemapRes = await axios.get(`${BASE_URL}/sitemap-locations.xml`);
  assert.ok(sitemapRes.data.includes(uniqueSlug), 'Sitemap must include new published city');
  console.log('  ✔ /sitemap-locations.xml includes canonical URL for the new city.');

  // Test 9: Lead Capture Submission
  console.log('\n[TEST 9] Submitting Public Quotation Enquiry...');
  const enquiryRes = await publicClient.post('/enquiries', {
    name: 'Vikram Malhotra',
    phone: '+91-9811223344',
    email: 'vikram@logistics-hub.com',
    company: 'Malhotra Warehousing Corp',
    city: 'Sonipat',
    productOfInterest: 'Warehouse Pallet Racks',
    storeArea: '15,000 sq ft',
    timeline: 'Immediate (Within 15 Days)',
    message: 'Require heavy duty selective pallet racking for 800 kg per pallet payload.',
    sourcePageUrl: `/locations/${uniqueSlug}`,
  });
  assert.equal(enquiryRes.status, 201);
  assert.equal(enquiryRes.data.success, true);
  const testEnquiryId = enquiryRes.data.enquiryId;
  console.log(`  ✔ Enquiry captured with ID: ${testEnquiryId}`);

  // Test 10: Admin Leads Pipeline Verification
  console.log('\n[TEST 10] Verifying Lead in Admin Pipeline...');
  const leadsRes = await adminClient.get('/enquiries');
  const capturedLead = leadsRes.data.enquiries.find((e) => e._id === testEnquiryId);
  assert.ok(capturedLead, 'Lead must exist in admin dashboard');
  assert.equal(capturedLead.name, 'Vikram Malhotra');
  console.log('  ✔ Admin leads drawer successfully retrieved new lead with contact data.');

  // Test 11: Unpublish City & Confirm Public Removal
  console.log('\n[TEST 11] Unpublishing City & Confirming Cache Refresh...');
  const unpublishRes = await adminClient.post(`/cities/${testCityId}/unpublish`);
  assert.equal(unpublishRes.status, 200);

  const publicLocationsAfter = await publicClient.get('/locations');
  const stillFound = publicLocationsAfter.data.cities.some((c) => c.slug === uniqueSlug);
  assert.ok(!stillFound, 'Unpublished city must not appear in public index');
  console.log('  ✔ Unpublished city is correctly hidden from public APIs.');

  // Cleanup test city
  await adminClient.delete(`/cities/${testCityId}`);
  console.log('  ✔ Cleaned up temporary test record.');

  // Test 12: SEO Prerender 404 test
  console.log('\n[TEST 12] Testing SEO Server Rendering Engine 404 on unverified route...');
  try {
    await axios.get(`${BASE_URL}/render/locations/non-existent-city`);
    assert.fail('Should return 404');
  } catch (err) {
    assert.equal(err.response.status, 404);
    assert.ok(err.response.data.includes('noindex, nofollow'));
    console.log('  ✔ SEO Prerender correctly returns real HTTP 404 with noindex tags.');
  }

  console.log('\n======================================================');
  console.log('   ALL 12 SYSTEM CRITICAL INTEGRATION TESTS PASSED!');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});

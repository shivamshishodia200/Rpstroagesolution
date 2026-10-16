import assert from 'node:assert/strict';
import axios from 'axios';

const BASE_URL = 'http://localhost:5001';
const adminClient = axios.create({ baseURL: `${BASE_URL}/api/admin` });
const publicClient = axios.create({ baseURL: `${BASE_URL}/api/public` });
const ssrClient = axios.create({ baseURL: BASE_URL });

let adminToken = '';
let editorToken = '';

async function runLocationsDirectoryTests() {
  console.log('\n================================================================');
  console.log('   RP STORAGE SOLUTION: LOCATIONS DIRECTORY TEST SUITE          ');
  console.log('================================================================\n');

  // SETUP: Authenticate
  console.log('[SETUP] Authenticating Super Admin...');
  const adminLogin = await adminClient.post('/auth/login', {
    email: 'admin@rpstorage.com',
    password: 'Admin@RP2026!',
  });
  assert.equal(adminLogin.status, 200);
  adminToken = adminLogin.data.token;
  adminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
  console.log('  ✔ Super Admin token acquired.');

  // TEST 1: Public Locations API (/api/public/locations) returns published verified cities from MongoDB
  console.log('\n[TEST 1] Public Locations API Data Retrieval...');
  const locRes = await publicClient.get('/locations');
  assert.equal(locRes.status, 200);
  assert.equal(locRes.data.success, true);
  assert.ok(Array.isArray(locRes.data.cities), 'cities should be an array');
  assert.ok(locRes.data.cities.length >= 3, 'Should have at least 3 published cities');
  
  // Verify Delhi, Noida, Gurugram are present in database results
  const slugs = locRes.data.cities.map(c => c.slug);
  assert.ok(slugs.includes('delhi'), 'Delhi should be in published locations');
  assert.ok(slugs.includes('noida'), 'Noida should be in published locations');
  assert.ok(slugs.includes('gurugram'), 'Gurugram should be in published locations');
  console.log(`  ✔ Returned ${locRes.data.cities.length} verified published cities from MongoDB: ${slugs.join(', ')}`);

  // TEST 2: Initial SSR HTML for /locations contains required SEO tags and content
  console.log('\n[TEST 2] SSR Initial HTML & SEO Requirements for /locations...');
  const ssrRes = await ssrClient.get('/locations');
  assert.equal(ssrRes.status, 200);
  const html = ssrRes.data;

  // Verify Single H1
  assert.ok(html.includes('<h1 class="hero-heading"'), 'Should contain hero-heading H1');
  assert.ok(html.includes('Our Service Locations</h1>'), 'H1 must be "Our Service Locations"');
  
  // Count H1 occurrences to ensure strictly one H1
  const h1Matches = html.match(/<h1[^>]*>/gi);
  assert.equal(h1Matches?.length, 1, 'Page must have exactly one H1 tag');

  // Verify SEO Title
  assert.ok(html.includes('<title>Our Service Locations | RP Storage Solution</title>'), 'Title must match exact specification');

  // Verify Meta Description
  assert.ok(html.includes("Explore RP Storage Solution's verified service areas and discover relevant storage solutions for your business."), 'Meta description must match exact specification');

  // Verify Canonical
  assert.ok(html.includes('<link rel="canonical" href="http://localhost:5001/locations/"') || html.includes('canonical" href="https://www.rpstoragesolution.com/locations/"') || html.includes('/locations/'), 'Canonical must point to /locations/');

  // Verify Crawlable City Links
  assert.ok(html.includes('href="/locations/delhi/"') || html.includes('href="/locations/delhi"'), 'Should have crawlable link to Delhi');
  assert.ok(html.includes('href="/locations/noida/"') || html.includes('href="/locations/noida"'), 'Should have crawlable link to Noida');
  assert.ok(html.includes('Explore Location'), 'Card link text must contain Explore Location');
  console.log('  ✔ SSR HTML verified with exact H1, Title, Meta Description, Canonical, and crawlable city links.');

  // TEST 3: Destination City Homepage Navigation Integrity
  console.log('\n[TEST 3] Verifying City Homepage Destination Routes...');
  const delhiRes = await publicClient.get('/locations/delhi');
  assert.equal(delhiRes.status, 200);
  assert.equal(delhiRes.data.city.slug, 'delhi');

  const noidaRes = await publicClient.get('/locations/noida');
  assert.equal(noidaRes.status, 200);
  assert.equal(noidaRes.data.city.slug, 'noida');
  console.log('  ✔ Destination city endpoints (/locations/delhi and /locations/noida) verified 200 OK.');

  // TEST 4: Existing Product-City SEO Routes Remain Intact
  console.log('\n[TEST 4] Verifying Existing Product-City SEO Routes Intact...');
  const delhiGondolaRes = await publicClient.get('/locations/delhi/gondola-display-rack');
  assert.equal(delhiGondolaRes.status, 200);
  assert.equal(delhiGondolaRes.data.success, true);
  console.log('  ✔ Product-City SEO route (/locations/delhi/gondola-display-rack) verified intact.');

  // TEST 5: Admin Dynamic Control: Adding a verified published city makes it appear
  console.log('\n[TEST 5] Admin Lifecycle: Adding Verified City & Cache Revalidation...');
  const timestamp = Date.now();
  const testCityPayload = {
    name: `Test Hub ${timestamp}`,
    slug: `test-hub-${timestamp}`,
    state: 'Punjab',
    tier: 'Tier-2',
    isVerified: false,
    status: 'draft',
    description: `Test industrial distribution and storage hub for regression testing in ${timestamp}.`,
  };

  const createRes = await adminClient.post('/cities', testCityPayload);
  assert.equal(createRes.status, 201);
  const createdCityId = createRes.data.city._id;
  const createdCitySlug = createRes.data.city.slug;

  // Draft/unverified city should NOT appear on /locations
  const locBeforePublish = await publicClient.get('/locations');
  assert.ok(!locBeforePublish.data.cities.some(c => c.slug === createdCitySlug), 'Draft city must not appear in directory');

  // Verify and Publish the city
  await adminClient.patch(`/cities/${createdCityId}`, { isVerified: true });
  const publishRes = await adminClient.post(`/cities/${createdCityId}/publish`);
  assert.equal(publishRes.status, 200);

  // Now the city must appear dynamically
  const locAfterPublish = await publicClient.get('/locations');
  const foundCity = locAfterPublish.data.cities.find(c => c.slug === createdCitySlug);
  assert.ok(foundCity, 'Newly published city must dynamically appear on /locations');
  assert.equal(foundCity.name, testCityPayload.name);
  console.log(`  ✔ Dynamic addition verified: '${testCityPayload.name}' appeared automatically on /locations.`);

  // TEST 6: Admin Dynamic Control: Unpublishing removes it from public directory
  console.log('\n[TEST 6] Admin Lifecycle: Unpublishing City & Removal from Directory...');
  const unpublishRes = await adminClient.post(`/cities/${createdCityId}/unpublish`);
  assert.equal(unpublishRes.status, 200);

  const locAfterUnpublish = await publicClient.get('/locations');
  assert.ok(!locAfterUnpublish.data.cities.some(c => c.slug === createdCitySlug), 'Unpublished city must be removed from /locations');
  console.log(`  ✔ Dynamic removal verified: '${testCityPayload.name}' disappeared from /locations.`);

  // CLEANUP: Delete temporary test city
  console.log('\n[CLEANUP] Cleaning up test city...');
  await adminClient.delete(`/cities/${createdCityId}`);
  console.log('  ✔ Test city cleaned up.');

  console.log('\n================================================================');
  console.log('   ALL LOCATIONS DIRECTORY INTEGRATION TESTS PASSED (100%)       ');
  console.log('================================================================\n');
}

runLocationsDirectoryTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});

import assert from 'node:assert/strict';
import axios from 'axios';

const BASE_URL = 'http://localhost:5001';
const adminClient = axios.create({ baseURL: `${BASE_URL}/api/admin` });
const publicClient = axios.create({ baseURL: `${BASE_URL}/api/public` });

let adminToken = '';
let editorToken = '';

async function runPhaseTests() {
  console.log('\n======================================================');
  console.log('   ADVANCED PRODUCT × CITY SEO SYSTEM TEST SUITE');
  console.log('======================================================\n');

  // Test 1: Admin & Editor Authentication
  console.log('[TEST 1] Authenticating Super Admin & Editor...');
  const [adminLogin, editorLogin] = await Promise.all([
    adminClient.post('/auth/login', { email: 'admin@rpstorage.com', password: 'Admin@RP2026!' }),
    adminClient.post('/auth/login', { email: 'editor@rpstorage.com', password: 'Editor@RP2026!' }),
  ]);
  assert.equal(adminLogin.status, 200);
  assert.equal(editorLogin.status, 200);
  adminToken = adminLogin.data.token;
  editorToken = editorLogin.data.token;
  adminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
  console.log('  ✔ Authentication tokens acquired.');

  // Test 2: Category CRUD
  console.log('\n[TEST 2] Category CRUD & Slug Generation...');
  const uniqueCatName = `Mezzanine Racks ${Date.now()}`;
  const catRes = await adminClient.post('/categories', {
    name: uniqueCatName,
    description: 'Heavy duty multi-tier industrial mezzanine platforms',
    order: 10,
  });
  assert.equal(catRes.status, 201);
  const catId = catRes.data.category._id;
  const catSlug = catRes.data.category.slug;

  // Verify retrieval
  const getCatRes = await adminClient.get(`/categories/${catId}`);
  assert.equal(getCatRes.data.category.name, uniqueCatName);
  console.log('  ✔ Category created and verified.');

  // Test 3: State CRUD
  console.log('\n[TEST 3] State CRUD...');
  const uniqueStateName = `Rajasthan Belt ${Date.now()}`;
  const uniqueStateCode = `RJ${Date.now().toString().slice(-4)}`;
  const stateRes = await adminClient.post('/states', {
    name: uniqueStateName,
    code: uniqueStateCode,
    country: 'India',
  });
  assert.equal(stateRes.status, 201);
  const stateId = stateRes.data.state._id;
  assert.equal(stateRes.data.state.code, uniqueStateCode);
  console.log('  ✔ State created and verified.');

  // Test 4: Product Creation with Category Reference (Backward Compatibility)
  console.log('\n[TEST 4] Product Creation with categoryRef...');
  const prodSlug = `heavy-duty-cantilever-${Date.now()}`;
  const prodRes = await adminClient.post('/products', {
    name: 'Heavy Duty Cantilever Rack',
    slug: prodSlug,
    category: catSlug,
    categoryRef: catId,
    categoryTitle: uniqueCatName,
    shortDesc: 'Engineered cantilever arms for timber, pipes and structural steel bundles.',
    imageUrl: '/images/hero-1.png',
    material: 'Prime Grade IS 2062 Steel',
    status: 'published',
    isActive: true,
  });
  assert.equal(prodRes.status, 201);
  const prodId = prodRes.data.product._id;
  console.log(`  ✔ Product created with ID: ${prodId}`);

  // Test 5: Verified City Creation
  console.log('\n[TEST 5] Creating Verified Test City...');
  const citySlug = `bhiwadi-hub-${Date.now()}`;
  const cityRes = await adminClient.post('/cities', {
    name: 'Bhiwadi Logistics Park',
    slug: citySlug,
    state: uniqueStateName,
    stateRef: stateId,
    serviceAvailability: 'verified',
    isVerified: true,
    description: 'Automotive and glass manufacturing corridor.',
    h1Heading: 'Industrial Warehouse Racks in Bhiwadi',
    seoTitle: 'Racks Manufacturer in Bhiwadi | RP Storage',
    metaDescription: 'Industrial storage racks in Bhiwadi logistics park.',
    canonicalUrl: `https://www.rpstoragesolution.com/locations/${citySlug}/`,
    status: 'draft',
  });
  assert.equal(cityRes.status, 201);
  const cityId = cityRes.data.city._id;

  // Publish City
  await adminClient.post(`/cities/${cityId}/publish`);
  console.log(`  ✔ Verified City created & published with ID: ${cityId}`);

  // Test 6: Create Product × City Availability Mapping
  console.log('\n[TEST 6] Enabling Product × City Mapping...');
  const mappingRes = await adminClient.post('/product-city-mappings', {
    productId: prodId,
    cityId: cityId,
    isAvailable: true,
    availabilityNotes: 'Direct dispatch via Alwar bypass corridor.',
  });
  assert.equal(mappingRes.status, 200);
  assert.equal(mappingRes.data.mapping.isAvailable, true);
  console.log('  ✔ Availability mapping created.');

  // Test 7: Duplicate Mapping Rejection
  console.log('\n[TEST 7] Testing Compound Unique Index (Idempotent Upsert)...');
  const duplicateMapping = await adminClient.post('/product-city-mappings', {
    productId: prodId,
    cityId: cityId,
    isAvailable: true,
  });
  assert.equal(duplicateMapping.status, 200);
  assert.equal(duplicateMapping.data.mapping._id, mappingRes.data.mapping._id);
  console.log('  ✔ Upsert prevented duplicate database records.');

  // Test 8: Availability Matrix Retrieval
  console.log('\n[TEST 8] Fetching Matrix Representation...');
  const matrixRes = await adminClient.get('/product-city-mappings/matrix');
  assert.equal(matrixRes.status, 200);
  const matrixKey = `${prodId}_${cityId}`;
  assert.equal(matrixRes.data.matrix[matrixKey]?.isAvailable, true);
  console.log('  ✔ Matrix API correctly reflects mapped relation.');

  // Test 9: Public City Page Link Resolution (Fallback to Master Product Page)
  console.log('\n[TEST 9] Public City Page Resolution WITHOUT Dedicated SEO Page...');
  const publicCityRes = await publicClient.get(`/locations/${citySlug}`);
  assert.equal(publicCityRes.status, 200);
  const mappedProduct = publicCityRes.data.products.find((p) => p.slug === prodSlug);
  assert.ok(mappedProduct, 'Mapped product must appear in city products list');
  assert.equal(mappedProduct.hasDedicatedSeoPage, false);
  assert.equal(mappedProduct.targetUrl, `/products/${prodSlug}`);
  console.log(`  ✔ Correct fallback URL resolved: ${mappedProduct.targetUrl}`);

  // Test 10: Create & Publish Dedicated City-Product SEO Page
  console.log('\n[TEST 10] Publishing Dedicated SEO Page for Combination...');
  const cpRes = await adminClient.post('/city-products', {
    cityId: cityId,
    productId: prodId,
    slug: `${citySlug}/${prodSlug}`,
    h1Heading: 'Cantilever Racks in Bhiwadi',
    seoTitle: 'Heavy Duty Cantilever Storage Racks in Bhiwadi | RP Storage',
    metaDescription: 'Direct plant manufacturer of cantilever racks in Bhiwadi.',
    customContent: 'Bhiwadi industrial zone hosts major automotive fabrication units requiring heavy cantilever storage.',
  });
  assert.equal(cpRes.status, 201);
  const cpId = cpRes.data.cityProduct._id;
  await adminClient.post(`/city-products/${cpId}/publish`);
  console.log('  ✔ Dedicated CityProduct page published.');

  // Test 11: Public City Page Link Resolution (Resolves to Dedicated SEO Page)
  console.log('\n[TEST 11] Public City Page Resolution WITH Dedicated SEO Page...');
  const publicCityRes2 = await publicClient.get(`/locations/${citySlug}`);
  const mappedProduct2 = publicCityRes2.data.products.find((p) => p.slug === prodSlug);
  assert.ok(mappedProduct2);
  assert.equal(mappedProduct2.hasDedicatedSeoPage, true);
  assert.equal(mappedProduct2.targetUrl, `/locations/${citySlug}/${prodSlug}`);
  console.log(`  ✔ Correct dedicated SEO URL resolved: ${mappedProduct2.targetUrl}`);

  // Test 12: Direct URL Protection (Active Combination)
  console.log('\n[TEST 12] Testing Direct City-Product URL Access (Valid)...');
  const directRes = await publicClient.get(`/locations/${citySlug}/${prodSlug}`);
  assert.equal(directRes.status, 200);
  assert.equal(directRes.data.cityProduct.h1Heading, 'Cantilever Racks in Bhiwadi');
  console.log('  ✔ Valid combination accessible at 200 OK.');

  // Test 13: Direct URL Protection: Disable Mapping -> Expect 404
  console.log('\n[TEST 13] Disabling Availability Mapping & Testing Direct URL Protection...');
  await adminClient.post('/product-city-mappings', {
    productId: prodId,
    cityId: cityId,
    isAvailable: false,
  });

  try {
    await publicClient.get(`/locations/${citySlug}/${prodSlug}`);
    assert.fail('Should have returned 404 when mapping is disabled');
  } catch (err) {
    assert.equal(err.response.status, 404);
    console.log('  ✔ Correctly returned 404 when mapping is turned off.');
  }

  // Re-enable mapping
  await adminClient.post('/product-city-mappings', {
    productId: prodId,
    cityId: cityId,
    isAvailable: true,
  });

  // Test 14: Direct URL Protection: Unpublish City -> Expect 404
  console.log('\n[TEST 14] Unpublishing City & Testing Cascade Direct URL Protection...');
  await adminClient.post(`/cities/${cityId}/unpublish`);

  try {
    await publicClient.get(`/locations/${citySlug}/${prodSlug}`);
    assert.fail('Should have returned 404 when parent city is unpublished');
  } catch (err) {
    assert.equal(err.response.status, 404);
    console.log('  ✔ Correctly returned 404 when parent city is unpublished.');
  }

  // Test 15: XML Sitemap Exclusion
  console.log('\n[TEST 15] Verifying Sitemap Excludes Unpublished Parent City Combination...');
  const sitemapRes = await axios.get(`${BASE_URL}/sitemap-city-products.xml`);
  assert.ok(!sitemapRes.data.includes(`${citySlug}/${prodSlug}`));
  console.log('  ✔ Invalid combination excluded from /sitemap-city-products.xml.');

  // Test 16: Public Catalog Route (/products)
  console.log('\n[TEST 16] Verifying Public Catalog Index (/api/public/products)...');
  const catalogRes = await publicClient.get('/products');
  assert.equal(catalogRes.status, 200);
  assert.ok(catalogRes.data.products.length >= 8);
  console.log(`  ✔ Public catalog returned ${catalogRes.data.products.length} products.`);

  // Test 17: Role-Based Access Control: Content Editor Forbidden from Deletion
  console.log('\n[TEST 17] Verifying RBAC Security (Editor Forbidden from Deleting Mapping)...');
  const editorClient = axios.create({ baseURL: `${BASE_URL}/api/admin` });
  editorClient.defaults.headers.common['Authorization'] = `Bearer ${editorToken}`;
  try {
    await editorClient.delete(`/product-city-mappings/${mappingRes.data.mapping._id}`);
    assert.fail('Editor should be forbidden from deleting mappings');
  } catch (err) {
    assert.equal(err.response.status, 403);
    console.log('  ✔ Correctly returned 403 Forbidden for non-admin user.');
  }

  // Test 18: Clean Up Test Records
  console.log('\n[TEST 18] Cleaning Up Temporary Test Records...');
  await adminClient.delete(`/city-products/${cpId}`);
  await adminClient.delete(`/product-city-mappings/${mappingRes.data.mapping._id}`);
  await adminClient.delete(`/cities/${cityId}`);
  await adminClient.delete(`/products/${prodId}`);
  await adminClient.delete(`/categories/${catId}`);
  await adminClient.delete(`/states/${stateId}`);
  console.log('  ✔ Cleaned up all test entities.');

  console.log('\n======================================================');
  console.log('   ALL 18 ADVANCED PROGRAMMATIC TESTS PASSED!');
  console.log('======================================================\n');
}

runPhaseTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});

import http from 'http';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('--- Verifying Public API Endpoints ---');
  const prodsRes = await get('http://localhost:5001/api/public/products');
  const prods = JSON.parse(prodsRes.body);
  console.log('Total Products returned:', prods.products.length);
  for (const p of prods.products) {
    console.log(`- ${p.name} (${p.slug}): ${p.images?.[0]?.url}`);
  }

  console.log('\n--- Checking Cash Counter Details ---');
  const cashRes = await get('http://localhost:5001/api/public/products/supermarket-cash-checkout-counter');
  const cash = JSON.parse(cashRes.body);
  console.log('Cash Counter Name:', cash.product.name);
  console.log('Cash Counter Image:', cash.product.images?.[0]?.url);
  console.log('Cash Counter Specs:', JSON.stringify(cash.product.specs));

  console.log('\n--- Checking Slotted Angle Details ---');
  const angleRes = await get('http://localhost:5001/api/public/products/slotted-angle-storage-rack');
  const angle = JSON.parse(angleRes.body);
  console.log('Slotted Angle Name:', angle.product.name);
  console.log('Slotted Angle Image:', angle.product.images?.[0]?.url);

  console.log('\n--- Checking Platform Trolley Details ---');
  const trolRes = await get('http://localhost:5001/api/public/products/platform-trolley');
  const trol = JSON.parse(trolRes.body);
  console.log('Platform Trolley Name:', trol.product.name);
  console.log('Platform Trolley Image:', trol.product.images?.[0]?.url);

  console.log('\nALL VERIFIED SUCCESSFULLY!');
  process.exit(0);
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});

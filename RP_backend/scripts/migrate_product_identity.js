import { connectDB } from '../src/config/db.js';
import { CityProduct } from '../src/models/CityProduct.js';
import { Product } from '../src/models/Product.js';
import { City } from '../src/models/City.js';
import { Redirect } from '../src/models/Redirect.js';

async function migrate() {
  await connectDB();
  console.log('[Migration] Starting Product Identity Alignment...');

  const delhi = await City.findOne({ slug: 'delhi' });
  const noida = await City.findOne({ slug: 'noida' });
  const gurugram = await City.findOne({ slug: 'gurugram' });

  const gondola = await Product.findOne({ slug: 'gondola-display-rack' });
  const pallet = await Product.findOne({ slug: 'heavy-duty-warehouse-pallet-rack' });
  const trolley = await Product.findOne({ slug: 'ergonomic-shopping-trolley' });

  // 1. Delhi + Gondola Display Rack
  if (delhi && gondola) {
    const delhiCp = await CityProduct.findOne({
      city: delhi._id,
      $or: [{ product: gondola._id }, { slug: 'delhi/supermarket-racks' }, { slug: 'delhi/gondola-display-rack' }],
    });

    if (delhiCp) {
      const oldSlug = delhiCp.slug;
      delhiCp.product = gondola._id;
      delhiCp.productSlug = gondola.slug; // 'gondola-display-rack'
      delhiCp.productName = gondola.name; // 'Gondola Display Rack'
      delhiCp.slug = `delhi/${gondola.slug}`;
      delhiCp.pageName = `${gondola.name} in Delhi`;
      delhiCp.h1Heading = `${gondola.name} in Delhi`;
      delhiCp.seoTitle = `${gondola.name} in Delhi | Direct Factory Pricing | RP Storage`;
      delhiCp.metaDescription = `Looking for high-quality ${gondola.name} in Delhi? RP Storage Solution manufactures premium double-sided and wall retail display racks with 24-48h dispatch across Delhi NCR.`;
      delhiCp.canonicalUrl = `https://www.rpstoragesolution.com/locations/delhi/${gondola.slug}/`;
      delhiCp.customContent = `At RP Storage Solution, we specialize in manufacturing premium, high-density modular ${gondola.name} units engineered specifically for retail supermarkets, departmental stores, and grocery outlets across Delhi. Featuring certified CRCA steel frames, 7-tank anti-corrosion pre-treatment, and electrostatic powder coating, our modular gondolas maximize aisle merchandising and product visibility.`;
      delhiCp.status = 'published';
      await delhiCp.save();
      console.log(`  ✔ Delhi CityProduct aligned to exact product identity: ${delhiCp.slug}`);

      // Add 301 Redirect for legacy URL
      if (oldSlug !== delhiCp.slug) {
        await Redirect.findOneAndUpdate(
          { sourcePath: `/locations/${oldSlug}` },
          {
            sourcePath: `/locations/${oldSlug}`,
            targetPath: `/locations/${delhiCp.slug}`,
            statusCode: 301,
            isActive: true,
          },
          { upsert: true }
        );
        console.log(`  ✔ Added 301 redirect: /locations/${oldSlug} -> /locations/${delhiCp.slug}`);
      }
    }
  }

  // 2. Noida + Heavy Duty Warehouse Pallet Rack
  if (noida && pallet) {
    const noidaCp = await CityProduct.findOne({
      city: noida._id,
      $or: [{ product: pallet._id }, { slug: 'noida/warehouse-racks' }, { slug: 'noida/heavy-duty-warehouse-pallet-rack' }],
    });

    if (noidaCp) {
      const oldSlug = noidaCp.slug;
      noidaCp.product = pallet._id;
      noidaCp.productSlug = pallet.slug; // 'heavy-duty-warehouse-pallet-rack'
      noidaCp.productName = pallet.name; // 'Heavy Duty Warehouse Pallet Rack'
      noidaCp.slug = `noida/${pallet.slug}`;
      noidaCp.pageName = `${pallet.name} in Noida`;
      noidaCp.h1Heading = `${pallet.name} in Noida`;
      noidaCp.seoTitle = `${pallet.name} in Noida | Heavy Duty Industrial Shelving | RP Storage`;
      noidaCp.metaDescription = `Heavy-duty warehouse pallet racks and selective pallet racking systems in Noida and Greater Noida. Certified IS 2062 steel & on-site assembly.`;
      noidaCp.canonicalUrl = `https://www.rpstoragesolution.com/locations/noida/${pallet.slug}/`;
      noidaCp.customContent = `RP Storage Solution designs, engineers, and erects heavy-duty warehouse pallet racking systems across Noida industrial belts and logistics parks. Engineered with roll-formed high-tensile upright frames and adjustable beams, our selective pallet racks support heavy industrial pallet loads up to 4,000 kg per level.`;
      noidaCp.status = 'published';
      await noidaCp.save();
      console.log(`  ✔ Noida CityProduct aligned to exact product identity: ${noidaCp.slug}`);

      if (oldSlug !== noidaCp.slug) {
        await Redirect.findOneAndUpdate(
          { sourcePath: `/locations/${oldSlug}` },
          {
            sourcePath: `/locations/${oldSlug}`,
            targetPath: `/locations/${noidaCp.slug}`,
            statusCode: 301,
            isActive: true,
          },
          { upsert: true }
        );
        console.log(`  ✔ Added 301 redirect: /locations/${oldSlug} -> /locations/${noidaCp.slug}`);
      }
    }
  }

  // 3. Gurugram + Ergonomic Shopping Trolley
  if (gurugram && trolley) {
    const guruCp = await CityProduct.findOne({
      city: gurugram._id,
      $or: [{ product: trolley._id }, { slug: 'gurugram/display-racks' }, { slug: 'gurugram/ergonomic-shopping-trolley' }],
    });

    if (guruCp) {
      const oldSlug = guruCp.slug;
      guruCp.product = trolley._id;
      guruCp.productSlug = trolley.slug; // 'ergonomic-shopping-trolley'
      guruCp.productName = trolley.name; // 'Ergonomic Shopping Trolley'
      guruCp.slug = `gurugram/${trolley.slug}`;
      guruCp.pageName = `${trolley.name} in Gurugram`;
      guruCp.h1Heading = `${trolley.name} in Gurugram`;
      guruCp.seoTitle = `${trolley.name} in Gurugram | Retail Supermarket Trolleys | RP Storage`;
      guruCp.metaDescription = `Zinc-plated ergonomic supermarket shopping trolleys with smooth PU swivel wheels for retail stores and hypermarkets in Gurugram.`;
      guruCp.canonicalUrl = `https://www.rpstoragesolution.com/locations/gurugram/${trolley.slug}/`;
      guruCp.customContent = `Supplying Gurugram supermarkets, departmental stores, and hypermarkets with heavy-payload ergonomic shopping trolleys. Built with zinc-electroplated bright finish, clear rust-resistant lacquer, and precision swivel wheels for effortless customer mobility.`;
      guruCp.status = 'published';
      await guruCp.save();
      console.log(`  ✔ Gurugram CityProduct aligned to exact product identity: ${guruCp.slug}`);

      if (oldSlug !== guruCp.slug) {
        await Redirect.findOneAndUpdate(
          { sourcePath: `/locations/${oldSlug}` },
          {
            sourcePath: `/locations/${oldSlug}`,
            targetPath: `/locations/${guruCp.slug}`,
            statusCode: 301,
            isActive: true,
          },
          { upsert: true }
        );
        console.log(`  ✔ Added 301 redirect: /locations/${oldSlug} -> /locations/${guruCp.slug}`);
      }
    }
  }

  // Remove any stale test drafts
  await CityProduct.deleteMany({ status: 'draft', slug: /^test-nav-/ });
  console.log('[Migration] Finished Product Identity Alignment successfully.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[Migration Error]:', err);
  process.exit(1);
});

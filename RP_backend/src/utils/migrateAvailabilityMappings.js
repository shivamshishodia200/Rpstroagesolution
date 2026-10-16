import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CityProduct } from '../models/CityProduct.js';
import { Product } from '../models/Product.js';
import { City } from '../models/City.js';
import { ProductCityMapping } from '../models/ProductCityMapping.js';

dotenv.config();

/**
 * Idempotent Migration: CityProduct -> ProductCityMapping
 * Flags ambiguous records, previews without mutation unless --execute is passed.
 */
export const runMigration = async ({ isDryRun = true } = {}) => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rp_storage_solution';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  console.log(`\n======================================================`);
  console.log(`   PRODUCT-CITY AVAILABILITY MIGRATION ${isDryRun ? '[PREVIEW / DRY-RUN]' : '[EXECUTING]'}`);
  console.log(`======================================================\n`);

  const existingCityProducts = await CityProduct.find({}).lean();
  console.log(`Found ${existingCityProducts.length} CityProduct records to inspect.`);

  const preview = {
    validToMigrate: [],
    alreadyMapped: [],
    ambiguousRecords: [],
    errors: [],
  };

  for (const cp of existingCityProducts) {
    // 1. Validate Product exists
    const product = await Product.findById(cp.product).lean();
    if (!product) {
      preview.ambiguousRecords.push({
        id: cp._id,
        slug: cp.slug,
        reason: `Product ID '${cp.product}' (${cp.productName}) not found in Product collection`,
      });
      continue;
    }

    // 2. Validate City exists
    const city = await City.findById(cp.city).lean();
    if (!city) {
      preview.ambiguousRecords.push({
        id: cp._id,
        slug: cp.slug,
        reason: `City ID '${cp.city}' (${cp.cityName}) not found in City collection`,
      });
      continue;
    }

    // 3. Check if mapping already exists
    const existingMapping = await ProductCityMapping.findOne({
      product: product._id,
      city: city._id,
    });

    if (existingMapping) {
      preview.alreadyMapped.push({
        mappingId: existingMapping._id,
        product: product.name,
        city: city.name,
        isAvailable: existingMapping.isAvailable,
      });
    } else {
      preview.validToMigrate.push({
        product: product._id,
        productName: product.name,
        city: city._id,
        cityName: city.name,
        isAvailable: cp.status === 'published',
        availabilityNotes: `Migrated from published CityProduct SEO page (${cp.slug})`,
      });
    }
  }

  console.log(`\n[Migration Summary]`);
  console.log(`- Ready to Migrate: ${preview.validToMigrate.length}`);
  console.log(`- Already Mapped:   ${preview.alreadyMapped.length}`);
  console.log(`- Ambiguous / Skipped: ${preview.ambiguousRecords.length}`);

  if (preview.ambiguousRecords.length > 0) {
    console.warn('\n[Ambiguous Records]:', preview.ambiguousRecords);
  }

  if (!isDryRun) {
    let createdCount = 0;
    for (const item of preview.validToMigrate) {
      await ProductCityMapping.create({
        product: item.product,
        city: item.city,
        isAvailable: item.isAvailable,
        availabilityNotes: item.availabilityNotes,
      });
      createdCount++;
    }
    console.log(`\n✔ Successfully created ${createdCount} ProductCityMapping records in database.`);
  } else {
    console.log(`\nℹ DRY-RUN complete. No database mutations were made.`);
    console.log(`Pass --execute to apply this migration safely.`);
  }

  return preview;
};

// Direct script execution support
if (process.argv[1]?.endsWith('migrateAvailabilityMappings.js')) {
  const isExecute = process.argv.includes('--execute');
  runMigration({ isDryRun: !isExecute })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

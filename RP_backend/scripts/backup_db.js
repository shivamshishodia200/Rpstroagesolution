import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../src/config/db.js';
import { CityProduct } from '../src/models/CityProduct.js';
import { ProductCityMapping } from '../src/models/ProductCityMapping.js';
import { Product } from '../src/models/Product.js';
import { City } from '../src/models/City.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBackup() {
  await connectDB();
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const cp = await CityProduct.find({}).lean();
  const mappings = await ProductCityMapping.find({}).lean();
  const products = await Product.find({}).lean();
  const cities = await City.find({}).lean();

  const timestamp = Date.now();
  fs.writeFileSync(path.join(backupDir, `cityproducts_backup_${timestamp}.json`), JSON.stringify(cp, null, 2));
  fs.writeFileSync(path.join(backupDir, `mappings_backup_${timestamp}.json`), JSON.stringify(mappings, null, 2));
  fs.writeFileSync(path.join(backupDir, `products_backup_${timestamp}.json`), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(backupDir, `cities_backup_${timestamp}.json`), JSON.stringify(cities, null, 2));

  console.log(`[Backup] Successfully backed up ${cp.length} CityProducts, ${mappings.length} mappings, ${products.length} products, and ${cities.length} cities to ${backupDir}`);
  process.exit(0);
}

runBackup().catch((err) => {
  console.error('[Backup Error]:', err);
  process.exit(1);
});

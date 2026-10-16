import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function cleanup() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rp_storage_solution';
  await mongoose.connect(mongoUri);
  const pRes = await mongoose.connection.collection('products').deleteMany({
    slug: { $regex: '^(test-nav-prod|heavy-duty-cantilever-179)' }
  });
  console.log('Deleted lingering test products:', pRes.deletedCount);

  const cRes = await mongoose.connection.collection('cities').deleteMany({
    slug: { $regex: '^(test-nav-city|bhiwadi-hub-179)' }
  });
  console.log('Deleted lingering test cities:', cRes.deletedCount);
  process.exit(0);
}

cleanup().catch(err => {
  console.error(err);
  process.exit(1);
});

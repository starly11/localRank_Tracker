import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../configs/db.js';
import User from '../models/User.js';
import { ensureDemoDataForUser } from '../services/demoSeedService.js';

const run = async () => {
  try {
    await connectDB();
    const force = String(process.env.SEED_DEMO_FORCE || 'false').toLowerCase() === 'true';

    const users = await User.find({}).select('_id email').lean();
    let seededCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      try {
        const result = await ensureDemoDataForUser({ userId: user._id, force });
        if (result.seeded) {
          seededCount += 1;
          console.log(`[seed-demo] seeded: ${user.email || user._id}`);
        } else {
          skippedCount += 1;
          console.log(`[seed-demo] skipped: ${user.email || user._id} (${result.reason})`);
        }
      } catch (error) {
        console.error(`[seed-demo] failed for ${user.email || user._id}:`, error.message);
      }
    }

    console.log(
      `[seed-demo] completed. users=${users.length}, seeded=${seededCount}, skipped=${skippedCount}, force=${force}`
    );
    process.exit(0);
  } catch (error) {
    console.error('[seed-demo] fatal error:', error.message);
    process.exit(1);
  }
};

run();

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

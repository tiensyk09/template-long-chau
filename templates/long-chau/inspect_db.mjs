import { initDatabase, seedData } from './lib/initDb.js';

async function run() {
  console.log('Starting DB init and seed...');
  await initDatabase();
  console.log('Database schema created/verified.');
  await seedData(null, true);
  console.log('Database seeded successfully.');
}

run().catch(err => {
  console.error('ERROR OCCURRED:');
  console.error(err);
});

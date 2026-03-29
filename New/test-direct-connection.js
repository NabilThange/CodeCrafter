// Quick test to see what's wrong with the connection
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing DATABASE_URL...');
  console.log('URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ DATABASE_URL works!');
    console.log('Server time:', result.rows[0].now);
  } catch (error) {
    console.log('❌ DATABASE_URL failed:', error.message);
  } finally {
    await pool.end();
  }

  console.log('\nTesting DIRECT_URL...');
  console.log('URL:', process.env.DIRECT_URL?.replace(/:[^:@]+@/, ':****@'));
  
  const directPool = new Pool({
    connectionString: process.env.DIRECT_URL,
  });

  try {
    const result = await directPool.query('SELECT NOW()');
    console.log('✅ DIRECT_URL works!');
    console.log('Server time:', result.rows[0].now);
  } catch (error) {
    console.log('❌ DIRECT_URL failed:', error.message);
  } finally {
    await directPool.end();
  }
}

testConnection().catch(console.error);

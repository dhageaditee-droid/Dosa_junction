const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  console.log('🚀 Starting Dakshin Bhavan Database Initialization...');

  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:aditee@localhost:5432/dosabhavan';
  
  // Extract database name and base URL
  const urlParts = new URL(dbUrl);
  const dbName = urlParts.pathname.replace('/', '') || 'dosabhavan';
  
  // Connect to default 'postgres' database first to ensure target DB exists
  urlParts.pathname = '/postgres';
  const rootClient = new Client({ connectionString: urlParts.toString() });

  try {
    await rootClient.connect();
    const dbCheck = await rootClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (dbCheck.rowCount === 0) {
      console.log(`📡 Database "${dbName}" does not exist. Creating...`);
      await rootClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully.`);
    }
    await rootClient.end();

    // Connect to the target database
    const targetClient = new Client({ connectionString: dbUrl });
    await targetClient.connect();
    console.log(`✅ Connected to database "${dbName}".`);

    // 1. Run Schema Migration
    const schemaPath = path.join(__dirname, '../migrations/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await targetClient.query(schemaSql);
    console.log('✅ Database schema tables created successfully.');

    // 2. Run Seed Script
    const seedPath = path.join(__dirname, '../seeds/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await targetClient.query(seedSql);
    console.log('✅ Database seeded with South Indian menu items, categories, and settings.');

    // 3. Ensure Default Admin with valid Bcrypt Hash
    const adminEmail = 'admin@dosajunction.com';
    const rawPassword = 'Admin@123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    await targetClient.query(
      `INSERT INTO admins (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) 
       DO UPDATE SET password_hash = $3`,
      ['Dakshin Bhavan Admin', adminEmail, hashedPassword, 'admin']
    );

    console.log(`\n🎉 Setup completed successfully!`);
    console.log(`-----------------------------------`);
    console.log(`Admin Login Credentials:`);
    console.log(`Email    : ${adminEmail}`);
    console.log(`Password : ${rawPassword}`);
    console.log(`-----------------------------------\n`);

    await targetClient.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database Setup Failed:', err.message);
    process.exit(1);
  }
}

setupDatabase();

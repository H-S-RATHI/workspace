require('dotenv').config();
const { testDatabaseConnection } = require('./src/config/database');

async function testConnection() {
  console.log('Testing database connection...');
  const isConnected = await testDatabaseConnection();
  
  if (isConnected) {
    console.log('✅ Database is connected and working!');
  } else {
    console.log('❌ Failed to connect to the database');
    console.log('Please check your .env file and make sure:');
    console.log('1. Database server is running');
    console.log('2. Database credentials in .env are correct');
    console.log('3. Database host is accessible from your network');
  }
  
  // Close any database connections
  process.exit(0);
}

testConnection().catch(console.error);

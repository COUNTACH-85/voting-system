const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB Atlas connection...');
console.log('Connection URI:', MONGODB_URI.replace(/:[^:@]*@/, ':***@')); // Hide password

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('IP')) {
      console.error('\n📝 Solution: Add your IP address to MongoDB Atlas whitelist:');
      console.error('   1. Go to https://cloud.mongodb.com/');
      console.error('   2. Navigate to Network Access');
      console.error('   3. Click "Add IP Address"');
      console.error('   4. Add your IP: 210.212.2.133');
      console.error('   5. Or add 0.0.0.0/0 for development (allows all IPs)');
    }
    
    process.exit(1);
  }
}

testConnection();

const mongoose = require('mongoose');

async function checkMongoDBConnection() {
  console.log('🔍 Checking MongoDB connection...');
  
  try {
    // Try to connect to local MongoDB
    await mongoose.connect('mongodb://localhost:27017/voting-system', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Successfully connected to local MongoDB!');
    console.log('📝 You can now create the .env.local file with:');
    console.log('   MONGODB_URI=mongodb://localhost:27017/voting-system');
    console.log('   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.log('❌ Could not connect to local MongoDB');
    console.log('📋 Setup Instructions:');
    console.log('');
    console.log('Option 1: Install MongoDB Community Server');
    console.log('1. Download from: https://www.mongodb.com/try/download/community');
    console.log('2. Install and start the MongoDB service');
    console.log('3. Run this script again');
    console.log('');
    console.log('Option 2: Use Docker');
    console.log('1. Install Docker');
    console.log('2. Run: docker run -d -p 27017:27017 --name mongodb mongo:latest');
    console.log('3. Run this script again');
    console.log('');
    console.log('Option 3: Use MongoDB Atlas (Cloud)');
    console.log('1. Go to: https://www.mongodb.com/atlas');
    console.log('2. Create a free cluster');
    console.log('3. Get your connection string');
    console.log('4. Create .env.local with your Atlas URI');
    console.log('');
    console.log('Error details:', error.message);
  }
}

checkMongoDBConnection(); 
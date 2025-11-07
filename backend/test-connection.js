import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log(`📍 URI: ${process.env.MONGODB_URI?.substring(0, 30)}...`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connection successful!');
    console.log(`📦 Database: ${conn.connection.db.databaseName}`);
    console.log(`🖥️  Host: ${conn.connection.host}`);
    
    // List existing collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`\n📂 Collections found: ${collections.length}`);
    if (collections.length > 0) {
      collections.forEach(col => console.log(`   - ${col.name}`));
    } else {
      console.log('   (No collections yet - this is a fresh database)');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Test complete. Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error(`Error: ${error.message}`);
    if (error.message.includes('IP')) {
      console.error('\n🔧 Fix: Add your IP to MongoDB Atlas whitelist');
    }
    process.exit(1);
  }
};

testConnection();

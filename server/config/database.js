const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Check if MongoDB URI is configured
        if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('username:password')) {
            console.log('⚠️  MongoDB not configured - using in-memory storage only');
            console.log('📝 To enable persistence, set up MongoDB Atlas:');
            console.log('   1. Go to https://www.mongodb.com/cloud/atlas');
            console.log('   2. Create a free account and cluster');
            console.log('   3. Add connection string to .env file');
            return null;
        }

        // Removed deprecated options - they're now defaults in Mongoose 6+
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('⚠️  Continuing with in-memory storage only');
        return null;
    }
};

module.exports = connectDB;

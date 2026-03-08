const mongoose = require('mongoose');

// Your MongoDB connection string
// Note: @ symbol in password needs to be URL encoded as %40
const MONGODB_URI = 'mongodb+srv://maharajjneww:Extension%401@cluster0.h2duoyr.mongodb.net/quiz-extension?retryWrites=true&w=majority';

console.log('🔄 Testing MongoDB connection...\n');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS! MongoDB connection is working!');
    console.log('📊 Connection details:');
    console.log('   - Host:', mongoose.connection.host);
    console.log('   - Database:', mongoose.connection.name);
    console.log('   - Ready State:', mongoose.connection.readyState);
    
    // Close the connection
    mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ ERROR! MongoDB connection failed!');
    console.error('Error details:', err.message);
    console.error('\nPossible issues:');
    console.error('1. Check if password is correct: Extension@1');
    console.error('2. Check if IP address is whitelisted in MongoDB Atlas');
    console.error('3. Check if username is correct: maharajjneww');
    console.error('4. Check network connection');
    process.exit(1);
  });

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Connection timeout! Taking too long to connect.');
  process.exit(1);
}, 10000);

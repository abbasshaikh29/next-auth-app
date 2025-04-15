// Simple script to check which database we're connected to
require('dotenv').config();

console.log('Checking database connection...');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('Database name:', process.env.MONGODB_URI?.split('/').pop());
console.log('NODE_ENV:', process.env.NODE_ENV);

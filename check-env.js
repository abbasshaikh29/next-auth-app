// Simple script to check if environment variables are loaded
console.log('Checking environment variables...');
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('NEXTAUTH_URL exists:', !!process.env.NEXTAUTH_URL);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);

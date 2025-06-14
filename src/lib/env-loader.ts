import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV
const loadEnv = () => {
  const envPath = process.env.NODE_ENV === 'production' 
    ? path.join(process.cwd(), '.env.production')
    : path.join(process.cwd(), '.env.development');

  dotenv.config({ path: envPath });
};

export default loadEnv;
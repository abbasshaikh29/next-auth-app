import type { NextAuthConfig } from 'next-auth';
import { authOptions as baseAuthOptions } from './authoptions';

// Export the auth options for use in API routes
export const authOptions: NextAuthConfig = baseAuthOptions as NextAuthConfig;

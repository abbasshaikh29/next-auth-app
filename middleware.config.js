/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    middleware: {
      // Set the runtime for middleware to nodejs
      runtime: 'nodejs',
    },
  },
};

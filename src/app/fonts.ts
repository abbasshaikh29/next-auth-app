import { Poppins } from 'next/font/google';
import localFont from 'next/font/local';

export const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const thunder = localFont({
  src: [
    {
      path: '../../public/fonts/Thunder-BoldLCItalic.woff2', // Corrected filename
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-thunder',
  display: 'swap',
});

import withPWAInit from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow mobile devices on the local network to access dev server
  allowedDevOrigins: [
    '192.168.43.37',
    '192.168.0.*',
    '192.168.1.*',
    '10.0.0.*',
  ],
};

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
});

export default withPWA(nextConfig);

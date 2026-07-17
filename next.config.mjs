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

export default nextConfig;

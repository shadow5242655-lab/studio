import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'c.saavncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'aac.saavncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'audius.zeogrid.com',
      },
      {
        protocol: 'https',
        hostname: '**.audius.co',
      },
      {
        protocol: 'https',
        hostname: '**.audius.org',
      },
      {
        protocol: 'https',
        hostname: 'validator.stuffisup.com',
      },
      {
        protocol: 'https',
        hostname: '**.stuffisup.com',
      },
      {
        protocol: 'https',
        hostname: 'v.monophonic.digital',
      },
      {
        protocol: 'https',
        hostname: '**.monophonic.digital',
      },
    ],
  },
};

export default nextConfig;

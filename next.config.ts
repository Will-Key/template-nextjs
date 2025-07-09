import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  
  // Autres configurations selon vos besoins
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  // eslint: {
  //   ignoreDuringBuilds: true
  // },
  
  // Si vous utilisez des images
  images: {
    //domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dfsuc89b6/image/upload/**', // adapte à ton cloud_name
      },
    ],
  
    // Ajoutez d'autres domaines si nécessaire
  },
};

export default nextConfig;

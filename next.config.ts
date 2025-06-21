/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rue7vxma3l1fw7f7.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;

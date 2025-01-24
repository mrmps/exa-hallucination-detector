/** @type {import('next').NextConfig} */

const nextConfig = {
    basePath: "",
    experimental: {
      serverActions: {
        allowedOrigins: ["factfilter.co"],
        allowedForwardedHosts: ["factfilter.co"],
      },
    },
  };
  
export default nextConfig;
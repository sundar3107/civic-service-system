/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false
  },
  transpilePackages: ["@civic/types", "@civic/ui"]
};

export default nextConfig;


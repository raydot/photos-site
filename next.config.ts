const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/photos/**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  reactStrictMode: true,
  logging: {
    level: "verbose",
    fullUrl: true,
  },
  // Disable fast refresh during development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules/**", "**/.next/**"],
      }
    }
    return config
  },
}

export default nextConfig

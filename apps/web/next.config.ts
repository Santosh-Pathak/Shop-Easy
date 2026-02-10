import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
   /* config options here */
   turbopack: {
      // Monorepo root (parent of apps/web) so correct lockfile is used
      root: '..',
   },
   typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: true,
   },
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'stprojectnameprod.blob.core.windows.net',
            port: '',
            pathname: '/**',
         },
      ],
   },
   async headers() {
      return [
         {
            source: '/(.*)',
            headers: [
               {
                  key: 'Access-Control-Allow-Origin',
                  value: '*',
               },
               {
                  key: 'Access-Control-Allow-Methods',
                  value: 'GET, POST, PUT, DELETE, OPTIONS',
               },
               {
                  key: 'Access-Control-Allow-Headers',
                  value: 'Content-Type, Authorization',
               },
            ],
         },
      ]
   },
}

export default nextConfig

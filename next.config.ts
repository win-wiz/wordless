/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from 'next'

const initConfig = async (): Promise<NextConfig> => {
  await import("./src/env.js")
  
  return {
    reactStrictMode: false,
    async headers() {
      return [
        {
          source: '/ads.txt',
          headers: [
            {
              key: 'Content-Type',
              value: 'text/plain',
            },
          ],
        },
      ]
    },
  }
}

export default initConfig() 
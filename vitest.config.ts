import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

// `css: true` matters here: the report export inlines its stylesheet as a raw import,
// and without it the test would assert against an empty string.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      css: true,
      environment: 'node',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }),
)

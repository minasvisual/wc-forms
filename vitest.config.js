import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environmentMatchGlobs: [
      ['**/form-input-types.test.js', 'jsdom'],
    ],
  },
})

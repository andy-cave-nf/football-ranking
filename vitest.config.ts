import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // enables describe/it/expect without imports
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});

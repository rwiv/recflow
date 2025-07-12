import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    // testTimeout: 5 * 60 * 1000,
    testTimeout: 60 * 1000,
    // testTimeout: 5 * 1000,
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});

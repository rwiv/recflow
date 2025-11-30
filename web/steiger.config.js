import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ['./src/**'],
    rules: {
      'fsd/public-api': 'off',
      'fsd/no-public-api-sidestep': 'off',

      'fsd/no-segmentless-slices': 'error',
      'fsd/insignificant-slice': 'warn',

      'fsd/forbidden-imports': 'off',
      'fsd/no-cross-imports': 'error',
      'fsd/no-higher-level-imports': 'error',
    },
  },
  {
    files: ['./src/entities/**'],
    rules: {
      'fsd/forbidden-imports': 'off',
      'fsd/no-cross-imports': 'off',
      'fsd/no-higher-level-imports': 'error',
    },
  },
]);

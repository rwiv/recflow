import { describe, expect, it } from 'vitest';

import { ErrorTypeToHttpStatus } from '@/utils/errors/types/records.js';

describe('errors.types.records', () => {
  it('ErrorTypeToHttpStatus', () => {
    expect(ErrorTypeToHttpStatus['Not Found']).eq(404);
  });
});

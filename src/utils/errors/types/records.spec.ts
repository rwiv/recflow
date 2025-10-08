import { describe, it, expect } from 'vitest';
import { ErrorTypeToHttpStatus } from './records.js';

describe('errors.types.records', () => {
  it('ErrorTypeToHttpStatus', () => {
    expect(ErrorTypeToHttpStatus['Not Found']).eq(404);
  });
});

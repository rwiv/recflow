import { it, expect } from 'vitest';
import { ErrorTypeToHttpStatus } from './records.js';

it('test', () => {
  expect(ErrorTypeToHttpStatus['Not Found']).eq(404);
});

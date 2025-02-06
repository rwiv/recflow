import { it, expect } from 'vitest';
import { ErrorCodeToHttpStatus } from './records.js';

it('test', () => {
  expect(ErrorCodeToHttpStatus['Not Found']).eq(404);
});

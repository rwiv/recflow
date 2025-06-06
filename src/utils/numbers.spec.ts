import { describe, it, expect } from 'vitest';
import { findMissingNums } from './numbers.js';

describe('checkMissingNums', () => {
  it('should return an empty array for input with less than 2 elements', () => {
    expect(findMissingNums([])).toEqual([]);
    expect(findMissingNums([5])).toEqual([]);
  });

  it('should return missing numbers in a normal range', () => {
    expect(findMissingNums([1, 2, 4, 6])).toEqual([3, 5]);
    expect(findMissingNums([10, 12, 15])).toEqual([11, 13, 14]);
  });

  it('should ignore non-positive starting numbers', () => {
    expect(findMissingNums([0, 2, 3, 5])).toEqual([4]);
    expect(findMissingNums([-5, 1, 2, 4])).toEqual([3]);
  });

  it('should return an empty array if no numbers are missing', () => {
    expect(findMissingNums([1, 2, 3, 4, 5])).toEqual([]);
    expect(findMissingNums([2, 3, 4])).toEqual([]);
  });

  it('should work with unordered input', () => {
    expect(findMissingNums([4, 2, 1, 5])).toEqual([3]);
  });

  it('should work when all numbers between start and end are missing', () => {
    expect(findMissingNums([1, 10])).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

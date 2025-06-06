export function findMissingNums(source: number[]): number[] {
  if (source.length < 2) {
    return [];
  }

  const nums = [...source];
  nums.sort((a, b) => a - b);

  let startNum = nums[0];
  if (startNum <= 0) {
    startNum = nums[1];
  }
  const endNum = nums[nums.length - 1];

  const numSet = new Set(nums);
  const missingNums: number[] = [];
  for (let curNum = startNum; curNum <= endNum; curNum++) {
    if (!numSet.has(curNum)) {
      missingNums.push(curNum);
    }
  }
  return missingNums;
}

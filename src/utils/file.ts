import fs from 'fs/promises';

export async function exists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch (e) {
    return false;
  }
}

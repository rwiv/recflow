import { z } from 'zod';

export const exitCmd = z.enum(['delete', 'cancel', 'finish']);
export type ExitCmd = z.infer<typeof exitCmd>;

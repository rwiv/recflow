import {z} from "zod";

export const exitCmdEnum = z.enum(['delete', 'cancel', 'finish']);
export type ExitCmd = z.infer<typeof exitCmdEnum>;

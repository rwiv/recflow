import { z } from 'zod';

export const uuid = z.string().length(32);
export const nonempty = z.string().nonempty();

export const pageQuery = z.object({
  page: z.number().int().positive(),
  size: z.number().int().nonnegative(),
});
export type PageQuery = z.infer<typeof pageQuery>;

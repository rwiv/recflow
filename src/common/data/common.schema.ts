import { z } from 'zod';

export const uuid = z.string().uuid();
export const nonempty = z.string().nonempty();
export const nnint = z.coerce.number().int().nonnegative();

export const pageQuery = z.object({
  page: z.number().int().positive(),
  size: z.number().int().nonnegative(),
});
export type PageQuery = z.infer<typeof pageQuery>;

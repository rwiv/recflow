import { z } from 'zod';

export const uuid = z.string().uuid();
export const nonempty = z.string().nonempty();
export const nnint = z.coerce.number().int().nonnegative();

export const pageQuery = z.object({
  page: z.number().int().positive(),
  size: z.number().int().nonnegative(),
});
export type PageQuery = z.infer<typeof pageQuery>;

export const errorResponse = z.object({
  statusCode: z.number(),
  message: z.string(),
  timestamp: z.string(),
  code: z.string().optional(),
});
export type ErrorResponse = z.infer<typeof errorResponse>;

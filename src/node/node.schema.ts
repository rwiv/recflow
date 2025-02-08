import { z } from 'zod';

export const nodeTypeEnum = z.enum(['worker', 'argo']);

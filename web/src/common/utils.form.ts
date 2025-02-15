import { ZodError, ZodObject, ZodRawShape } from 'zod';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

export function parse<A extends FieldValues, B extends ZodRawShape>(
  schema: ZodObject<B>,
  data: A,
  form: UseFormReturn<A>,
) {
  try {
    return schema.parse(data);
  } catch (e) {
    if (e instanceof ZodError) {
      console.error(e);
      for (const err of e.errors) {
        for (const path of err.path) {
          form.setError(path.toString() as Path<A>, { message: err.message });
        }
      }
    }
  }
}

import { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { css } from '@emotion/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@shared/ui/cn/form.tsx';
import { DialogButton } from '@shared/ui/dialog';
import { nonempty, parse } from '@shared/lib/schema';
import { CheckFormField, FormSubmitButton, TextFormField } from '@shared/ui/form';
import { gradeAppend, createGrade, GRADES_QUERY_KEY } from '@entities/channel/grade';

export function GradeCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogButton
      contentCn="sm:max-w-lg overflow-auto"
      contentStyle={css({ maxHeight: '50rem' })}
      label="Append"
      title="Add New Grade"
      closeRef={closeBtnRef}
    >
      <CreateForm cb={() => closeBtnRef.current?.click()} />
    </DialogButton>
  );
}

const formSchema = gradeAppend.extend({
  description: z.string(),
  tier: nonempty,
  seq: nonempty,
});

const middleSchema = formSchema.extend({
  description: z.string().nullable(),
  tier: z.coerce.number().positive(),
  seq: z.coerce.number().positive(),
});

export function CreateForm({ cb }: { cb: () => void }) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      shouldSave: false,
      shouldNotify: false,
      tier: '',
      seq: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const middleData = parse(middleSchema, data, form);
    if (!middleData) return;
    if (middleData.description === '') {
      middleData.description = null;
    }
    await createGrade(gradeAppend.parse(middleData));
    await queryClient.invalidateQueries({ queryKey: [GRADES_QUERY_KEY] });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextFormField form={form} name="name" />
        <TextFormField form={form} name="description" />
        <CheckFormField form={form} name="shouldSave" label="Save" />
        <CheckFormField form={form} name="shouldNotify" label="Notify" />
        <TextFormField form={form} name="tier" />
        <TextFormField form={form} name="seq" />
        <FormSubmitButton />
      </form>
    </Form>
  );
}

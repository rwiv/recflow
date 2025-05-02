import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { PRIORITIES_QUERY_KEY } from '@/common/constants.ts';
import { DialogButton } from '@/components/common/layout/DialogButton.tsx';
import { TextFormField } from '@/components/common/form/TextFormField.tsx';
import { css } from '@emotion/react';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';
import { parse } from '@/common/utils.form.ts';
import { nonempty } from '@/common/common.schema.ts';
import { priorityAppend } from '@/client/channel/priority.schema.ts';
import { createPriority } from '@/client/channel/priority.client.ts';
import { CheckFormField } from '@/components/common/form/CheckFormField.tsx';

export function PriorityCreateButton() {
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

const formSchema = priorityAppend.extend({
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
    await createPriority(priorityAppend.parse(middleData));
    await queryClient.invalidateQueries({ queryKey: [PRIORITIES_QUERY_KEY] });
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

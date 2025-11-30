import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { css } from '@emotion/react';
import { Form } from '@/shared/ui/cn/form.tsx';
import { parse } from '@/shared/lib/schema/form_utils.ts';
import { DialogButton } from '@/shared/ui/dialog/DialogButton.tsx';
import { tagAppend } from '@/entities/channel/tag/api/tag.schema.ts';
import { createTag } from '@/entities/channel/tag/api/tag.client.ts';
import { TextFormField } from '@/shared/ui/form/TextFormField.tsx';
import { FormSubmitButton } from '@/shared/ui/form/FormSubmitButton.tsx';
import { TAGS_QUERY_KEY } from '@/entities/channel/tag/config/constants.ts';

export function TagCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogButton
      contentCn="sm:max-w-lg overflow-auto"
      contentStyle={css({ maxHeight: '50rem' })}
      label="Append"
      title="Add New Node"
      closeRef={closeBtnRef}
    >
      <CreateForm cb={() => closeBtnRef.current?.click()} />
    </DialogButton>
  );
}

const formSchema = tagAppend.extend({
  description: z.string(),
});
const middleSchema = formSchema.extend({
  description: z.string().nullable(),
});

export function CreateForm({ cb }: { cb: () => void }) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const middleData = parse(middleSchema, data, form);
    if (!middleData) return;
    if (middleData.description === '') {
      middleData.description = null;
    }
    await createTag(tagAppend.parse(middleData));
    await queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextFormField form={form} name="name" />
        <TextFormField form={form} name="description" />
        <FormSubmitButton />
      </form>
    </Form>
  );
}

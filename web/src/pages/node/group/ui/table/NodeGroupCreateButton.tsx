import { css } from '@emotion/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { parse } from '@/shared/lib/schema/form_utils.ts';
import { Form } from '@/shared/ui/cn/form.tsx';
import { DialogButton } from '@/shared/ui/dialog/DialogButton.tsx';
import { FormSubmitButton } from '@/shared/ui/form/FormSubmitButton.tsx';
import { TextFormField } from '@/shared/ui/form/TextFormField.tsx';

import { nodeGroupAppend } from '@/entities/node/group/model/node-group.schema.ts';

import { createNodeGroup } from '@/features/node/group/api/node-group.client.ts';
import { NODE_GROUPS_QUERY_KEY } from '@/features/node/group/config/constants.ts';

export function NodeGroupCreateButton() {
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

const formSchema = nodeGroupAppend.extend({
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
    await createNodeGroup(nodeGroupAppend.parse(middleData));
    await queryClient.invalidateQueries({ queryKey: [NODE_GROUPS_QUERY_KEY] });
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

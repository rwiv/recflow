import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { NODE_GROUPS_QUERY_KEY } from '@/common/constants.ts';
import { nodeGroupAppend } from '@/client/node/node.schema.ts';
import { DialogButton } from '@/components/common/layout/DialogButton.tsx';
import { TextFormField } from '@/components/common/form/TextFormField.tsx';
import { css } from '@emotion/react';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';
import { parse } from '@/common/utils.form.ts';
import { createNodeGroup } from '@/client/node/node-group.client.ts';

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

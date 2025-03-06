import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { createLive } from '@/client/live/live.client.ts';
import { useRef } from 'react';
import { SelectItem } from '@/components/ui/select.tsx';
import { LIVES_QUERY_KEY } from '@/common/constants.ts';
import { platformNameEnum } from '@/client/common/platform.schema.ts';
import { SelectFormField } from '@/components/common/form/SelectFormField.tsx';
import { TextFormField } from '@/components/common/form/TextFormField.tsx';
import { DialogButton } from '@/components/common/layout/DialogButton.tsx';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';

const formSchema = z.object({
  type: platformNameEnum,
  uid: z.string().nonempty(),
});

export function LiveCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogButton label="Append" title="Add New Live" closeRef={closeBtnRef}>
      <CreateForm cb={() => closeBtnRef.current?.click()} />
    </DialogButton>
  );
}

export function CreateForm({ cb }: { cb: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'chzzk',
      uid: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createLive(data.uid, data.type);
    await queryClient.invalidateQueries({ queryKey: [LIVES_QUERY_KEY] });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SelectFormField form={form} name="type" label="Platform">
          <SelectItem value="chzzk">CHZZK</SelectItem>
          <SelectItem value="soop">SOOP</SelectItem>
        </SelectFormField>
        <TextFormField form={form} name="uid" label="Channel UID" />
        <FormSubmitButton />
      </form>
    </Form>
  );
}

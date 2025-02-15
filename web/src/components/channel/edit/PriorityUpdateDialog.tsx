import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, useRef } from 'react';
import { SelectItem } from '@/components/ui/select.tsx';
import { css } from '@emotion/react';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { updateChannelPriority } from '@/client/channel.client.ts';
import { ChannelDto } from '@/client/channel.types.ts';
import { SelectFormField } from '@/components/common/form/SelectFormField.tsx';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';
import { DialogBase } from '@/components/common/layout/DialogBase.tsx';

const FormSchema = z.object({
  priority: z.string().nonempty(),
});

export function PriorityUpdateDialog({ channel, children }: { channel: ChannelDto; children: ReactNode }) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  return (
    <DialogBase title="Update Channel Priority" closeRef={closeBtnRef} triggerNode={children}>
      <CreateForm channel={channel} cb={() => closeBtnRef?.current?.click()} />
    </DialogBase>
  );
}

function CreateForm({ channel, cb }: { channel: ChannelDto; cb: () => void }) {
  const queryClient = useQueryClient();
  const { pageState } = useChannelPageStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      priority: channel.priority.name,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await updateChannelPriority(channel.id, data.priority);
    if (!pageState) return;
    await queryClient.invalidateQueries({ queryKey: pageState.queryKeys() });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SelectFormField
          form={form}
          name="priority"
          style={css({ marginTop: '0.4rem', marginBottom: '2rem' })}
        >
          <SelectItem value="must">MUST</SelectItem>
          <SelectItem value="should">SHOULD</SelectItem>
          <SelectItem value="may">MAY</SelectItem>
          <SelectItem value="review">REVIEW</SelectItem>
          <SelectItem value="skip">SKIP</SelectItem>
          <SelectItem value="none">NONE</SelectItem>
        </SelectFormField>
        <FormSubmitButton />
      </form>
    </Form>
  );
}

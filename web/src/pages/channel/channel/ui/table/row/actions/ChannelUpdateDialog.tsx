import { RefObject, useRef } from 'react';
import { z } from 'zod';
import { css } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/shared/ui/cn/form.tsx';
import { useChannelPageStore } from '@/entities/channel/channel/model/useChannelPageStore.ts';
import { updateChannelDescription } from '@/entities/channel/channel/api/channel.client.ts';
import { ChannelDto } from '@/entities/channel/channel/api/channel.types.ts';
import { DialogWithTrigger } from '@/shared/ui/dialog/DialogWithTrigger.tsx';
import { TextAreaFormField } from '@/shared/ui/form/TextAreaFormField.tsx';
import { FormSubmitButton } from '@/shared/ui/form/FormSubmitButton.tsx';

interface ChannelUpdateDialogProps {
  channel: ChannelDto;
  triggerRef: RefObject<HTMLButtonElement>;
}

export function ChannelUpdateDialog({ channel, triggerRef }: ChannelUpdateDialogProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  return (
    <DialogWithTrigger closeRef={closeBtnRef} triggerRef={triggerRef} title="Update Channel">
      <CreateForm channel={channel} cb={() => closeBtnRef?.current?.click()} />
    </DialogWithTrigger>
  );
}

const formSchema = z.object({
  description: z.string(),
});

export function CreateForm({ channel, cb }: { channel: ChannelDto; cb: () => void }) {
  const queryClient = useQueryClient();
  const { pageState } = useChannelPageStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: channel.description ?? '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    let description: string | null = null;
    if (data.description.length > 0) {
      description = data.description;
    }
    await updateChannelDescription(channel.id, description);
    if (!pageState) return;
    await queryClient.invalidateQueries({ queryKey: pageState.queryKeys() });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextAreaFormField
          form={form}
          name="description"
          contentClassName="resize-y"
          contentStyle={css({ height: '6rem' })}
          placeholder="Write a description about channel..."
        />
        <FormSubmitButton />
      </form>
    </Form>
  );
}

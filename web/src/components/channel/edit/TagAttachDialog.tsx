import { RefObject, useRef } from 'react';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { TagAttachSelect } from '@/components/channel/edit/TagAttachSelect.tsx';
import { TAGS_QUERY_KEY } from '@/common/constants.ts';
import { css } from '@emotion/react';
import { attachTag } from '@/client/channel/tag.client.ts';
import { useChannelPageStore } from '@/hooks/channel/useChannelPageStore.ts';
import { ChannelDto } from '@/client/channel/channel.types.ts';
import { DialogWithTrigger } from '@/components/common/layout/DialogWithTrigger.tsx';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';

interface TagAttachDialogProps {
  channel: ChannelDto;
  triggerRef: RefObject<HTMLButtonElement>;
}

const FormSchema = z.object({
  tagName: z.string().nonempty(),
});

export function TagAttachDialog({ channel, triggerRef }: TagAttachDialogProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  return (
    <DialogWithTrigger closeRef={closeBtnRef} triggerRef={triggerRef} title="Attach Tag">
      <AttachForm channel={channel} cb={() => closeBtnRef.current?.click()} />
    </DialogWithTrigger>
  );
}

export function AttachForm({ channel, cb }: { channel: ChannelDto; cb: () => void }) {
  const queryClient = useQueryClient();
  const { pageState } = useChannelPageStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tagName: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await attachTag({ channelId: channel.id, tagName: data.tagName });
    if (!pageState) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: pageState.queryKeys() }),
    ]);
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="tagName"
          render={() => (
            <FormItem css={formItemStyle}>
              <FormLabel>Tag</FormLabel>
              <FormControl>
                <div onWheel={(e) => e.stopPropagation()}>
                  <TagAttachSelect
                    existsTags={channel.tags ?? []}
                    triggerClassName="w-full"
                    contentStyle={css({ width: '25rem' })}
                    onSelectCallback={(tag) => form.setValue('tagName', tag.name)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmitButton />
      </form>
    </Form>
  );
}

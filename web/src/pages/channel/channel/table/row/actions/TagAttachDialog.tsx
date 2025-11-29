import { RefObject, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { css } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shared/ui/cn/form.tsx';
import { DialogWithTrigger } from '@shared/ui/dialog/DialogWithTrigger';
import { ChannelDto } from '@entities/channel/channel/api/channel.types';
import { useChannelPageStore } from '@entities/channel/channel/model/useChannelPageStore';
import { attachTag } from '@entities/channel/tag/api/tag.client';
import { formItemStyle } from '@shared/lib/styles/form.ts';
import { FormSubmitButton } from '@shared/ui/form/FormSubmitButton.tsx';
import { TagAttachSelect } from '@pages/channel/channel/table/row/actions/TagAttachSelect.tsx';
import { TAGS_QUERY_KEY } from '@pages/channel/tag/config/constants.ts';

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

function AttachForm({ channel, cb }: { channel: ChannelDto; cb: () => void }) {
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

import { RefObject, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { DialogClose } from '@radix-ui/react-dialog';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { Button } from '@/components/ui/button.tsx';
import { TagAttachSelect } from '@/components/channel/edit/TagAttachSelect.tsx';
import { TAGS_QUERY_KEY } from '@/common/constants.ts';
import { css } from '@emotion/react';
import { attachTag } from '@/client/tag.client.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { ChannelRecord } from '@/client/channel.types.ts';

interface TagAttachDialogProps {
  channel: ChannelRecord;
  triggerRef: RefObject<HTMLButtonElement>;
}

const FormSchema = z.object({
  tagName: z.string().nonempty(),
});

export function TagAttachDialog({ channel, triggerRef }: TagAttachDialogProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button ref={triggerRef} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attach Tag</DialogTitle>
          <DialogDescription>Click save when you're done.</DialogDescription>
        </DialogHeader>
        <AttachForm channel={channel} cb={() => closeBtnRef.current?.click()} />
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  );
}

export function AttachForm({ channel, cb }: { channel: ChannelRecord; cb: () => void }) {
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
        <div className="flex flex-row justify-end mt-5">
          <Button type="submit" className="px-7">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

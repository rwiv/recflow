import { RefObject, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { DialogClose } from '@radix-ui/react-dialog';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { updateChannelDescription } from '@/client/channel.client.ts';
import { ChannelDto } from '@/client/channel.types.ts';

interface ChannelUpdateDialogProps {
  channel: ChannelDto;
  triggerRef: RefObject<HTMLButtonElement>;
}

const FormSchema = z.object({
  description: z.string(),
});

export function ChannelUpdateDialog({ channel, triggerRef }: ChannelUpdateDialogProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button ref={triggerRef} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Channel</DialogTitle>
          <DialogDescription>Click save when you're done.</DialogDescription>
        </DialogHeader>
        <CreateForm channel={channel} cb={() => closeBtnRef?.current?.click()} />
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  );
}

export function CreateForm({ channel, cb }: { channel: ChannelDto; cb: () => void }) {
  const queryClient = useQueryClient();
  const { pageState } = useChannelPageStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: channel.description ?? '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem css={formItemStyle}>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write a description about channel..."
                  className="resize-none"
                  {...field}
                />
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

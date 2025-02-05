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
import { TagSelect } from '@/components/channel/common/TagSelect.tsx';
import { TAGS_QUERY_KEY } from '@/common/consts.ts';
import { css } from '@emotion/react';

const FormSchema = z.object({
  tagName: z.string().nonempty(),
});

export function TagAttachDialog({ triggerRef }: { triggerRef: RefObject<HTMLButtonElement> }) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button ref={triggerRef} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Channel Priority</DialogTitle>
          <DialogDescription>Click save when you're done.</DialogDescription>
        </DialogHeader>
        <AttachForm cb={() => closeBtnRef.current?.click()} />
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  );
}

export function AttachForm({ cb }: { cb: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tagName: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    // await createChannel(data);
    await queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
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
                <TagSelect
                  triggerClassName="w-full"
                  contentStyle={css({ width: '25rem' })}
                  onSelectCallback={(tag) => form.setValue('tagName', tag.name)}
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

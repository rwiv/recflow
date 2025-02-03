import { useRef } from 'react';
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
import { css } from '@emotion/react';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form.tsx';
import { PlatformSelectField } from '@/components/channel/form/PlatformSelectField.tsx';
import { ChannelIdField } from '@/components/channel/form/ChannelIdField.tsx';
import { TagSelectField } from '@/components/channel/edit/EditTagSelect.tsx';

export function CreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="ml-1" css={css({ width: '5.5rem' })}>
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Channel</DialogTitle>
          <DialogDescription>Click save when you're done.</DialogDescription>
        </DialogHeader>
        <CreateForm cb={() => closeBtnRef?.current?.click()} />
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  );
}

const FormSchema = z.object({
  type: z.enum(['chzzk', 'soop']),
  uid: z.string().min(1),
  tagNames: z.array(z.string()),
});

export function CreateForm({ cb }: { cb: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: 'chzzk',
      uid: '',
      tagNames: [],
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    // await createLive(data.uid, data.type);
    // await queryClient.invalidateQueries({ queryKey: ['lives'] });
    // cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PlatformSelectField form={form} />
        <ChannelIdField form={form} />
        <TagSelectField form={form} />
        <div className="flex flex-row justify-end mt-5">
          <Button type="submit" className="px-7">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

import { useRef, useState } from 'react';
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
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx';
import { EditTagSelect } from '@/components/channel/edit/EditTagSelect.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { CHANNEL_PRIORITIES, PLATFORM_TYPES } from '@/components/common/consts.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { createChannel } from '@/client/client.ts';
import { CHANNELS_QUERY_KEY } from '@/common/consts.ts';

const FormSchema = z.object({
  ptype: z.enum(PLATFORM_TYPES),
  pid: z.string().nonempty(),
  priority: z.enum(CHANNEL_PRIORITIES),
  description: z.string(),
  tagNames: z.array(z.string()),
});

export type CreationForm = UseFormReturn<z.infer<typeof FormSchema>>;

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

export function CreateForm({ cb }: { cb: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ptype: 'chzzk',
      pid: '',
      priority: 'none',
      description: '',
      tagNames: [],
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    await createChannel(data);
    await queryClient.invalidateQueries({ queryKey: [CHANNELS_QUERY_KEY] });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="must">MUST</SelectItem>
                  <SelectItem value="should">SHOULD</SelectItem>
                  <SelectItem value="may">MAY</SelectItem>
                  <SelectItem value="review">REVIEW</SelectItem>
                  <SelectItem value="skip">SKIP</SelectItem>
                  <SelectItem value="none">NONE</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ptype"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="chzzk">CHZZK</SelectItem>
                  <SelectItem value="soop">SOOP</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UID</FormLabel>
              <FormControl>
                <Input placeholder="Enter Channel ID..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UID</FormLabel>
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

function TagSelectField({ form }: { form: CreationForm }) {
  const [tagNames, setTagNames] = useState<string[]>([]);
  return (
    <div>
      <FormField
        control={form.control}
        name="tagNames"
        render={({ field }) => {
          const addTagName = (tagName: string) => {
            field.onChange([...field.value, tagName]);
            setTagNames([...field.value, tagName]);
          };
          return (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div>
                  <EditTagSelect addTagName={addTagName} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <div className="flex gap-1 my-3">
        {tagNames.map((tagName, i) => (
          <Badge key={i}>{tagName}</Badge>
        ))}
      </div>
    </div>
  );
}

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
import { css, SerializedStyles } from '@emotion/react';
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
import { CHANNEL_PRIORITIES, PLATFORM_TYPES } from '@/common/enum.consts.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { CHANNELS_QUERY_KEY } from '@/common/consts.ts';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { createChannel } from '@/client/channel.client.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';

const FormSchema = z.object({
  platform: z.enum(PLATFORM_TYPES),
  pid: z.string().nonempty(),
  priority: z.enum(CHANNEL_PRIORITIES),
  followed: z.boolean(),
  description: z.string(),
  tagNames: z.array(z.string()),
});

export function ChannelCreateButton() {
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
  const { pageState } = useChannelPageStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      platform: 'chzzk',
      pid: '',
      priority: 'none',
      followed: false,
      description: '',
      tagNames: [],
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await createChannel(data);
    if (pageState) {
      await queryClient.invalidateQueries({ queryKey: [CHANNELS_QUERY_KEY, pageState.curPageNum] });
    }
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem css={formItemStyle}>
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
          name="platform"
          render={({ field }) => (
            <FormItem css={formItemStyle}>
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
            <FormItem css={formItemStyle}>
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
        <TagSelectField form={form} style={formItemStyle} />
        <div className="flex flex-row justify-end mt-5">
          <Button type="submit" className="px-7">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface TagSelectFieldProps {
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  style: SerializedStyles;
}

function TagSelectField({ form, style }: TagSelectFieldProps) {
  const [tagNames, setTagNames] = useState<string[]>([]);

  const addTagName = (tagName: string) => {
    const prev = form.getValues('tagNames');
    form.setValue('tagNames', [...prev, tagName]);
    setTagNames([...prev, tagName]);
  };

  return (
    <div>
      <FormField
        control={form.control}
        name="tagNames"
        render={() => (
          <FormItem css={style}>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <div>
                <EditTagSelect addTagName={addTagName} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex gap-1 flex-wrap" css={css({ height: '2rem' })}>
        {tagNames.map((tagName, i) => (
          <div key={i}>
            <Badge variant="secondary">{tagName}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

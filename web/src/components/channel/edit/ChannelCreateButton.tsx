import { useRef, useState } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { TagCreateSelect } from '@/components/channel/edit/TagCreateSelect.tsx';
import { SelectItem } from '@/components/ui/select.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { createChannel } from '@/client/channel.client.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { ChannelAppend } from '@/client/channel.types.ts';
import { platformNameEnum } from '@/client/common.schema.ts';
import { nonempty } from '@/common/common.schema.ts';
import { DialogButton } from '@/components/common/layout/DialogButton.tsx';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';
import { SelectFormField } from '@/components/common/form/SelectFormField.tsx';
import { TextFormField } from '@/components/common/form/TextFormField.tsx';
import { TextAreaFormField } from '@/components/common/form/TextAreaFormField.tsx';

export function ChannelCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  return (
    <DialogButton label="Add" title="Add New Node" closeRef={closeBtnRef}>
      <CreateForm cb={() => closeBtnRef.current?.click()} />
    </DialogButton>
  );
}

const FormSchema = z.object({
  platformName: platformNameEnum,
  pid: nonempty,
  priorityName: nonempty,
  isFollowed: z.boolean(),
  description: z.string(),
  tagNames: z.array(nonempty),
});

export function CreateForm({ cb }: { cb: () => void }) {
  const queryClient = useQueryClient();
  const { pageState } = useChannelPageStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      platformName: 'chzzk',
      pid: '',
      priorityName: 'none',
      isFollowed: false,
      description: '',
      tagNames: [],
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const req: ChannelAppend = { ...data };
    if (req.description === '') {
      req.description = null;
    }
    try {
      await createChannel(req);
    } catch (e) {
      if (e instanceof Error && e.message.includes('already exists')) {
        form.setError('pid', { message: 'Channel ID already exists' });
        return;
      }
      throw e;
    }
    if (!pageState) return;
    await queryClient.invalidateQueries({ queryKey: pageState.queryKeys() });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SelectFormField form={form} name="priorityName" label="Priority" defaultValue="none">
          <SelectItem value="must">MUST</SelectItem>
          <SelectItem value="should">SHOULD</SelectItem>
          <SelectItem value="may">MAY</SelectItem>
          <SelectItem value="review">REVIEW</SelectItem>
          <SelectItem value="skip">SKIP</SelectItem>
          <SelectItem value="none">NONE</SelectItem>
        </SelectFormField>
        <SelectFormField form={form} name="platformName" label="Platform">
          <SelectItem value="chzzk">CHZZK</SelectItem>
          <SelectItem value="soop">SOOP</SelectItem>
        </SelectFormField>
        <TextFormField form={form} name="pid" label="Channel UID" />
        <TextAreaFormField
          form={form}
          name="description"
          placeholder="Write a description about channel..."
        />
        <TagSelectField form={form} style={formItemStyle} />
        <FormSubmitButton />
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
              <div onWheel={(e) => e.stopPropagation()}>
                <TagCreateSelect existsTagNames={tagNames} addTagName={addTagName} />
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

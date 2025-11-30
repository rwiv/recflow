import { useRef, useState } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shared/ui/cn/form.tsx';
import { SelectItem } from '@shared/ui/cn/select.tsx';
import { Badge } from '@shared/ui/cn/badge.tsx';
import { fetchPlatforms } from '@entities/platform/api/platform.client.ts';
import { DialogButton } from '@shared/ui/dialog/DialogButton.tsx';
import { nonempty, uuid } from '@shared/lib/schema/schema_common.ts';
import { PlatformDto } from '@entities/platform/api/platform.schema.ts';
import { GradeDto } from '@entities/channel/grade/api/grade.schema.ts';
import { useChannelPageStore } from '@entities/channel/channel/model/useChannelPageStore.ts';
import { ChannelAppend } from '@entities/channel/channel/api/channel.types.ts';
import { SelectFormField } from '@shared/ui/form/SelectFormField.tsx';
import { uppercase } from '@shared/lib/types/strings.ts';
import { TextFormField } from '@shared/ui/form/TextFormField.tsx';
import { formItemStyle } from '@shared/lib/styles/form.ts';
import { TextAreaFormField } from '@shared/ui/form/TextAreaFormField.tsx';
import { FormSubmitButton } from '@shared/ui/form/FormSubmitButton.tsx';
import { PLATFORMS_QUERY_KEY } from '@entities/platform/config/constants.ts';
import { fetchGrades } from '@entities/channel/grade/api/grade.client.ts';
import { createChannel } from '@entities/channel/channel/api/channel.client.ts';
import { TagCreateSelect } from '@pages/channel/channel/ui/table/searchbar/left/createButton/TagCreateSelect.tsx';
import { GRADES_QUERY_KEY } from '@pages/channel/grade/config/constants.ts';

export function ChannelCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const { data: platforms } = useQuery({
    queryKey: [PLATFORMS_QUERY_KEY],
    queryFn: fetchPlatforms,
  });
  const { data: grades } = useQuery({
    queryKey: [GRADES_QUERY_KEY],
    queryFn: fetchGrades,
  });

  return (
    <DialogButton label="Add" title="Add New Node" closeRef={closeBtnRef}>
      {platforms && grades && (
        <CreateForm platforms={platforms} grades={grades} cb={() => closeBtnRef.current?.click()} />
      )}
    </DialogButton>
  );
}

const FormSchema = z.object({
  platformId: uuid,
  gradeId: uuid,
  sourceId: nonempty,
  isFollowed: z.boolean(),
  description: z.string(),
  tagNames: z.array(nonempty),
});

interface ChannelCreateProps {
  platforms: PlatformDto[];
  grades: GradeDto[];
  cb: () => void;
}

function CreateForm({ platforms, grades, cb }: ChannelCreateProps) {
  const queryClient = useQueryClient();
  const { pageState } = useChannelPageStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      platformId: '',
      sourceId: '',
      gradeId: '',
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
        form.setError('sourceId', { message: 'Channel ID already exists' });
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
        <SelectFormField form={form} name="gradeId" label="Grade">
          {grades.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {uppercase(p.name)}
            </SelectItem>
          ))}
        </SelectFormField>
        <SelectFormField form={form} name="platformId" label="Platform">
          {platforms.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {uppercase(p.name)}
            </SelectItem>
          ))}
        </SelectFormField>
        <TextFormField form={form} name="sourceId" label="Channel UID" />
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

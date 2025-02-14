import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z, ZodError } from 'zod';
import { Button } from '@/components/ui/button.tsx';
import { Form, FormField } from '@/components/ui/form.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { DialogClose } from '@radix-ui/react-dialog';
import { SelectItem } from '@/components/ui/select.tsx';
import { CHZZK_CRITERIA_QUERY_KEY, PLATFORMS_QUERY_KEY } from '@/common/constants.ts';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { fetchPlatforms } from '@/client/platform.client.ts';
import { PlatformDto } from '@/client/common.schema.ts';
import { chzzkCriterionAppend } from '@/client/criterion.schema.ts';
import { nonempty } from '@/common/common.schema.ts';
import { TextFormField } from '@/components/common/form/TextFormField.tsx';
import { SelectFormField } from '@/components/common/form/SelectFormField.tsx';
import { CheckFormField } from '@/components/common/form/CheckFormField.tsx';
import { css } from '@emotion/react';
import { createChzzkCriterion } from '@/client/criterion.client.ts';
import { InputListFormItem } from '@/components/common/form/InputListFormItem.tsx';

export function CriterionCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const { data: platforms } = useQuery({
    queryKey: [PLATFORMS_QUERY_KEY],
    queryFn: fetchPlatforms,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-auto" css={css({ maxHeight: '50rem' })}>
        <DialogHeader>
          <DialogTitle>Add New Criterion</DialogTitle>
          <DialogDescription>Click save when you're done.</DialogDescription>
        </DialogHeader>
        {platforms && <CreateForm platforms={platforms} cb={() => closeBtnRef.current?.click()} />}
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  );
}

const formSchema = chzzkCriterionAppend.extend({
  description: z.string(),
  minUserCnt: nonempty,
  minFollowCnt: nonempty,
});

export function CreateForm({ platforms, cb }: { platforms: PlatformDto[]; cb: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      platformId: '',
      description: '',
      enforceCreds: false,
      minUserCnt: '',
      minFollowCnt: '',
      positiveTags: [],
      negativeTags: [],
      positiveKeywords: [],
      negativeKeywords: [],
      positiveWps: [],
      negativeWps: [],
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const newData = {
      ...data,
      description: data.description == '' ? null : data.description,
    };
    try {
      // console.log(chzzkCriterionAppend.parse(newData)) // TODO: remove
      await createChzzkCriterion(chzzkCriterionAppend.parse(newData));
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(e);
        for (const err of e.errors) {
          const path = z.enum(formSchema.keyof()._def.values).parse(err.path.toString());
          form.setError(path, { message: err.message });
        }
        return;
      }
    }
    await queryClient.invalidateQueries({ queryKey: [CHZZK_CRITERIA_QUERY_KEY] });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextFormField form={form} name="name" label="Name" style={formItemStyle} />
        <CheckFormField form={form} name="enforceCreds" />
        <TextFormField form={form} name="description" label="Description" style={formItemStyle} />
        <TextFormField form={form} name="minUserCnt" label="Minimum User Count" style={formItemStyle} />
        <TextFormField form={form} name="minFollowCnt" label="Minimum Follow Count" style={formItemStyle} />
        <SelectFormField form={form} name="platformId" label="Platform">
          {platforms.map((platform) => (
            <SelectItem key={platform.id} value={platform.id}>
              {platform.name}
            </SelectItem>
          ))}
        </SelectFormField>
        <FormField
          control={form.control}
          name="positiveTags"
          render={({ field }) => (
            <InputListFormItem field={field} label="Positive Tags" values={form.getValues('positiveTags')} />
          )}
        />
        <FormField
          control={form.control}
          name="negativeTags"
          render={({ field }) => (
            <InputListFormItem field={field} label="Negative Tags" values={form.getValues('negativeTags')} />
          )}
        />
        <FormField
          control={form.control}
          name="positiveKeywords"
          render={({ field }) => (
            <InputListFormItem
              field={field}
              label="Positive Keywords"
              values={form.getValues('positiveKeywords')}
            />
          )}
        />
        <FormField
          control={form.control}
          name="negativeKeywords"
          render={({ field }) => (
            <InputListFormItem
              field={field}
              label="Negative Tags"
              values={form.getValues('negativeKeywords')}
            />
          )}
        />
        <FormField
          control={form.control}
          name="positiveWps"
          render={({ field }) => (
            <InputListFormItem
              field={field}
              label="Positive WatchpartyNo"
              values={form.getValues('positiveWps')}
            />
          )}
        />
        <FormField
          control={form.control}
          name="negativeWps"
          render={({ field }) => (
            <InputListFormItem
              field={field}
              label="Negative WatchpartyNo"
              values={form.getValues('negativeWps')}
            />
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

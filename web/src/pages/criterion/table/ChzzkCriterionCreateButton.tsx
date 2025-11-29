import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z, ZodError } from 'zod';
import { Form, FormField } from '@shared/ui/cn/form.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { CHZZK_CRITERIA_QUERY_KEY } from '@shared/config/constants.ts';
import { fetchPlatforms } from '@entities/platform/api/platform.client.ts';
import { chzzkCriterionAppend } from '@entities/criterion/api/criterion.schema.ts';
import { nonempty } from '@shared/lib/schema/schema_common.ts';
import { TextFormField } from '@shared/ui/form/TextFormField.tsx';
import { CheckFormField } from '@shared/ui/form/CheckFormField.tsx';
import { css } from '@emotion/react';
import { createChzzkCriterion } from '@entities/criterion/api/criterion.client.ts';
import { InputListFormItem } from '@shared/ui/form/InputListFormItem.tsx';
import { DialogButton } from '@shared/ui/dialog/DialogButton.tsx';
import { FormSubmitButton } from '@shared/ui/form/FormSubmitButton.tsx';

interface Unit {
  name:
    | 'positiveTags'
    | 'negativeTags'
    | 'positiveKeywords'
    | 'negativeKeywords'
    | 'positiveWps'
    | 'negativeWps';
  label: string;
}

const unitReqs: Unit[] = [
  { name: 'positiveTags', label: 'Positive Tags' },
  { name: 'negativeTags', label: 'Negative Tags' },
  { name: 'positiveKeywords', label: 'Positive Keywords' },
  { name: 'negativeKeywords', label: 'Negative Keywords' },
  { name: 'positiveWps', label: 'Positive WatchpartyNo' },
  { name: 'negativeWps', label: 'Negative WatchpartyNo' },
];

const formSchema = chzzkCriterionAppend.omit({ platformId: true }).extend({
  description: z.string(),
  adultOnly: z.boolean(),
  domesticOnly: z.boolean(),
  overseasFirst: z.boolean(),
  loggingOnly: z.boolean(),
  minUserCnt: nonempty,
});

export function ChzzkCriterionCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogButton
      contentCn="sm:max-w-lg overflow-auto"
      contentStyle={css({ maxHeight: '50rem' })}
      label="Append"
      title="Add New Chzzk Criterion"
      closeRef={closeBtnRef}
    >
      <CreateForm cb={() => closeBtnRef.current?.click()} />
    </DialogButton>
  );
}

export function CreateForm({ cb }: { cb: () => void }) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isDeactivated: true,
      enforceCreds: false,
      adultOnly: false,
      domesticOnly: false,
      overseasFirst: false,
      loggingOnly: false,
      minUserCnt: '',
      positiveTags: [],
      negativeTags: [],
      positiveKeywords: [],
      negativeKeywords: [],
      positiveWps: [],
      negativeWps: [],
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const platform = (await fetchPlatforms()).find((it) => it.name === 'chzzk');
    if (!platform) throw new Error('Platform not found');
    const newData = {
      ...data,
      description: data.description == '' ? null : data.description,
      platformId: platform.id,
    };
    try {
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
        <TextFormField form={form} name="name" label="Name" />
        <CheckFormField form={form} name="enforceCreds" label="Enforce Credentials" />
        {/*<CheckFormField form={form} name="adultOnly" label="Adult Only" />*/}
        {/*<CheckFormField form={form} name="domesticOnly" label="Domestic Only" />*/}
        {/*<CheckFormField form={form} name="overseasFirst" label="Overseas First " />*/}
        <CheckFormField form={form} name="loggingOnly" label="Logging Only" />
        <TextFormField form={form} name="description" label="Description" />
        <TextFormField form={form} name="minUserCnt" label="Minimum User Count" placeholder="0" />
        {unitReqs.map((unit, idx) => (
          <FormField
            key={idx}
            control={form.control}
            name={unit.name}
            render={({ field }) => (
              <InputListFormItem
                field={field}
                label={unit.label}
                values={form.getValues(unit.name)}
                placeholder="Add query conditions..."
              />
            )}
          />
        ))}
        <FormSubmitButton />
      </form>
    </Form>
  );
}

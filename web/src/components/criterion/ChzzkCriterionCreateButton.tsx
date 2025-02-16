import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z, ZodError } from 'zod';
import { Form, FormField } from '@/components/ui/form.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { CHZZK_CRITERIA_QUERY_KEY } from '@/common/constants.ts';
import { fetchPlatforms } from '@/client/platform.client.ts';
import { chzzkCriterionAppend } from '@/client/criterion.schema.ts';
import { nonempty } from '@/common/common.schema.ts';
import { TextFormField } from '@/components/common/form/TextFormField.tsx';
import { CheckFormField } from '@/components/common/form/CheckFormField.tsx';
import { css } from '@emotion/react';
import { createChzzkCriterion } from '@/client/criterion.client.ts';
import { InputListFormItem } from '@/components/common/form/InputListFormItem.tsx';
import { DialogButton } from '@/components/common/layout/DialogButton.tsx';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';

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
  minUserCnt: nonempty,
  minFollowCnt: nonempty,
});

export function ChzzkCriterionCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogButton
      contentCn="sm:max-w-lg overflow-auto"
      contentStyle={css({ maxHeight: '50rem' })}
      label="Add"
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
      enforceCreds: false,
      isDeactivated: true,
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
        <TextFormField form={form} name="description" label="Description" />
        <TextFormField form={form} name="minUserCnt" label="Minimum User Count" placeholder="0" />
        <TextFormField form={form} name="minFollowCnt" label="Minimum Follow Count" placeholder="0" />
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

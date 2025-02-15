import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z, ZodError } from 'zod';
import { Button } from '@/components/ui/button.tsx';
import { Form, FormField } from '@/components/ui/form.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { SelectItem } from '@/components/ui/select.tsx';
import { CHZZK_CRITERIA_QUERY_KEY, PLATFORMS_QUERY_KEY } from '@/common/constants.ts';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { fetchPlatforms } from '@/client/platform.client.ts';
import { chzzkCriterionAppend } from '@/client/criterion.schema.ts';
import { nonempty } from '@/common/common.schema.ts';
import { TextFormField } from '@/components/common/form/TextFormField.tsx';
import { SelectFormField } from '@/components/common/form/SelectFormField.tsx';
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

const formSchema = chzzkCriterionAppend.extend({
  description: z.string(),
  minUserCnt: nonempty,
  minFollowCnt: nonempty,
});

export function CriterionCreateButton() {
  const queryClient = useQueryClient();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const { data: platforms } = useQuery({
    queryKey: [PLATFORMS_QUERY_KEY],
    queryFn: fetchPlatforms,
  });

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
    closeBtnRef.current?.click();
  }

  if (!platforms) return <Button variant="secondary">Loading...</Button>;

  return (
    <DialogButton
      contentCn="sm:max-w-md overflow-auto"
      contentStyle={css({ maxHeight: '50rem' })}
      label="Add"
      title="Add New Node"
      closeRef={closeBtnRef}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TextFormField form={form} name="name" label="Name" style={formItemStyle} />
          <CheckFormField form={form} name="enforceCreds" label="Enforce Credentials" />
          <TextFormField form={form} name="description" label="Description" style={formItemStyle} />
          <TextFormField form={form} name="minUserCnt" label="Minimum User Count" style={formItemStyle} />
          <TextFormField form={form} name="minFollowCnt" label="Minimum Follow Count" style={formItemStyle} />
          <SelectFormField form={form} name="platformId">
            {platforms.map((platform) => (
              <SelectItem key={platform.id} value={platform.id}>
                {platform.name}
              </SelectItem>
            ))}
          </SelectFormField>
          {unitReqs.map((unit, idx) => (
            <FormField
              key={idx}
              control={form.control}
              name={unit.name}
              render={({ field }) => (
                <InputListFormItem field={field} label={unit.label} values={form.getValues(unit.name)} />
              )}
            />
          ))}
          <FormSubmitButton />
        </form>
      </Form>
    </DialogButton>
  );
}

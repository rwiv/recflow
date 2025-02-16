import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z, ZodError } from 'zod';
import { Form, FormField } from '@/components/ui/form.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { SOOP_CRITERIA_QUERY_KEY } from '@/common/constants.ts';
import { fetchPlatforms } from '@/client/platform.client.ts';
import { soopCriterionAppend } from '@/client/criterion.schema.ts';
import { nonempty } from '@/common/common.schema.ts';
import { TextFormField } from '@/components/common/form/TextFormField.tsx';
import { CheckFormField } from '@/components/common/form/CheckFormField.tsx';
import { css } from '@emotion/react';
import { createSoopCriterion } from '@/client/criterion.client.ts';
import { InputListFormItem } from '@/components/common/form/InputListFormItem.tsx';
import { DialogButton } from '@/components/common/layout/DialogButton.tsx';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';

interface Unit {
  name: 'positiveCates' | 'negativeCates';
  label: string;
}

const unitReqs: Unit[] = [
  { name: 'positiveCates', label: 'Positive Cates' },
  { name: 'negativeCates', label: 'Negative Cates' },
];

const formSchema = soopCriterionAppend.omit({ platformId: true }).extend({
  description: z.string(),
  minUserCnt: nonempty,
  minFollowCnt: nonempty,
});

export function SoopCriterionCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogButton
      contentCn="sm:max-w-lg overflow-auto"
      contentStyle={css({ maxHeight: '50rem' })}
      label="Add"
      title="Add New Soop Criterion"
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
      positiveCates: [],
      negativeCates: [],
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const platform = (await fetchPlatforms()).find((it) => it.name === 'soop');
    if (!platform) throw new Error('Platform not found');
    const newData = {
      ...data,
      description: data.description == '' ? null : data.description,
      platformId: platform.id,
    };
    try {
      await createSoopCriterion(soopCriterionAppend.parse(newData));
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
    await queryClient.invalidateQueries({ queryKey: [SOOP_CRITERIA_QUERY_KEY] });
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

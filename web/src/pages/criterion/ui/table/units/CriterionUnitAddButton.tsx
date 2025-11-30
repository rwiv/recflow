import { createCriterionUnit } from '@pages/criterion/api/criterion.client.ts';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@shared/ui/cn/form.tsx';
import { FormSubmitButton } from '@shared/ui/form/FormSubmitButton.tsx';
import { useRef } from 'react';
import { TextFormField } from '@shared/ui/form/TextFormField.tsx';
import { Badge } from '@shared/ui/cn/badge.tsx';
import { DialogWithTrigger } from '@shared/ui/dialog/DialogWithTrigger.tsx';
import { nonempty } from '@shared/lib/schema/schema_common.ts';

interface CriterionUnitAddProps {
  criterionId: string;
  ruleId: string;
  isPositive: boolean;
  queryKey: string;
}

export function CriterionUnitAddButton({ criterionId, ruleId, isPositive, queryKey }: CriterionUnitAddProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <DialogWithTrigger closeRef={closeBtnRef} triggerRef={triggerRef} title="Add New Criterion Unit">
        <CreateForm
          criterionId={criterionId}
          ruleId={ruleId}
          isPositive={isPositive}
          queryKey={queryKey}
          cb={() => closeBtnRef?.current?.click()}
        />
      </DialogWithTrigger>
      <Badge
        variant="outline"
        className="cursor-pointer rounded-full px-1.5"
        onClick={() => triggerRef.current?.click()}
      >
        +
      </Badge>
    </>
  );
}

interface CriterionUnitAddFormProps {
  criterionId: string;
  ruleId: string;
  isPositive: boolean;
  queryKey: string;
  cb: () => void;
}

const formSchema = z.object({
  value: nonempty,
});

export function CreateForm({ criterionId, ruleId, isPositive, queryKey, cb }: CriterionUnitAddFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createCriterionUnit({ criterionId, ruleId, value: data.value, isPositive });
    await queryClient.invalidateQueries({ queryKey: [queryKey] });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextFormField form={form} name="value" label="Value" />
        <FormSubmitButton />
      </form>
    </Form>
  );
}

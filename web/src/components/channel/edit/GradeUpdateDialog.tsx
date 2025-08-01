import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReactNode, useRef } from 'react';
import { SelectItem } from '@/components/ui/select.tsx';
import { css } from '@emotion/react';
import { useChannelPageStore } from '@/hooks/channel/useChannelPageStore.ts';
import { updateChannelGrade } from '@/client/channel/channel.client.ts';
import { ChannelDto } from '@/client/channel/channel.types.ts';
import { SelectFormField } from '@/components/common/form/SelectFormField.tsx';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';
import { DialogBase } from '@/components/common/layout/DialogBase.tsx';
import { GRADES_QUERY_KEY } from '@/common/constants.ts';
import { uuid } from '@/common/common.schema.ts';
import { uppercase } from '@/common/utils.strings.ts';
import { fetchGrades } from '@/client/channel/grade.client.ts';
import { GradeDto } from '@/client/channel/grade.schema.ts';

const FormSchema = z.object({
  gradeId: uuid,
});

export function GradeUpdateDialog({ channel, children }: { channel: ChannelDto; children: ReactNode }) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const { data: grades } = useQuery({
    queryKey: [GRADES_QUERY_KEY],
    queryFn: fetchGrades,
  });

  return (
    <DialogBase title="Update Channel Grade" closeRef={closeBtnRef} triggerNode={children}>
      <CreateForm channel={channel} grades={grades ?? []} cb={() => closeBtnRef?.current?.click()} />
    </DialogBase>
  );
}

function CreateForm({ channel, grades, cb }: { channel: ChannelDto; grades: GradeDto[]; cb: () => void }) {
  const queryClient = useQueryClient();
  const { pageState } = useChannelPageStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      gradeId: channel.grade.id,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await updateChannelGrade(channel.id, data.gradeId);
    if (!pageState) return;
    await queryClient.invalidateQueries({ queryKey: pageState.queryKeys() });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SelectFormField
          form={form}
          name="gradeId"
          label="Grade"
          style={css({ marginTop: '0.4rem', marginBottom: '2rem' })}
        >
          {grades.map((grade) => (
            <SelectItem key={grade.id} value={grade.id}>
              {uppercase(grade.name)}
            </SelectItem>
          ))}
        </SelectFormField>
        <FormSubmitButton />
      </form>
    </Form>
  );
}

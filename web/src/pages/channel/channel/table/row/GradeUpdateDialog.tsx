import { ReactNode, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { css } from '@emotion/react';
import { Form } from '@shared/ui/cn/form.tsx';
import { SelectItem } from '@shared/ui/cn/select.tsx';
import { uuid } from '@shared/lib/schema/schema_common';
import { ChannelDto } from '@entities/channel/channel/api/channel.types';
import { fetchGrades } from '@entities/channel/grade/api/grade.client';
import { GRADES_QUERY_KEY } from '@pages/channel/grade/config/constants.ts';
import { GradeDto } from '@entities/channel/grade/api/grade.schema.ts';
import { useChannelPageStore } from '@entities/channel/channel/model/useChannelPageStore';
import { DialogBase } from '@shared/ui/dialog/DialogBase';
import { SelectFormField } from '@shared/ui/form/SelectFormField.tsx';
import { uppercase } from '@shared/lib/types/strings.ts';
import { updateChannelGrade } from '@entities/channel/channel/api/channel.client.ts';
import { FormSubmitButton } from '@shared/ui/form/FormSubmitButton.tsx';

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

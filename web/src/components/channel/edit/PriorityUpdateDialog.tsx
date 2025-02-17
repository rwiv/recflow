import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReactNode, useRef } from 'react';
import { SelectItem } from '@/components/ui/select.tsx';
import { css } from '@emotion/react';
import { useChannelPageStore } from '@/hooks/channel/useChannelPageStore.ts';
import { fetchPriorities, updateChannelPriority } from '@/client/channel.client.ts';
import { ChannelDto, PriorityDto } from '@/client/channel.types.ts';
import { SelectFormField } from '@/components/common/form/SelectFormField.tsx';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';
import { DialogBase } from '@/components/common/layout/DialogBase.tsx';
import { PRIORITIES_QUERY_KEY } from '@/common/constants.ts';
import { uuid } from '@/common/common.schema.ts';
import { uppercase } from '@/common/utils.strings.ts';

const FormSchema = z.object({
  priorityId: uuid,
});

export function PriorityUpdateDialog({ channel, children }: { channel: ChannelDto; children: ReactNode }) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const { data: priorities } = useQuery({
    queryKey: [PRIORITIES_QUERY_KEY],
    queryFn: fetchPriorities,
  });

  return (
    <DialogBase title="Update Channel Priority" closeRef={closeBtnRef} triggerNode={children}>
      <CreateForm channel={channel} priorities={priorities ?? []} cb={() => closeBtnRef?.current?.click()} />
    </DialogBase>
  );
}

function CreateForm({
  channel,
  priorities,
  cb,
}: {
  channel: ChannelDto;
  priorities: PriorityDto[];
  cb: () => void;
}) {
  const queryClient = useQueryClient();
  const { pageState } = useChannelPageStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      priorityId: channel.priority.id,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await updateChannelPriority(channel.id, data.priorityId);
    if (!pageState) return;
    await queryClient.invalidateQueries({ queryKey: pageState.queryKeys() });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SelectFormField
          form={form}
          name="priorityId"
          style={css({ marginTop: '0.4rem', marginBottom: '2rem' })}
        >
          {priorities.map((priority) => (
            <SelectItem key={priority.id} value={priority.id}>
              {uppercase(priority.name)}
            </SelectItem>
          ))}
        </SelectFormField>
        <FormSubmitButton />
      </form>
    </Form>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@shared/ui/cn/form.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { SelectItem } from '@shared/ui/cn/select.tsx';
import { nodeAppend } from '@entities/node/node/api/node.schema.ts';
import { createNode } from '@entities/node/node/api/node.client.ts';
import { DialogButton } from '@shared/ui/dialog/DialogButton.tsx';
import { TextFormField } from '@shared/ui/form/TextFormField.tsx';
import { SelectFormField } from '@shared/ui/form/SelectFormField.tsx';
import { css } from '@emotion/react';
import { CheckFormField } from '@shared/ui/form/CheckFormField.tsx';
import { FormSubmitButton } from '@shared/ui/form/FormSubmitButton.tsx';
import { parse } from '@shared/lib/schema/form_utils.ts';
import { nonempty } from '@shared/lib/schema/schema_common.ts';
import { fetchNodeGroups } from '@entities/node/group/api/node-group.client.ts';
import { NodeGroupDto } from '@entities/node/group/api/node-group.schema.ts';
import { NODE_GROUPS_QUERY_KEY, NODES_QUERY_KEY } from '@shared/config';

export function NodeCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const { data: nodeGroups } = useQuery({
    queryKey: [NODE_GROUPS_QUERY_KEY],
    queryFn: fetchNodeGroups,
  });

  return (
    <DialogButton
      contentCn="sm:max-w-lg overflow-auto"
      contentStyle={css({ maxHeight: '50rem' })}
      label="Append"
      title="Add New Node"
      closeRef={closeBtnRef}
    >
      {nodeGroups && <CreateForm nodeGroups={nodeGroups} cb={() => closeBtnRef.current?.click()} />}
    </DialogButton>
  );
}

const formSchema = nodeAppend.extend({
  priority: nonempty,
  capacity: nonempty,
});

const middleSchema = formSchema.extend({
  priority: z.coerce.number().positive(),
  capacity: z.coerce.number().nonnegative(),
});

export function CreateForm({ nodeGroups, cb }: { nodeGroups: NodeGroupDto[]; cb: () => void }) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      endpoint: '',
      priority: '',
      capacity: '',
      isCordoned: false,
      isDomestic: false,
      groupId: '',
      failureCnt: 0,
      livesCnt: 0,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const middleData = parse(middleSchema, data, form);
    if (!middleData) return;
    const req = nodeAppend.parse(middleData);
    if (!req) return;
    await createNode(req);
    await queryClient.invalidateQueries({ queryKey: [NODES_QUERY_KEY] });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextFormField form={form} name="name" />
        <TextFormField form={form} name="endpoint" />
        <CheckFormField form={form} name="isCordoned" label="Cordoned" />
        <CheckFormField form={form} name="isDomestic" label="Domestic" />
        <SelectFormField form={form} name="groupId" label="Node Group">
          {nodeGroups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectFormField>
        <TextFormField form={form} name="priority" label="Priority" placeholder="1" />
        <TextFormField form={form} name="capacity" placeholder="0" />
        <FormSubmitButton />
      </form>
    </Form>
  );
}

import { css } from '@emotion/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { parse } from '@/shared/lib/schema/form_utils.ts';
import { nonempty } from '@/shared/lib/schema/schema_common.ts';
import { Form } from '@/shared/ui/cn/form.tsx';
import { SelectItem } from '@/shared/ui/cn/select.tsx';
import { DialogButton } from '@/shared/ui/dialog/DialogButton.tsx';
import { CheckFormField } from '@/shared/ui/form/CheckFormField.tsx';
import { FormSubmitButton } from '@/shared/ui/form/FormSubmitButton.tsx';
import { SelectFormField } from '@/shared/ui/form/SelectFormField.tsx';
import { TextFormField } from '@/shared/ui/form/TextFormField.tsx';

import { NodeGroupDto } from '@/entities/node/group/model/node-group.schema.ts';
import { nodeAppend } from '@/entities/node/node/model/node.schema.ts';

import { fetchNodeGroups } from '@/features/node/group/api/node-group.client.ts';
import { NODE_GROUPS_QUERY_KEY } from '@/features/node/group/config/constants.ts';
import { createNode } from '@/features/node/node/api/node.client.ts';
import { NODES_QUERY_KEY } from '@/features/node/node/config/constants.ts';

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

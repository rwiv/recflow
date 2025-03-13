import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { SelectItem } from '@/components/ui/select.tsx';
import { NODE_GROUPS_QUERY_KEY, NODES_QUERY_KEY } from '@/common/constants.ts';
import { nodeAppend, NodeCapacities, NodeGroupDto, nodeTypeNameEnum } from '@/client/node/node.schema.ts';
import { createNode } from '@/client/node/node.client.ts';
import { DialogButton } from '@/components/common/layout/DialogButton.tsx';
import { TextFormField } from '@/components/common/form/TextFormField.tsx';
import { SelectFormField } from '@/components/common/form/SelectFormField.tsx';
import { css } from '@emotion/react';
import { CheckFormField } from '@/components/common/form/CheckFormField.tsx';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';
import { parse } from '@/common/utils.form.ts';
import { nonempty } from '@/common/common.schema.ts';
import { fetchNodeGroups } from '@/client/node/node-group.client.ts';

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

const formSchema = nodeAppend.omit({ capacities: true }).extend({
  typeName: nonempty,
  weight: nonempty,
  chzzkCapacity: nonempty,
  soopCapacity: nonempty,
});

const middleSchema = formSchema.extend({
  typeName: nodeTypeNameEnum,
  weight: z.coerce.number().positive(),
  chzzkCapacity: z.coerce.number().nonnegative(),
  soopCapacity: z.coerce.number().nonnegative(),
});

export function CreateForm({ nodeGroups, cb }: { nodeGroups: NodeGroupDto[]; cb: () => void }) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      endpoint: '',
      weight: '',
      isCordoned: false,
      groupId: '',
      typeName: '',
      chzzkCapacity: '',
      soopCapacity: '',
      failureCnt: 0,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
    const middleData = parse(middleSchema, data, form);
    if (!middleData) return;
    const capacities: NodeCapacities = [
      { platformName: 'chzzk', capacity: middleData.chzzkCapacity },
      { platformName: 'soop', capacity: middleData.soopCapacity },
      { platformName: 'twitch', capacity: 0 },
    ];
    const req = nodeAppend.parse({ ...middleData, capacities });
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
        <SelectFormField form={form} name="typeName" label="Node Type">
          <SelectItem value="worker">WORKER</SelectItem>
          <SelectItem value="argo">ARGO</SelectItem>
        </SelectFormField>
        <SelectFormField form={form} name="groupId" label="Node Group">
          {nodeGroups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectFormField>
        <TextFormField form={form} name="weight" placeholder="1" />
        <TextFormField form={form} name="chzzkCapacity" label="Chzzk Capacity" placeholder="0" />
        <TextFormField form={form} name="soopCapacity" label="Soop Capacity" placeholder="0" />
        <FormSubmitButton />
      </form>
    </Form>
  );
}

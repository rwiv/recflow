import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/shared/ui/cn/form.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReactNode, useRef } from 'react';
import { SelectItem } from '@/shared/ui/cn/select.tsx';
import { css } from '@emotion/react';
import { SelectFormField } from '@/shared/ui/form/SelectFormField.tsx';
import { FormSubmitButton } from '@/shared/ui/form/FormSubmitButton.tsx';
import { DialogBase } from '@/shared/ui/dialog/DialogBase.tsx';
import { NodeDto } from '@/entities/node/node/api/node.schema.ts';
import { updateNode } from '@/entities/node/node/api/node.client.ts';
import { uuid } from '@/shared/lib/schema/schema_common.ts';
import { Badge } from '@/shared/ui/cn/badge.tsx';
import { fetchNodeGroups } from '@/entities/node/group/api/node-group.client.ts';
import { NodeGroupDto } from '@/entities/node/group/api/node-group.schema.ts';
import { NODE_GROUPS_QUERY_KEY } from '@/entities/node/group/config/constants.ts';
import { NODES_QUERY_KEY } from '@/entities/node/node/config/constants.ts';

export function NodeGroupBadge({ node }: { node: NodeDto }) {
  return (
    <GroupUpdateDialog node={node}>
      <div className="justify-self-center">
        <button>
          <Badge variant="secondary">{node.group?.name ?? ''}</Badge>
        </button>
      </div>
    </GroupUpdateDialog>
  );
}

function GroupUpdateDialog({ node, children }: { node: NodeDto; children: ReactNode }) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { data: nodeGroups } = useQuery({
    queryKey: [NODE_GROUPS_QUERY_KEY],
    queryFn: fetchNodeGroups,
  });
  return (
    <DialogBase title="Update Channel Grade" closeRef={closeBtnRef} triggerNode={children}>
      {nodeGroups && (
        <CreateForm node={node} nodeGroups={nodeGroups} cb={() => closeBtnRef?.current?.click()} />
      )}
    </DialogBase>
  );
}

const formSchema = z.object({
  groupId: uuid,
});

function CreateForm({ node, nodeGroups, cb }: { node: NodeDto; nodeGroups: NodeGroupDto[]; cb: () => void }) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: node.groupId,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await updateNode(node.id, { groupId: data.groupId });
    await queryClient.invalidateQueries({ queryKey: [NODES_QUERY_KEY] });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SelectFormField
          form={form}
          name="groupId"
          style={css({ marginTop: '0.4rem', marginBottom: '2rem' })}
          defaultValue={node.groupId}
        >
          {nodeGroups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectFormField>
        <FormSubmitButton />
      </form>
    </Form>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReactNode, useRef } from 'react';
import { SelectItem } from '@/components/ui/select.tsx';
import { css } from '@emotion/react';
import { SelectFormField } from '@/components/common/form/SelectFormField.tsx';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';
import { DialogBase } from '@/components/common/layout/DialogBase.tsx';
import { NodeDto, NodeGroupDto } from '@/client/node/node.schema.ts';
import { NODE_GROUPS_QUERY_KEY, NODES_QUERY_KEY } from '@/common/constants.ts';
import { updateNodeNodeGroup } from '@/client/node/node.client.ts';
import { uuid } from '@/common/common.schema.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { fetchNodeGroups } from '@/client/node/node-group.client.ts';

export function NodeGroupBadge({ node }: { node: NodeDto }) {
  return (
    <GroupUpdateDialog node={node}>
      <div className="justify-self-center">
        <button>
          <Badge variant="default">{node.group?.name ?? ''}</Badge>
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
    <DialogBase title="Update Channel Priority" closeRef={closeBtnRef} triggerNode={children}>
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
    await updateNodeNodeGroup(node.id, data.groupId);
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

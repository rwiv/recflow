import { zodResolver } from '@hookform/resolvers/zod';
import { FieldValues, Path, useForm, UseFormReturn } from 'react-hook-form';
import { z, ZodError } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, ChangeEventHandler, useRef } from 'react';
import { SelectItem } from '@/components/ui/select.tsx';
import { Input } from '@/components/ui/input.tsx';
import { NODE_GROUPS_QUERY_KEY, NODES_QUERY_KEY } from '@/common/constants.ts';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { nodeAppend, NodeGroupDto } from '@/client/node.schema.ts';
import { createNode, fetchNodeGroups } from '@/client/node.client.ts';
import { DialogButton } from '@/components/common/layout/DialogButton.tsx';
import { TextFormField } from '@/components/common/form/TextFormField.tsx';
import { SelectFormField } from '@/components/common/form/SelectFormField.tsx';
import { css, SerializedStyles } from '@emotion/react';
import { firstLetterUppercase } from '@/common/utils.ts';
import { CheckFormField } from '@/components/common/form/CheckFormField.tsx';
import { PlatformName, platformNameEnum } from '@/client/common.schema.ts';
import { FormSubmitButton } from '@/components/common/form/FormSubmitButton.tsx';

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
      label="Add"
      title="Add New Node"
      closeRef={closeBtnRef}
    >
      {nodeGroups && <CreateForm nodeGroups={nodeGroups} cb={() => closeBtnRef.current?.click()} />}
    </DialogButton>
  );
}

const formSchema = nodeAppend.extend({
  typeName: z.string().nonempty(),
  weight: z.string().nonempty(),
  totalCapacity: z.string().nonempty(),
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
      totalCapacity: '',
      groupId: '',
      typeName: '',
      capacities: [
        { platformName: 'chzzk', capacity: -1 },
        { platformName: 'soop', capacity: -1 },
        { platformName: 'twitch', capacity: -1 },
      ],
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await createNode(nodeAppend.parse(data));
    } catch (e) {
      if (e instanceof ZodError) {
        for (const err of e.errors) {
          const path = z.enum(formSchema.keyof()._def.values).parse(err.path.toString());
          form.setError(path, { message: err.message });
        }
        return;
      }
    }
    await queryClient.invalidateQueries({ queryKey: [NODES_QUERY_KEY] });
    cb();
  }

  const onChangeCapacity = (e: ChangeEvent<HTMLInputElement>, platformName: PlatformName) => {
    const capacities = form.getValues('capacities');
    const capacity = capacities.find((c) => c.platformName === platformName);
    const rest = capacities.filter((c) => c.platformName !== platformName);
    if (capacity) {
      const newCapacity = {
        ...capacity,
        capacity: parseInt(e.target.value),
      };
      form.setValue('capacities', [...rest, newCapacity]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextFormField form={form} name="name" />
        <TextFormField form={form} name="endpoint" />
        <TextFormField form={form} name="weight" />
        <CheckFormField form={form} name="isCordoned" label="Cordoned" />
        <TextFormField form={form} name="totalCapacity" label="Total Capacity" />
        <SelectFormField form={form} name="groupId" label="Node Group">
          {nodeGroups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectFormField>
        <SelectFormField form={form} name="typeName" label="Node Type">
          <SelectItem value="worker">WORKER</SelectItem>
          <SelectItem value="argo">ARGO</SelectItem>
        </SelectFormField>
        {platformNameEnum.options.map((platformName, idx) => (
          <CapacitiesField
            key={idx}
            form={form}
            name="capacities"
            label={`${firstLetterUppercase(platformName)} Capacity`}
            onChange={(e) => onChangeCapacity(e, platformName)}
          />
        ))}
        <FormSubmitButton />
      </form>
    </Form>
  );
}

interface CapacitiesProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  className?: string;
  style?: SerializedStyles;
}

export function CapacitiesField<T extends FieldValues>({
  form,
  name,
  label,
  onChange,
  className,
  style,
}: CapacitiesProps<T>) {
  style = style || formItemStyle;
  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className={className} css={style}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input onChange={onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

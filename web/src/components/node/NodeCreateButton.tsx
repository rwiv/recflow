import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z, ZodError } from 'zod';
import { Button } from '@/components/ui/button.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { DialogClose } from '@radix-ui/react-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Input } from '@/components/ui/input.tsx';
import { NODE_GROUPS_QUERY_KEY, NODES_QUERY_KEY } from '@/common/constants.ts';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { nodeAppend, NodeGroupDto } from '@/client/node.schema.ts';
import { createNode, fetchNodeGroups } from '@/client/node.client.ts';

const FormSchema = nodeAppend.extend({
  typeName: z.string().nonempty(),
  weight: z.string().nonempty(),
  totalCapacity: z.string().nonempty(),
});

export function NodeCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { data: nodeGroups } = useQuery({
    queryKey: [NODE_GROUPS_QUERY_KEY],
    queryFn: fetchNodeGroups,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Node</DialogTitle>
          <DialogDescription>Click save when you're done.</DialogDescription>
        </DialogHeader>
        {nodeGroups && <CreateForm nodeGroups={nodeGroups} cb={() => closeBtnRef.current?.click()} />}
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  );
}

export function CreateForm({ nodeGroups, cb }: { nodeGroups: NodeGroupDto[]; cb: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      endpoint: '',
      weight: '',
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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const res = await createNode(nodeAppend.parse(data));
      console.log(res);
    } catch (e) {
      if (e instanceof ZodError) {
        for (const err of e.errors) {
          const path = z.enum(FormSchema.keyof()._def.values).parse(err.path.toString());
          form.setError(path, { message: err.message });
        }
        return;
      }
    }
    await queryClient.invalidateQueries({ queryKey: [NODES_QUERY_KEY] });
    cb();
  }

  const onChangeCapacity = (e: ChangeEvent<HTMLInputElement>, platformName: string) => {
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem css={formItemStyle}>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endpoint"
          render={({ field }) => (
            <FormItem css={formItemStyle}>
              <FormLabel>Endpoint</FormLabel>
              <FormControl>
                <Input placeholder="Enter Endpoint" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem css={formItemStyle}>
              <FormLabel>Weight</FormLabel>
              <FormControl>
                <Input placeholder="Enter Weight" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="totalCapacity"
          render={({ field }) => (
            <FormItem css={formItemStyle}>
              <FormLabel>Total Capacity</FormLabel>
              <FormControl>
                <Input placeholder="Enter Total Capacity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem css={formItemStyle}>
              <FormLabel>Group</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {nodeGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="typeName"
          render={({ field }) => (
            <FormItem css={formItemStyle}>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="worker">WORKER</SelectItem>
                  <SelectItem value="argo">ARGO</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacities"
          render={() => (
            <FormItem css={formItemStyle}>
              <FormLabel>Chzzk Capacity</FormLabel>
              <FormControl>
                <Input placeholder="Enter Chzzk Capacity" onChange={(e) => onChangeCapacity(e, 'chzzk')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacities"
          render={() => (
            <FormItem css={formItemStyle}>
              <FormLabel>Soop Capacity</FormLabel>
              <FormControl>
                <Input placeholder="Enter Soop Capacity" onChange={(e) => onChangeCapacity(e, 'soop')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacities"
          render={() => (
            <FormItem css={formItemStyle}>
              <FormLabel>Soop Capacity</FormLabel>
              <FormControl>
                <Input placeholder="Enter Twitch Capacity" onChange={(e) => onChangeCapacity(e, 'twitch')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row justify-end mt-5">
          <Button type="submit" className="px-7">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

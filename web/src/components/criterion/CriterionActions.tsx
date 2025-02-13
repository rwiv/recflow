import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { MoreHorizontal } from 'lucide-react';
import { useRef } from 'react';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { NodeDto } from '@/client/node.schema.ts';
import { deleteNode } from '@/client/node.client.ts';
import { NODES_QUERY_KEY } from '@/common/constants.ts';

export function CriterionActions({ node }: { node: NodeDto }) {
  const queryClient = useQueryClient();
  const deleteRef = useRef<HTMLButtonElement>(null);

  const onDelete = async () => {
    await deleteNode(node.id);
    await queryClient.invalidateQueries({ queryKey: [NODES_QUERY_KEY] });
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => deleteRef.current?.click()}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DefaultAlertDialog onAction={onDelete} triggerRef={deleteRef} />
    </div>
  );
}

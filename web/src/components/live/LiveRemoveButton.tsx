import { Table } from '@tanstack/react-table';
import { LiveDto } from '@/client/live.types.ts';
import { useQueryClient } from '@tanstack/react-query';
import { deleteLive } from '@/client/live.client.ts';
import { RefObject, useRef, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { LIVES_QUERY_KEY } from '@/common/constants.ts';
import { ExitCmd } from '@/client/common.schema.ts';
import {
  AlertDialog as AlertDialogContainer,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";

export function LiveRemoveButton({ table }: { table: Table<LiveDto> }) {
  const queryClient = useQueryClient();
  const deleteRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const finishRef = useRef<HTMLButtonElement>(null);

  const getSelectedItems = () => table.getFilteredSelectedRowModel().rows.map((it) => it.original);

  const remove = async (cmd: ExitCmd, isPurge: boolean) => {
    table.toggleAllPageRowsSelected(false);
    for (const live of getSelectedItems()) {
      try {
        await deleteLive(live.id, cmd, isPurge);
      } catch (e) {
        console.error(e);
      }
    }
    await queryClient.invalidateQueries({ queryKey: [LIVES_QUERY_KEY] });
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {table.getRowModel().rows && (
            <Button variant="secondary" disabled={getSelectedItems().length === 0}>
              Remove
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Commands</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => deleteRef.current?.click()}>Only Data</DropdownMenuItem>
          <DropdownMenuItem onClick={() => finishRef.current?.click()}>Early Finish</DropdownMenuItem>
          <DropdownMenuItem onClick={() => cancelRef.current?.click()}>Erase Files ⚠️</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog onClick={(isPurge) => remove('delete', isPurge)} triggerRef={deleteRef} />
      <AlertDialog onClick={(isPurge) => remove('finish', isPurge)} triggerRef={finishRef} />
      <AlertDialog onClick={(isPurge) => remove('cancel', isPurge)} triggerRef={cancelRef} />
    </div>
  );
}

interface AlertDialogProps {
  onClick: (isPurge: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement>;
}

export function AlertDialog({ onClick, triggerRef }: AlertDialogProps) {
  const cancelText = 'Cancel';
  const actionText = 'Remove';
  const title = 'Are you absolutely sure?';
  const description = 'This action cannot be undone. This will permanently delete data.';

  const [isPurge, setIsPurge] = useState(false);

  return (
    <AlertDialogContainer>
      <AlertDialogTrigger asChild>
        <button ref={triggerRef} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 mt-1 mb-1.5">
          <Switch id="isPurge" checked={isPurge} onCheckedChange={() => setIsPurge((prev) => !prev)}/>
          <Label htmlFor="isPurge">Whether to Purge the channel</Label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={() => onClick(isPurge)}>{actionText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogContainer>
  );
}

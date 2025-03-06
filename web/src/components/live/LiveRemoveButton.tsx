import { Table } from '@tanstack/react-table';
import { LiveDto } from '@/client/live/live.types.ts';
import { useQueryClient } from '@tanstack/react-query';
import { deleteLive } from '@/client/live/live.client.ts';
import { RefObject, useRef, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { LIVES_QUERY_KEY } from '@/common/constants.ts';
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
import { Switch } from '@/components/ui/switch.tsx';
import { Label } from '@/components/ui/label.tsx';
import { ExitCmd } from '@/client/common/common.schema.ts';

interface LiveRemoveButtonProps {
  table: Table<LiveDto>;
}

export function LiveRemoveButton({ table }: LiveRemoveButtonProps) {
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

  const isDisabledButton = () => {
    const selected = getSelectedItems();
    if (selected.length === 0) {
      return true;
    }

    const isDisabledLive = selected[0].isDisabled;
    for (const live of selected) {
      if (live.isDisabled !== isDisabledLive) {
        return true;
      }
    }

    return false;
  };

  const isDisabledLives = () => {
    const selected = getSelectedItems();
    if (selected.length === 0) {
      return false;
    }
    for (const live of selected) {
      if (live.isDisabled) {
        return true;
      }
    }
    return false;
  };
  const isDisabled = isDisabledLives();

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {table.getRowModel().rows && (
            <Button variant="secondary" disabled={isDisabledButton()}>
              Remove
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Commands</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => deleteRef.current?.click()}>Delete Data</DropdownMenuItem>
          <DropdownMenuItem onClick={() => finishRef.current?.click()}>Early Finish</DropdownMenuItem>
          <DropdownMenuItem onClick={() => cancelRef.current?.click()}>Erase Files ⚠️</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        onAction={(isPurge) => remove('delete', isPurge)}
        triggerRef={deleteRef}
        isDisabledLives={isDisabled}
      />
      <AlertDialog
        onAction={(isPurge) => remove('finish', isPurge)}
        triggerRef={finishRef}
        isDisabledLives={isDisabled}
      />
      <AlertDialog
        onAction={(isPurge) => remove('cancel', isPurge)}
        triggerRef={cancelRef}
        isDisabledLives={isDisabled}
      />
    </div>
  );
}

interface AlertDialogProps {
  onAction: (isPurge: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement>;
  isDisabledLives: boolean;
}

export function AlertDialog({ onAction, triggerRef, isDisabledLives }: AlertDialogProps) {
  return (
    <AlertDialogContainer>
      <AlertDialogTrigger asChild>
        <button ref={triggerRef} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <DialogContent onAction={onAction} isDisabledLives={isDisabledLives} />
      </AlertDialogContent>
    </AlertDialogContainer>
  );
}

interface DialogContentProps {
  onAction: (isPurge: boolean) => void;
  isDisabledLives: boolean;
}

// You can initialize the isPurge state every time by extracting the corresponding component separately and dynamically loading it.
function DialogContent({ onAction, isDisabledLives }: DialogContentProps) {
  const cancelText = 'Cancel';
  const actionText = 'Remove';
  const title = 'Are you absolutely sure?';
  const description = 'This action cannot be undone. This will permanently delete data.';

  const [isPurge, setIsPurge] = useState(isDisabledLives);
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <div className="flex items-center space-x-2 mt-1 mb-1.5">
        <Switch
          id="isPurge"
          disabled={isDisabledLives}
          checked={isPurge}
          onCheckedChange={() => setIsPurge((prev) => !prev)}
        />
        <Label htmlFor="isPurge">Whether to Purge the channel</Label>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>{cancelText}</AlertDialogCancel>
        <AlertDialogAction onClick={() => onAction(isPurge)}>{actionText}</AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

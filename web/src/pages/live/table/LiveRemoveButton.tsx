import { Table } from '@tanstack/react-table';
import { LiveDto } from '@entities/live/api/live.schema.ts';
import { useQueryClient } from '@tanstack/react-query';
import { deleteLive } from '@entities/live/api/live.client.ts';
import { RefObject, useRef, useState } from 'react';
import { Button } from '@shared/ui/cn/button.tsx';
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
} from '@shared/ui/cn/alert-dialog.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/cn/dropdown-menu.tsx';
import { Switch } from '@shared/ui/cn/switch.tsx';
import { Label } from '@shared/ui/cn/label.tsx';
import { css, SerializedStyles } from '@emotion/react';
import { ExitCmd } from '@entities/live/model/live_request.shema.ts';
import { LIVES_QUERY_KEY } from '@pages/live/config/constants.ts';

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
        fontStyle={css({ color: 'red' })}
      />
    </div>
  );
}

interface AlertDialogProps {
  onAction: (isPurge: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement>;
  isDisabledLives: boolean;
  fontStyle?: SerializedStyles;
}

export function AlertDialog({ onAction, triggerRef, isDisabledLives, fontStyle }: AlertDialogProps) {
  return (
    <AlertDialogContainer>
      <AlertDialogTrigger asChild>
        <button ref={triggerRef} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <DialogContent onAction={onAction} isDisabledLives={isDisabledLives} fontStyle={fontStyle} />
      </AlertDialogContent>
    </AlertDialogContainer>
  );
}

interface DialogContentProps {
  onAction: (isPurge: boolean) => void;
  isDisabledLives: boolean;
  titleStyle?: SerializedStyles;
  descriptionStyle?: SerializedStyles;
  fontStyle?: SerializedStyles;
}

// You can initialize the isPurge state every time by extracting the corresponding component separately and dynamically loading it.
function DialogContent({ onAction, isDisabledLives, fontStyle }: DialogContentProps) {
  const cancelText = 'Cancel';
  const actionText = 'Remove';
  const title = 'Are you absolutely sure?';
  const description = 'This action cannot be undone. This will permanently delete data.';

  const [isPurge, setIsPurge] = useState(isDisabledLives);
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle css={fontStyle}>{title}</AlertDialogTitle>
        <AlertDialogDescription css={fontStyle}>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <div className="flex items-center space-x-2 mt-1 mb-1.5">
        <Switch
          id="isPurge"
          disabled={isDisabledLives}
          checked={isPurge}
          onCheckedChange={() => setIsPurge((prev) => !prev)}
        />
        <Label htmlFor="isPurge" css={fontStyle}>
          Whether to Purge the channel
        </Label>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>{cancelText}</AlertDialogCancel>
        <AlertDialogAction onClick={() => onAction(isPurge)}>{actionText}</AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

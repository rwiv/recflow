import { Table } from '@tanstack/react-table';
import { ExitCmd, LiveRecord } from '@/client/types.ts';
import { useQueryClient } from '@tanstack/react-query';
import { deleteLive } from '@/client/client.ts';
import { CreateForm } from '@/components/live/cmdtools/CreateForm.tsx';
import { ReactNode, useRef } from 'react';
import { AlertDialog } from '@/components/common/ui/AlertDialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { DialogClose } from '@radix-ui/react-dialog';

export function CommandTools({ table }: { table: Table<LiveRecord> }) {
  const queryClient = useQueryClient();

  const remove = async (cmd: ExitCmd) => {
    const checked = table.getFilteredSelectedRowModel().rows.map((it) => it.original);
    await Promise.all(checked.map((live) => deleteLive(live.channelId, live.type, cmd)));
    table.toggleAllPageRowsSelected(false);
    await queryClient.invalidateQueries({ queryKey: ['lives'] });
  };

  return (
    <div className="flex gap-1.5 mx-5">
      <CreateButton />
      <ExitButton onClick={() => remove('delete')}>Delete</ExitButton>
      <ExitButton onClick={() => remove('cancel')}>Cancel</ExitButton>
      <ExitButton onClick={() => remove('finish')}>Finish</ExitButton>
    </div>
  );
}

export function CreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Live</DialogTitle>
          <DialogDescription>Click save when you're done.</DialogDescription>
        </DialogHeader>
        <CreateForm cb={() => closeBtnRef?.current?.click()} />
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  );
}

function ExitButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <AlertDialog
      title="Are you absolutely sure?"
      description={'This action cannot be undone. This will permanently delete data.'}
      onAction={onClick}
    >
      <Button variant="secondary">{children}</Button>
    </AlertDialog>
  );
}

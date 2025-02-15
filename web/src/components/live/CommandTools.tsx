import { Table } from '@tanstack/react-table';
import { LiveDto } from '@/client/live.types.ts';
import { useQueryClient } from '@tanstack/react-query';
import { deleteLive } from '@/client/live.client.ts';
import { LiveCreateButton } from '@/components/live/LiveCreateButton.tsx';
import { ReactNode } from 'react';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { LIVES_QUERY_KEY } from '@/common/constants.ts';
import { ExitCmd } from '@/client/common.schema.ts';

export function CommandTools({ table }: { table: Table<LiveDto> }) {
  const queryClient = useQueryClient();

  const remove = async (cmd: ExitCmd) => {
    const checked = table.getFilteredSelectedRowModel().rows.map((it) => it.original);
    await Promise.all(checked.map((live) => deleteLive(live.id, cmd)));
    table.toggleAllPageRowsSelected(false);
    await queryClient.invalidateQueries({ queryKey: [LIVES_QUERY_KEY] });
  };

  return (
    <div className="flex gap-1.5 mx-5">
      <LiveCreateButton />
      <ExitButton onClick={() => remove('delete')}>Delete</ExitButton>
      <ExitButton onClick={() => remove('cancel')}>Cancel</ExitButton>
      <ExitButton onClick={() => remove('finish')}>Finish</ExitButton>
    </div>
  );
}

function ExitButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <DefaultAlertDialog onAction={onClick}>
      <Button variant="secondary">{children}</Button>
    </DefaultAlertDialog>
  );
}

import { TableContent } from '@/shared/ui/table/TableContent.tsx';
import { ColumnSelector } from '@/shared/ui/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/shared/ui/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/shared/ui/table/PageNavigation.tsx';
import { LiveDto } from '@/pages/live/api/live.schema.ts';
import { liveColumns } from '@/pages/live/ui/table/liveColumns.tsx';
import { LiveRemoveButton } from '@/pages/live/ui/table/LiveRemoveButton.tsx';
import { FilterInput } from '@/shared/ui/table/FilterInput.tsx';
import { LiveCreateButton } from '@/pages/live/ui/table/LiveCreateButton.tsx';
import { Switch } from '@/shared/ui/cn/switch.tsx';
import { Label } from '@/shared/ui/cn/label.tsx';
import { Dispatch, SetStateAction } from 'react';
import { useTable } from '@/shared/model/useTable.ts';

interface LiveTableProps {
  lives: LiveDto[];
  withDisabled: boolean;
  setWithDisabled: Dispatch<SetStateAction<boolean>>;
}

export function LiveTable({ lives, withDisabled, setWithDisabled }: LiveTableProps) {
  const table = useTable(lives, liveColumns, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex">
          <FilterInput table={table} columnId={'title'} placeholder="Filter title..." />
          <div className="flex gap-1.5 mx-5">
            <LiveCreateButton />
            <LiveRemoveButton table={table} />
            <div className="flex items-center space-x-2 w-40 ml-3 mt-0.5">
              <Switch
                id="withDisabled"
                checked={withDisabled}
                onCheckedChange={() => setWithDisabled((prev) => !prev)}
              />
              <Label htmlFor="withDisabled">Include Disabled</Label>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <ColumnSelector table={table} />
        </div>
      </div>
      <div className="rounded-md border">
        <TableContent table={table} columnLength={liveColumns.length} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table} />
        <PageNavigation table={table} />
      </div>
    </div>
  );
}

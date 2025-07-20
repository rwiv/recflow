import { TableContent } from '@/components/common/table/TableContent.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { LiveDto } from '@/client/live/live.schema.ts';
import { liveColumns } from '@/components/live/liveColumns.tsx';
import { LiveRemoveButton } from '@/components/live/LiveRemoveButton.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { LiveCreateButton } from '@/components/live/LiveCreateButton.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Dispatch, SetStateAction } from 'react';

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

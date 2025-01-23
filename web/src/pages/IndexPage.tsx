import { css } from '@emotion/react';
import { Button } from '@/components/ui/button.tsx';
import { DataTable } from '@/components/table/DataTable.tsx';

const style = css`
  color: hotpink;
`;

export function IndexPage() {
  return (
    <div>
      <div className="m-10">
        <DataTable />
      </div>
      <div className="m-3" css={style}>
        hello
      </div>
      <Button>Click me</Button>
    </div>
  );
}

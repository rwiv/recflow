import { LiveTable } from '@/components/live/LiveTable.tsx';
import { LiveDto } from '@/client/live/live.types.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockLive, mockNode } from '@/client/misc/mocks.ts';

const lives = Array.from({ length: 10 }).map(mockLive);
const nodes = Array.from({ length: 10 }).map(mockNode);

export function TestPage() {
  return <div>{lives && nodes && <TableContent lives={lives} />}</div>;
}

interface TableContentProps {
  lives: LiveDto[];
}

function TableContent({ lives }: TableContentProps) {
  return (
    <Tabs defaultValue="lives" className="mx-10 my-3">
      <TabsList className="my-3">
        <TabsTrigger value="lives">Lives</TabsTrigger>
        <TabsTrigger value="channels">Channels</TabsTrigger>
        <TabsTrigger value="nodes">Nodes</TabsTrigger>
      </TabsList>
      <TabsContent value="lives">
        <div>
          <LiveTable data={lives} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

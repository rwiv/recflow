import { LiveTable } from '@/components/live/LiveTable.tsx';
import { LiveRecord } from '@/client/live.types.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeTable } from '@/components/node/NodeTable.tsx';
import { mockLiveRecord, mockNode } from '@/client/mocks.ts';
import { NodeRecord } from '@/client/node.types.ts';

const lives = Array.from({ length: 10 }).map(mockLiveRecord);
const nodes = Array.from({ length: 10 }).map(mockNode);

export function TestPage() {
  return <div>{lives && nodes && <TableContent lives={lives} nodes={nodes} />}</div>;
}

interface TableContentProps {
  lives: LiveRecord[];
  nodes: NodeRecord[];
}

function TableContent({ lives, nodes }: TableContentProps) {
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
      <TabsContent value="nodes">
        <div>
          <NodeTable data={nodes} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

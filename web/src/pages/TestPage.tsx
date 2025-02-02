import { LiveTable } from '@/components/table/live/LiveTable.tsx';
import { LiveRecord, NodeRecord } from '@/client/types.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookTable } from '@/components/table/webhook/WebhookTable.tsx';
import { mockChannel, mockLiveRecord, mockNode } from '@/client/mocks.ts';
import { ChannelTable } from '@/components/table/channel/ChannelTable.tsx';

const lives = Array.from({ length: 10 }).map(mockLiveRecord);
const nodes = Array.from({ length: 10 }).map(mockNode);
const channels = Array.from({ length: 10 }).map(mockChannel);

export function TestPage() {
  return <div>{lives && nodes && <TableContent lives={lives} nodes={nodes} />}</div>;
}

interface TableContentProps {
  lives: LiveRecord[];
  nodes: NodeRecord[];
}

function TableContent({ lives, nodes }: TableContentProps) {
  return (
    <Tabs defaultValue="channels" className="mx-10 my-3">
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
      <TabsContent value="channels">
        <ChannelTable channels={channels} />
      </TabsContent>
      <TabsContent value="nodes">
        <div>
          <WebhookTable data={nodes} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

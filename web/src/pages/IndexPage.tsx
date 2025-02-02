import { LiveTable } from '@/components/table/live/LiveTable.tsx';
import { LiveRecord, NodeRecord } from '@/client/types.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookTable } from '@/components/table/webhook/WebhookTable.tsx';
import { fetchLives, fetchNodes } from '@/client/client.ts';
import { useQuery } from '@tanstack/react-query';

export function IndexPage() {
  const { data: lives } = useQuery<LiveRecord[]>({
    queryKey: ['lives'],
    queryFn: fetchLives,
  });
  const { data: nodes } = useQuery<NodeRecord[]>({
    queryKey: ['nodes'],
    queryFn: fetchNodes,
  });

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
        <TabsTrigger value="nodes">Nodes</TabsTrigger>
      </TabsList>
      <TabsContent value="lives">
        <div>
          <LiveTable data={lives} />
        </div>
      </TabsContent>
      <TabsContent value="nodes">
        <div>
          <WebhookTable data={nodes} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

import { TrackedTable } from '@/components/table/tracked/TrackedTable.tsx';
import { TrackedRecord, WebhookRecord } from '@/client/types.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookTable } from '@/components/table/webhook/WebhookTable.tsx';
import { fetchLives, fetchWebhooks } from '@/client/client.ts';
import { useQuery } from '@tanstack/react-query';

export function IndexPage() {
  const { data: lives } = useQuery<TrackedRecord[]>({
    queryKey: ['lives'],
    queryFn: fetchLives,
  });
  const { data: webhooks } = useQuery<WebhookRecord[]>({
    queryKey: ['webhooks'],
    queryFn: fetchWebhooks,
  });

  return <div>{lives && webhooks && <TableContent lives={lives} webhooks={webhooks} />}</div>;
}

interface TableContentProps {
  lives: TrackedRecord[];
  webhooks: WebhookRecord[];
}

function TableContent({ lives, webhooks }: TableContentProps) {
  return (
    <Tabs defaultValue="lives" className="mx-10 my-3">
      <TabsList className="my-3">
        <TabsTrigger value="lives">Lives</TabsTrigger>
        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
      </TabsList>
      <TabsContent value="lives">
        <div>
          <TrackedTable data={lives} />
        </div>
      </TabsContent>
      <TabsContent value="webhooks">
        <div>
          <WebhookTable data={webhooks} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

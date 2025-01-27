import { LiveTable } from '@/components/table/live/LiveTable.tsx';
import { LiveRecord, WebhookRecord } from '@/client/types.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookTable } from '@/components/table/webhook/WebhookTable.tsx';
import { mockLiveRecord, mockWebhook } from '@/client/mocks.ts';

const lives = Array.from({ length: 10 }).map(mockLiveRecord);
const webhooks = Array.from({ length: 10 }).map(mockWebhook);

export function TestPage() {
  return <div>{lives && webhooks && <TableContent lives={lives} webhooks={webhooks} />}</div>;
}

interface TableContentProps {
  lives: LiveRecord[];
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
          <LiveTable data={lives} />
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

import { TrackedTable } from '@/components/table/tracked/TrackedTable.tsx';
import { TrackedRecord, WebhookRecord } from '@/client/types.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookTable } from '@/components/table/webhook/WebhookTable.tsx';
import { mockTrackedRecord, mockWebhook } from '@/client/mocks.ts';

const lives = Array.from({ length: 10 }).map(mockTrackedRecord);
const webhooks = Array.from({ length: 10 }).map(mockWebhook);

export function TestPage() {
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

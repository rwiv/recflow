import { css } from '@emotion/react';
import { Button } from '@/components/ui/button.tsx';
import { DataTable } from '@/components/table/DataTable.tsx';
import { LiveInfo, WebhookState } from '@/components/client/types.ts';
import { mockLiveInfo, mockWebhookState } from '@/components/client/mocks.ts';
import {
  assignedWebhookNameCid,
  liveColumns,
} from '@/components/table/live_columns.tsx';
import {
  webhookColumns,
  webhookTypeCid,
} from '@/components/table/webhook_columns.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const style = css`
  color: hotpink;
`;

const infos: LiveInfo[] = Array.from({ length: 15 }, () => mockLiveInfo());
const webhooks: WebhookState[] = Array.from({ length: 15 }, () =>
  mockWebhookState(),
);

export function IndexPage() {
  return (
    <div>
      <Content />
      <div className="m-3" css={style}>
        hello
      </div>
      <Button>Click me</Button>
    </div>
  );
}

function Content() {
  return (
    <Tabs defaultValue="lives" className="mx-10 my-3">
      <TabsList className="my-3">
        <TabsTrigger value="lives">Lives</TabsTrigger>
        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
      </TabsList>
      <TabsContent value="lives">
        <div>
          <DataTable
            data={infos}
            columns={liveColumns}
            filterCid={assignedWebhookNameCid}
            filterPlaceholder="Filter webhooks..."
          />
        </div>
      </TabsContent>
      <TabsContent value="webhooks">
        <div>
          <DataTable
            data={webhooks}
            columns={webhookColumns}
            filterCid={webhookTypeCid}
            filterPlaceholder="Filter webhooks..."
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

import { css } from '@emotion/react';
import { Button } from '@/components/ui/button.tsx';
import { LiveTable } from '@/components/table/LiveTable.tsx';
import { LiveInfo, WebhookState } from '@/components/client/types.ts';
import { mockLiveInfo, mockWebhookState } from '@/components/client/mocks.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookTable } from '@/components/table/WebhookTable.tsx';

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
          <LiveTable data={infos} />
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

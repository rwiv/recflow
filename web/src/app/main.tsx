import './globals.css';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouteObject } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configs } from '@shared/config/configs.ts';
import { Toaster } from '@shared/ui/cn/toaster.tsx';
import { LivePage } from '@pages/live/ui/LivePage.tsx';
import { TestPage } from '@pages/test/ui/TestPage.tsx';
import { ChannelPage } from '@pages/channel/channel/ui/ChanenelPage.tsx';
import { NodePage } from '@pages/node/node/ui/NodePage.tsx';
import { CriterionPage } from '@pages/criterion/ui/CriterionPage.tsx';
import { GradePage } from '@pages/channel/grade/ui/GradePage.tsx';
import { TagPage } from '@pages/channel/tag/ui/TagPage.tsx';
import { NodeGroupPage } from '@pages/node/group/ui/NodeGroupPage.tsx';

const routes: RouteObject[] = [
  { path: '/', element: <LivePage /> },
  { path: '/channels', element: <ChannelPage /> },
  { path: '/tags', element: <TagPage /> },
  { path: '/grades', element: <GradePage /> },
  { path: '/nodes', element: <NodePage /> },
  { path: '/node-groups', element: <NodeGroupPage /> },
  { path: '/criteria', element: <CriterionPage /> },
];

if (configs.isDev) {
  routes.push({ path: '/test', element: <TestPage /> });
}

const router = createHashRouter(routes);
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Toaster />
  </QueryClientProvider>,
);

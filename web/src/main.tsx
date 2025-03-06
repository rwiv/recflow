import './globals.css';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouteObject } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import { configs } from '@/common/configs.ts';
import { LivePage } from '@/pages/LivePage.tsx';
import { TestPage } from '@/pages/TestPage.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChannelPage } from '@/pages/ChanenelsPage.tsx';
import { NodePage } from '@/pages/NodePage.tsx';
import { CriterionPage } from '@/pages/CriterionPage.tsx';
import { Toaster } from '@/components/ui/toaster.tsx';
import { PriorityPage } from '@/pages/PriorityPage.tsx';

const routes: RouteObject[] = [
  { path: '/', element: <LivePage /> },
  { path: '/channels', element: <ChannelPage /> },
  { path: '/priorities', element: <PriorityPage /> },
  { path: '/nodes', element: <NodePage /> },
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

import './globals.css';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouteObject } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import { configs } from '@/common/configs.ts';
import { LivesPage } from '@/pages/LivesPage.tsx';
import { TestPage } from '@/pages/TestPage.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChannelsPage } from '@/pages/ChanenelsPage.tsx';
import { NodesPage } from '@/pages/NodesPage.tsx';
import { CriterionPage } from '@/pages/CriterionPage.tsx';
import { Toaster } from '@/components/ui/toaster.tsx';

const routes: RouteObject[] = [
  { path: '/', element: <LivesPage /> },
  { path: '/channels', element: <ChannelsPage /> },
  { path: '/nodes', element: <NodesPage /> },
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

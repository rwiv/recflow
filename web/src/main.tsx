import './globals.css';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouteObject } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import { configs } from '@/common/configs.ts';
import { IndexPage } from '@/pages/IndexPage.tsx';
import { TestPage } from '@/pages/TestPage.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const routes: RouteObject[] = [{ path: '/', element: <IndexPage /> }];

if (configs.isDev) {
  routes.push({ path: '/test', element: <TestPage /> });
}

const router = createHashRouter(routes);
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);

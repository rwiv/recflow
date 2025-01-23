import './globals.css';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouteObject } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import { consts } from '@/configures/consts.ts';
import { IndexPage } from '@/pages/IndexPage.tsx';
import { TestPage } from '@/pages/TestPage.tsx';

const routes: RouteObject[] = [{ path: '/', element: <IndexPage /> }];

if (consts.isDev) {
  routes.push({ path: '/test', element: <TestPage /> });
}

const router = createHashRouter(routes);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
);

import { lazy } from "react";

const Campaigns = lazy(() => import('../views/Campaigns'));
const Clients = lazy(() => import('../views/Clients'));
const Cobradores = lazy(() => import('../views/Cobradores'));
const Home = lazy(() => import('../views/Home'));
const Login = lazy(() => import('../views/Login'));
const Users = lazy(() => import('../views/Users'));
const Teams = lazy(() => import('../views/Teams'));

const routes = [
  {
    key: 'login',
    path: '/login',
    element: <Login />
  },
  {
    key: 'home',
    path: '/ventas',
    element: <Home />
  },
  {
    key: 'clientes',
    path: '/clientes',
    element: <Clients />
  },
  {
    key: 'cobradores',
    path: '/cobradores',
    element: <Cobradores />
  },
  {
    key: '/campanas',
    path: '/campanas',
    element: <Campaigns />
  },
  {
    key: 'users',
    path: '/usuarios',
    element: <Users />
  },
  {
    key: 'teams',
    path: '/equipos',
    element: <Teams />
  }
];

export default routes;
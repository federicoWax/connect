import { lazy } from "react";
import { RouteProps } from "react-router-dom";
import SeeExcel from "../views/Excels/seeExcel.tsx";

const Campaigns = lazy(() => import('../views/Campaigns'));
const Clients = lazy(() => import('../views/Clients'));
const Cobradores = lazy(() => import('../views/Cobradores'));
const Home = lazy(() => import('../views/Home'));
const Login = lazy(() => import('../views/Login'));
const Users = lazy(() => import('../views/Users'));
const Teams = lazy(() => import('../views/Teams'));
const Branchs = lazy(() => import('../views/Branchs'));
const Excels = lazy(() => import('../views/Excels'));
const Assists = lazy(() => import('../views/Assists'));
const PaymentMethods = lazy(() => import('../views/PaymentMethods'));


type RoutePropsKey = RouteProps & {
  key: string;
};

export const routes: RoutePropsKey[] = [
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
  },
  {
    key: 'branchs',
    path: '/sucursales',
    element: <Branchs />
  },
  {
    key: 'assists',
    path: '/asistencias',
    element: <Assists />
  },
  {
    key: 'exceles',
    path: '/exceles',
    element: <Excels />
  },
  {
    key: 'exceles/:id',
    path: '/exceles/:id',
    element: <SeeExcel />
  },
  {
    key: 'paymentMethods',
    path: '/metodos-de-pago',
    element: <PaymentMethods />
  },
  {
    key: '*',
    path: '*',
    element: <div>404 not found</div>
  }
];

export default routes;
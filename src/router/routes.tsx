import Campaigns from '../views/Campaigns';
import Clients from '../views/Clients';
import Cobradores from '../views/Cobradores';
import Home from '../views/Home';
import Login from '../views/Login';
import Users from '../views/Users';

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
  }
];

export default routes;
import Home from '../views/Home';
import Login from '../views/Login';
import Users from '../views/Users';

export default [
  {
    key: 'login',
    path: '/login',
    element: <Login />,
  },
  {
    key: 'home',
    path: '/ventas',
    element: <Home />,
  },
  {
    key: 'users',
    path: '/usuarios',
    element: <Users />,
  }
];
import { Layout } from 'antd';
import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FullLoader from '../FullLoader';
import MenuComponent from '../Menu';

const RoterChecker = () => {
  const { user, userFirestore } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userRoutes, setUserRoutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(userFirestore) {
      if(userFirestore.role === "Administrador") {
        setUserRoutes(userFirestore.permissions.map(p => p.route));
      } else {
        setUserRoutes(userFirestore.permissions.filter(p => p.write || p.read).map(p => p.route));
      }

      setLoading(false);
    }
  }, [userFirestore]);

  useEffect(() => {
    if(!user && location.pathname !== "/login") {
      navigate('/login');   
      return;
    }

    const inPrivateRoute = !userRoutes.some(r => location.pathname.includes(r))

    if(!loading && user && (location.pathname === '/login' || location.pathname === '/' || inPrivateRoute)) {
      navigate('/ventas');
    }
  }, [user, location, navigate, loading, userRoutes]);

  return (
    <Layout style={{minHeight: "100vh"}}>
      { user && <MenuComponent /> }
      <Layout.Content style={{padding: 20}}>
        <Suspense fallback={<FullLoader />}>
          <Outlet />
        </Suspense>
      </Layout.Content>
    </Layout>
  )
}

export default RoterChecker;
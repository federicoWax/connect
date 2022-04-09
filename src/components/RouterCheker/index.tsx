import { Layout } from 'antd';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MenuComponent from '../Menu';

const RoterChecker = () => {
  const { user, userFirestore } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [adminRoutes] = useState<string[]>([
    "/usuarios",
    "/cobradores",
    "/clientes",
  ]);

  useEffect(() => {
    if(!user && location.pathname !== "/login") {
      navigate('/login');   
      return;
    }

    const inPrivateRoute = adminRoutes.includes(location.pathname) && userFirestore && userFirestore.role !== "Administrador";

    if(user && (location.pathname === '/login' || location.pathname === '/' || inPrivateRoute)) {
      navigate('/ventas');
    }
  }, [user, userFirestore, location, navigate, adminRoutes]);
  
  return (
    <Layout style={{minHeight: "100vh"}}>
      { user && <MenuComponent /> }
      <Layout.Content style={{padding: 20}}>
        <Outlet />
      </Layout.Content>
    </Layout>
  )
}

export default RoterChecker;
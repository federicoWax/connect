import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserOutlined, DollarOutlined, UnorderedListOutlined, ProfileOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { MdAccountBox, MdGroup, MdLocationCity } from 'react-icons/md';
import { BiDoorOpen } from 'react-icons/bi';
import { Layout, Menu } from "antd";
import { auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

const { Sider } = Layout;
const { SubMenu } = Menu;

const MenuComponent = () => {
  const [collapsed, setCollapsed] = useState<boolean | undefined>(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { userFirestore } = useAuth();

  const onCollapse = (collapsed: boolean | undefined) => setCollapsed(collapsed);
  
  const signOut = async () => {
    await auth.signOut();
  }

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div style={{color: "white", padding: 5}}>
        <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{userFirestore?.email}</div>
        <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{userFirestore?.role}</div>
      </div>
      <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
        <Menu.Item onClick={() => navigate("/ventas")} key="/ventas" icon={<DollarOutlined /> }>
          Ventas
        </Menu.Item>
        {
          userFirestore?.role  === "Administrador" && 
          <>
            <Menu.Item onClick={() => navigate("/clientes")} key="/clientes" icon={<MdAccountBox /> }>
              Clientes
            </Menu.Item>
            <Menu.Item onClick={() => navigate("/cobradores")} key="/cobradores" icon={<UnorderedListOutlined />}>
              Cobradores
            </Menu.Item>
            <Menu.Item onClick={() => navigate("/campanas")} key="/campanas" icon={<ProfileOutlined />}>
              Campañas
            </Menu.Item>
            <Menu.Item onClick={() => navigate("/usuarios")} key="/usuarios" icon={<MdGroup /> }>
              Usuarios
            </Menu.Item>
            <Menu.Item onClick={() => navigate("/equipos")} key="/equipos" icon={<AppstoreAddOutlined /> }>
              Equipos
            </Menu.Item>
            <Menu.Item onClick={() => navigate("/sucursales")} key="/sucursales" icon={<MdLocationCity /> }>
              Sucursales
            </Menu.Item>
          </>
        }
        <SubMenu key="sub1" icon={<UserOutlined />} title="Cuenta">
          <Menu.Item key="4" icon={<BiDoorOpen />} onClick={signOut}>Cerrar sesión</Menu.Item>
        </SubMenu>
      </Menu>
    </Sider>
  )
}

export default MenuComponent;
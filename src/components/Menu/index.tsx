import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  UserOutlined, DollarOutlined, UnorderedListOutlined, 
  ProfileOutlined, AppstoreAddOutlined, SettingOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import { MdAccountBox, MdGroup, MdLocationCity } from 'react-icons/md';
import { BiDoorOpen } from 'react-icons/bi';
import { Layout, Menu } from "antd";
import { auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import UserConfigDialog from "./userConfigDialog";
import { getDocById } from "../../services/firebase";
import { Branch } from "../../interfaces";

const { Sider } = Layout;
const { SubMenu } = Menu;

const menuItems = [
  {
    label: "Ventas",
    route: "/ventas",
    icon: <DollarOutlined />,
  },
  {
    label: "Clientes",
    route: "/clientes",
    icon: <MdAccountBox />,
  },
  {
    label: "Cobradores",
    route: "/cobradores",
    icon: <UnorderedListOutlined />
  },
  {
    label: "Campañas",
    route: "/campanas",
    icon: <ProfileOutlined />
  },
  {
    label: "Usuarios",
    route: "/usuarios",
    icon: <MdGroup /> 
  },
  {
    label: "Equipos",
    route: "/equipos",
    icon: <UserOutlined />
  },
  {
    label: "Sucursales",
    route: "/sucursales",
    icon: <MdLocationCity /> 
  },
  {
    label: "Asistencias",
    route: "/asistencias",
    icon: <ScheduleOutlined /> 
  },
];

const MenuComponent = () => {
  const [collapsed, setCollapsed] = useState<boolean | undefined>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [branch, setBranch] = useState<Branch | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { userFirestore } = useAuth();

  useEffect(() => {
    const getBranch = async () => {
      if(userFirestore?.branch) {
        const branchDoc = await getDocById("branchs", userFirestore.branch);
        setBranch({...branchDoc.data(), id: branchDoc.id} as Branch);
      }
    }

    getBranch();
  }, [userFirestore]);

  const onCollapse = (collapsed: boolean | undefined) => setCollapsed(collapsed);
  
  const signOut = async () => await auth.signOut();

  if(!userFirestore) return null;

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div style={{color: "white", padding: 8, textAlign: "center"}}>
        {
          userFirestore.team === "CMG" && <>
            <br />
            <SettingOutlined 
              style={{fontSize: 20, cursor: "pointer"}}
              onClick={() => setOpen(true)}
            />
          </>
        }
        <br />
        <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{userFirestore?.email}</div>
        <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{userFirestore?.role}</div>
        <br />
        <div >{branch?.name}</div>
      </div>
      <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
        {
          menuItems
            .filter(item => userFirestore?.role === "Administrador" || userFirestore.permissions.some(p => p.module === item.label && (p.write || p.read)))
            .map(item => (
              <Menu.Item key={item.route} onClick={() => navigate(item.route)} icon={item.icon}>
                {item.label}
              </Menu.Item>
            ))
        }
        <SubMenu key="sub1" icon={<UserOutlined />} title="Cuenta">
          <Menu.Item key="4" icon={<BiDoorOpen />} onClick={signOut}>Cerrar sesión</Menu.Item>
        </SubMenu>
      </Menu>
      <UserConfigDialog 
        open={open}
        onClose={() => setOpen(false)}
        branch={branch}
      />
    </Sider>
  )
}

export default MenuComponent;
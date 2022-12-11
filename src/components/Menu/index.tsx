import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SettingOutlined } from '@ant-design/icons';
import { Layout, Menu } from "antd";
import { useAuth } from "../../context/AuthContext";
import UserConfigDialog from "./userConfigDialog";
import { getDocById } from "../../services/firebase";
import { Branch } from "../../interfaces";
import menuItems from "./menuItems";

const { Sider } = Layout;

const MenuComponent = () => {
  const [collapsed, setCollapsed] = useState<boolean | undefined>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [branch, setBranch] = useState<Branch | null>(null);
  const location = useLocation();
  const { userFirestore } = useAuth();

  const items = useMemo(() => {
    return menuItems.filter(item => userFirestore?.role === "Administrador" || userFirestore?.permissions.some(p => p.module === item.title && (p.write || p.read)))
  }, [userFirestore])

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
  
  if(!userFirestore) return null;

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div style={{color: "white", padding: 8, textAlign: "center"}}>
        <br />
        <SettingOutlined 
          style={{fontSize: 20, cursor: "pointer"}}
          onClick={() => setOpen(true)}
        />
        <br />
        <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{userFirestore?.email}</div>
        <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{userFirestore?.role}</div>
        <br />
        <div >{branch?.name}</div>
      </div>
      <Menu 
        theme="dark" 
        selectedKeys={[location.pathname]} 
        mode="inline"
        items={items}
      />
      <UserConfigDialog 
        open={open}
        onClose={() => setOpen(false)}
        branch={branch}
      />
    </Sider>
  )
}

export default MenuComponent;
import { Button, Table } from "antd";
import UserDialog from "./userDialog";
import useUsers from "../../hooks/useUsers";
import { useAuth } from "../../context/AuthContext";

const Users = () => {
  const { loading, users, columns, open, user, setOpen, teams, branchs } = useUsers();
  const { userFirestore } = useAuth();

  return (
    <div>
      {
        (userFirestore?.role === "Administrador" || userFirestore?.permissions.some(p => p.module === "Usuarios" && p.write)) && <Button 
          style={{float: "right", marginBottom: 10}} 
          type="primary"
          onClick={() => setOpen(true)}
        >
          Agregar usuario
        </Button>
      }
      <h1>Usuarios</h1>
      <Table 
        style={{overflowX: "auto", backgroundColor: "white"}}
        loading={loading} 
        columns={columns} 
        pagination={false} 
        dataSource={users.map(u => ({...u, key: u.id}))} locale={{emptyText: "Sin usuarios..."}} 
      />
      <UserDialog 
        open={open}
        onClose={() => setOpen(false)}
        propUser={user}
        teams={teams}
        branchs={branchs}
      />
    </div>
  )
}

export default Users;
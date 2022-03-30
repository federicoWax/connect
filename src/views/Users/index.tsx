import { Button, Table } from "antd";
import UserDialog from "./userDialog";
import useUsers from "../../hooks/useUsers";

const Users = () => {
  const { loading, users, columns, open, user, setOpen } = useUsers();

  return (
    <div>
      <Button 
        style={{float: "right", marginBottom: 10}} 
        type="primary"
        onClick={() => setOpen(true)}
      >
        Agregar usuario
      </Button>
      <h1>Usuarios</h1>
      <Table loading={true} columns={columns} pagination={false} dataSource={users.map(u => ({...u, key: u.id}))} locale={{emptyText: "Sin usuarios..."}} />
      <UserDialog 
        open={open}
        onClose={() => setOpen(false)}
        propUser={user}
      />
    </div>
  )
}

export default Users;
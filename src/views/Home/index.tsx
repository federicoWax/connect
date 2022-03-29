import { Button, Table } from "antd";
import HomeDialog from "./homeDialog";
import useHome from "../../hooks/useHome";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { userFirestore } = useAuth();
  const { loadingSales, sales, columns, open, sale, setOpen, users } = useHome();

  return (
    <div>
      {
        ["Administrador", "Vendedor"].includes(userFirestore?.role as string) && <Button 
          style={{float: "right", marginBottom: 10}}
          type="primary"
          onClick={() => setOpen(true)}
        >
          Agregar venta
        </Button>
      }
      <h1>Ventas</h1>
     <Table loading={loadingSales} columns={columns} pagination={false} dataSource={sales.map(s => ({...s, key: s.id}))} locale={{emptyText: "Sin ventas..."}} />
      <HomeDialog 
        open={open}
        onClose={() => setOpen(false)}
        propSale={sale}
      />
    </div>
  )
}

export default Home;
import { Button, Table } from "antd";
import CobradorDialog from "./cobradorDialog";
import useCobrador from "../../hooks/useCobrador";
import { useAuth } from "../../context/AuthContext";

const Cobradores = () => {
  const { loadingCobradores, cobradores, columns, open, cobrador, setOpen } = useCobrador();
  const { userFirestore } = useAuth();

  return (
    <div>
      <h1>Cobradores</h1>
      {
        (userFirestore?.role === "Administrador" || userFirestore?.permissions.some(p => p.module === "Cobradores" && p.write)) && <Button
          style={{ float: "right", marginBottom: 10 }}
          type="primary"
          onClick={() => setOpen(true)}
        >
          Agregar cobrador
        </Button>
      }
      <Table
        id=""
        style={{ overflowX: "auto", backgroundColor: "white" }}
        loading={loadingCobradores}
        columns={columns}
        pagination={false}
        dataSource={cobradores.map(s => ({ ...s, key: s.id }))} locale={{ emptyText: "Sin cobradores..." }}
      />
      <CobradorDialog
        open={open}
        onClose={() => setOpen(false)}
        propColaborador={cobrador}
      />
    </div>
  )
}

export default Cobradores;
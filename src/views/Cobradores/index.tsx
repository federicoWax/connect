import { Button, Table } from "antd";
import CobradorDialog from "./cobradorDialog";
import useCobrador from "../../hooks/useCobrador";

const Cobradores = () => {
  const { loadingCobradores, cobradores, columns, open, cobrador, setOpen } = useCobrador();

  return (
    <div>
      <h1>Cobradores</h1>
      <Button
        style={{ float: "right", marginBottom: 10 }}
        type="primary"
        onClick={() => setOpen(true)}
      >
        Agregar cobrador
      </Button>
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
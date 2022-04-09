import { Button, Input, Table } from "antd";
import useClients from "../../hooks/useClients";
import ClientDialog from "./clientDialog";

const Clients = () => {
  const { loadingClients, clients, columns, open, client, setOpen, cobradores, search, setSearch } = useClients();

  return (
    <div>
      <h1>Clientes</h1>
      <Button
        style={{ float: "right", marginBottom: 10 }}
        type="primary"
        onClick={() => setOpen(true)}
      >
        Agregar cliente
      </Button>
      <Input placeholder="Buscar por ESID o Cliente" value={search} onChange={(e) => setSearch(e.target.value)} />
      <br />
      <br />
      <Table
        style={{ overflowX: "auto", backgroundColor: "white" }}
        loading={loadingClients}
        columns={columns}
        pagination={false}
        dataSource={
          clients
            .filter(c => c.esid?.toString().toLowerCase().includes(search.toLowerCase()) || c.client.toLowerCase().includes(search.toLowerCase()))
            .map(c => ({ ...c, key: c.id }))
        } 
        locale={{ emptyText: "Sin clientes..." }}
      />
      <ClientDialog
        open={open}
        onClose={() => setOpen(false)}
        propClient={client}
        cobradores={cobradores}
      />
    </div>
  )
}

export default Clients;
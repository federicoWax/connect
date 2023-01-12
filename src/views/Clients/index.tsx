import { Button, Col, Input, Row, Select, Table } from "antd";
import { useAuth } from "../../context/AuthContext";
import useClients from "../../hooks/useClients";
import ClientDialog from "./clientDialog";

const { Option } = Select;

const Clients = () => {
  const { loadingClients, clients, columns, open, client, setOpen, cobradores, search, setSearch, onScroll, filter, setFilter, onSearch } = useClients();
  const { userFirestore } = useAuth();
  
  return (
    <div style={{ overflow: "hidden" }}>
      <h1>Clientes</h1>
      {
        (userFirestore?.role === "Administrador" || userFirestore?.permissions.some(p => p.module === "Clientes" && p.write)) && <Row justify="end">
          <Col>
            <Button
              type="primary"
              onClick={() => setOpen(true)}
            >
              Agregar cliente
            </Button>
          </Col>
        </Row>
      }
      <br />
      <Row gutter={10} >
        <Col xs={24} md={2}>
          <Select
            style={{ width: "100%" }}
            value={filter}
            onChange={value => setFilter(value)}
          >
            <Option value="esid">ESID</Option>
            <Option value="client">Cliente</Option>
          </Select>
        </Col>
        <Col xs={24} md={22}>
          <Input.Search
            placeholder={"Buscar por " + filter.toUpperCase()}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={onSearch}
            enterButton
          />
        </Col>
      </Row>
      <br />
      <br />
      <div style={{ maxHeight: "75vh", overflowY: "auto" }} onScroll={onScroll}>
        <Table
          style={{ overflowX: "auto" }}
          loading={loadingClients}
          columns={columns}
          pagination={false}
          dataSource={clients.map(c => ({ ...c, key: c.id }))}
          locale={{ emptyText: "Sin clientes..." }}
        />
      </div>
      <ClientDialog
        open={open}
        onClose={() => setOpen(false)}
        propClient={client}
        cobradores={cobradores}
      />
      <br />
    </div>
  )
}

export default Clients;
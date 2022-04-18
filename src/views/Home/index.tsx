import { Button, Col, Row, Select, Table, DatePicker, message, AutoComplete } from "antd";
import moment from "moment";
import HomeDialog from "./homeDialog";
import useHome from "../../hooks/useHome";
import { useAuth } from "../../context/AuthContext";
import { Autocomplete } from "../../interfaces";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Home = () => {
  const { userFirestore } = useAuth();
  const { loadingUsers, loadingSales, sales, clients, columns, open, sale, setOpen, filter, setFilter, users, cobradores, downloadExcel, campaigns } = useHome();

  const optionsAuotComplete = clients.map((c) => ({value: c.esid?.toString(), label: c.esid + " - " + c.client})) as Autocomplete[];
  const optionsProcessUser = users.filter(u => u.role !== "Vendedor").map((u) => ({value: u.email, label: u.email + " - " + u.name})) as Autocomplete[];

  //Falta estrucutrar la vista en mas componentes
  return (
    <div>
      <h1>Ventas: { sales.length }</h1>
      <Button
        style={{ float: "right", marginBottom: 10 }}
        type="primary"
        onClick={() => setOpen(true)}
      >
        Agregar venta
      </Button>
      <Button type="primary" onClick={downloadExcel}>
        Descargar Reporte
      </Button>
      <br />
      <br />
      <Row gutter={20}>
        <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
          <label>Concluidas / Pendientes</label>
          <Select value={filter.concluded} onChange={value => setFilter({ ...filter, concluded: value })}>
            <Option value={false}>Pendientes</Option>
            <Option value={true}>Concluidas</Option>
          </Select>
        </Col>
        {
          filter.concluded && <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
            <label>Rango de fechas</label>
              <RangePicker  
                value={[filter.startDate, filter.endDate]}
                onChange={(dates) => {
                  const startDate = dates ? dates[0] as moment.Moment : null;
                  const endDate = dates ? dates[1] as moment.Moment : null;

                  if(userFirestore?.role === "Administrador") {
                    setFilter({ ...filter, startDate, endDate });
                    return;
                  }

                  if(!startDate || !endDate) {
                    setFilter({ ...filter, startDate, endDate });
                    return;
                  }

                  startDate.set({ hour: 0, minute: 0, second: 0 });
                  endDate.set({ hour: 23, minute: 59, second: 59 });

                  const diff = endDate.diff(startDate, 'years', true);

                  if(diff > 1) {
                    message.error("No se puede seleccionar un rango mayor a un año");
                    setFilter({ ...filter, startDate: null, endDate: null });
                    return;
                  }

                  setFilter({ ...filter, startDate, endDate });
                }}
                showTime={false}
                placeholder={["Fecha inicio", "Fecha fin"]}
              />
          </Col>
        }
        {
          ["Administrador", "Procesos"].includes(userFirestore?.role as string) && <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
            <label>Vendedores</label>
            <Select 
              loading={loadingUsers} 
              value={filter.userId} 
              onChange={value => setFilter({ ...filter, userId: value })}
              allowClear
            >
            <Option value="">{"Todos los vendedores"}</Option>
            {
              users.map(user => (
                <Option key={user.id} value={user.id}>{user.name + " - " + user.email}</Option>
              )) 
            }
            </Select>
          </Col>
        }
        <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
          <label>Procesos</label>
          <AutoComplete
            allowClear
            value={sale?.processUser}
            options={optionsProcessUser} 
            filterOption={(inputValue, option) =>
              option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
            onSelect={(value: string, obj: Autocomplete | null) => {  
              if(obj) {
                setFilter({...filter, processUser: obj.value }) 
              }
            }}
            placeholder="Buscar usuario proceso"
            onClear={() => setFilter({...filter, processUser: ""})}
          />  
        </Col>
      </Row>
      {
         userFirestore?.role === "Administrador" && <>
          <br />
          <Row gutter={20}>
            <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
              <label>Clientes</label>
              <AutoComplete
                allowClear
                value={filter.esid}
                options={optionsAuotComplete} 
                filterOption={(inputValue, option) =>
                  option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                onSelect={(value: string, obj: Autocomplete | null) => {  
                  if(obj) {
                    setFilter({...filter, esid: obj.value});
                  }
                }}
                placeholder="Buscar ESID"
                onClear={() => setFilter({...filter, esid: ""})}
              />              
            </Col>
          </Row>
        </>
      }
      <br />
      <Table
        id=""
        style={{ overflowX: "auto", backgroundColor: "white" }}
        loading={loadingSales}
        columns={columns}
        pagination={false}
        dataSource={sales.map(s => ({ ...s, key: s.id }))} locale={{ emptyText: "Sin ventas..." }}
      />
      <HomeDialog
        open={open}
        onClose={() => setOpen(false)}
        propSale={sale}
        cobradores={cobradores}
        clients={clients}
        users={users}
        campaigns={campaigns}
      />
    </div>
  )
}

export default Home;
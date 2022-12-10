import { useMemo } from "react";
import { Button, Col, Row, Select, Table, DatePicker, message, AutoComplete, Input } from "antd";
import HomeDialog from "./homeDialog";
import useHome from "../../hooks/useHome";
import { useAuth } from "../../context/AuthContext";
import { Autocomplete } from "../../interfaces";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Home = () => {
  const { userFirestore } = useAuth();
  let { 
    loadingUsers, 
    loadingSales, 
    loadingCampaigns, 
    loadingTeams,
    sales, 
    clients, 
    teams,
    columns, 
    open, 
    sale, 
    setSale,
    setOpen, 
    filter, 
    setFilter, 
    users, 
    cobradores, 
    downloadExcel, 
    campaigns, 
    onSearchClients 
  } = useHome();

  const optionsAuotComplete = useMemo(() =>
    clients.map((c) => ({value: c.esid?.toString(), label: c.esid + " - " + c.client + " - " + c.phone})) as Autocomplete[],
    [clients]
  );

  const optionsProcessUser = useMemo(() =>
    users.filter(u => u.role !== "Vendedor").map((u) => ({value: u.email, label: u.email + " - " + u.name})) as Autocomplete[],
    [users]
  );

  const hideInputSelers = useMemo(() =>
    userFirestore?.role === "Procesos" && (filter.concluded === null || filter.concluded),
    [userFirestore, filter.concluded]
  );

  if(filter.statusPayment !== null) {
    sales = sales.filter(s => filter.statusPayment ? s.paymentAmount : !s.paymentAmount);
  }

  return (
    <div>
      <h1>Ventas: { sales.length }</h1>
      {
        (userFirestore?.role === "Administrador" || userFirestore?.permissions.some(p => p.module === "Ventas" && p.write)) && <Button
          style={{ float: "right", marginBottom: 10 }}
          type="primary"
          onClick={() => {
            setSale(null);
            setOpen(true);
          }}
        >
          Agregar venta
        </Button>
      }
      {
        ((userFirestore?.role === "Procesos" && filter.concluded) || ["Administrador", "Vendedor"].includes(userFirestore?.role as string)) && 
        <Button type="primary" onClick={downloadExcel}>
          Descargar Reporte
        </Button>
      }
      <br />
      <br />
      <Row gutter={20}>
        <Col xs={24} sm={24} md={3} style={{ display: "grid" }}>
          <label>Concluidas / Pendientes / Todas</label>
          <Select value={filter.concluded} onChange={value => setFilter({ ...filter, concluded: value })}>
            <Option value={false}>Pendientes</Option>
            <Option value={true}>Concluidas</Option>
            <Option value={null}>Todas</Option>
          </Select>
        </Col>
        {
          (filter.concluded || filter.concluded === null) && <>
            <Col xs={24} sm={24} md={3} style={{ display: "grid" }}>
              <label>Tipo de fecha para rango</label>
              <Select value={filter.typeDate} onChange={value => setFilter({ ...filter, typeDate: value })}>
                <Option value="date">Fecha/Hora creada</Option>
                <Option value="datePayment">Fecha/Hora pago</Option>
                <Option value="dateConclued">Fecha/Hora concluida</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
              <label>Rango de fechas</label>
                {/* <RangePicker  
                  value={[filter.startDate, filter.endDate]}
                  onChange={(dates) => {
                    const startDate = dates ? dates[0] as dayjs.Dayjs : null;
                    const endDate = dates ? dates[1] as dayjs.Dayjs : null;

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
                /> */}
            </Col>
          </>
        }
        {
          (!hideInputSelers && ["Administrador", "Procesos"].includes(userFirestore?.role as string)) && <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
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
        {
          ["Administrador", "Vendedor"].includes(userFirestore?.role as string) && <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
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
        }
      </Row>
      <br />
      <Row gutter={20}>
        {
          userFirestore?.role === "Administrador" && <>
          <Col xs={24} sm={24} md={2} style={{ display: "grid" }}>
            <label>Filtro clientes</label>
            <Select 
              allowClear
              value={filter.fieldsClient} 
              onChange={value => setFilter({ ...filter, fieldsClient: value })}
            >
              <Option value="esid">ESID</Option>
              <Option value="phone">Teléfono</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
            <label>Clientes</label>
            <AutoComplete
              onSearch={(searchESID) => onSearchClients(searchESID)} 
              value={filter.esid}
              options={optionsAuotComplete} 
              filterOption={(inputValue, option) =>
                option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
              onChange={(value: string) => {  
                setFilter({...filter, esid: value});
              }}
              placeholder="Buscar..."
              onClear={() => setFilter({...filter, esid: ""})}
            >
              <Input.Search 
                size="middle" 
                enterButton
              />
            </AutoComplete>              
          </Col>
          </>
        }
        <Col xs={24} sm={24} md={4} style={{ display: "grid" }}>
          <label>Estatus pago</label>
          <Select 
            allowClear
            value={filter.statusPayment} 
            onChange={value => setFilter({ ...filter, statusPayment: value })}
          >
            <Option value={null}>Todas</Option>
            <Option value={true}>Pagadas</Option>
            <Option value={false}>No pagadas</Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={4} style={{ display: "grid" }}>
          <label>Campañas</label>
          <Select 
            loading={loadingCampaigns} 
            value={filter.campaignId}  
            onChange={value => setFilter({...filter, campaignId: value})}
            allowClear
          >
          <Option value="">Todas las campañas</Option>
          {
            campaigns.map(c => (
              <Option value={c.id}>{c.name}</Option>
            )) 
          }
          </Select>
        </Col>
        <Col xs={24} sm={24} md={4} style={{ display: "grid" }}>
          <label>Equipos</label>
          <Select 
            loading={loadingTeams}
            allowClear
            value={filter.teamId} 
            onChange={value => setFilter({...filter, teamId: value})}
          >
            <Option value="">Todos los equipos</Option>
            {
              teams.map(t => (
                <Option key={t.id} value={t.name}>{t.name}</Option>
              ))
            }
          </Select>
        </Col>
        <Col xs={24} sm={24} md={4} style={{ display: "grid" }}>
          <label>Estatus de servicio</label>
          <Select 
            allowClear
            value={filter.statusLight} 
            onChange={value => setFilter({...filter, statusLight: value })}
          >
            <Option value="">Todas</Option>
            <Option value="Con luz">Con luz</Option>
            <Option value="Sin luz">Sin luz</Option>
          </Select>
        </Col>
      </Row>
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
        onSearchClients={onSearchClients}
      />
    </div>
  )
}

export default Home;
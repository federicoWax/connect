import { Button, Col, Row, Select, Table, DatePicker, Form, message } from "antd";
import moment from "moment";
import HomeDialog from "./homeDialog";
import useHome from "../../hooks/useHome";
import { useAuth } from "../../context/AuthContext";
import ExcelJS from 'exceljs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Home = () => {
  const { userFirestore } = useAuth();
  const { loadingUsers, loadingSales, sales, columns, open, sale, setOpen, filter, setFilter, users } = useHome();

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de ventas');

    worksheet.columns = [
      { header: 'Vendedor', key: 'seller' },
      { header: 'Correo Vendedor', key: 'email' },
      { header: 'Equipo', key: 'team' },
      { header: 'Cliente', key: 'client' },
      { header: 'Estatus luz', key: 'statusLight' },
      { header: 'Fecha / Hora', key: 'date' }
    ];

    const _sales = sales.map(sale => ({
      seller: users.find(user => user.id === sale.userId)?.name,
      email: users.find(user => user.id === sale.userId)?.email,
      team: users.find(user => user.id === sale.userId)?.team,
      client: sale.client, 
      statusLight: sale.statusLight, 
      date: moment(sale.date?.toDate()).format("DD/MM/YYYY hh:mm a")
    }));

    worksheet.addRows(_sales);

    const data =  await workbook.xlsx.writeBuffer();
    
    var blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      
    const a = document.createElement('a');
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = "Reporte.xlsx";
    a.click();
  }

  return (
    <div>
      <h1>Ventas: { sales.length }</h1>
      {
        ["Administrador", "Vendedor"].includes(userFirestore?.role as string) && <Button
          style={{ float: "right", marginBottom: 10 }}
          type="primary"
          onClick={() => setOpen(true)}
        >
          Agregar venta
        </Button>
      }
      <Button type="primary" onClick={() => downloadExcel()}>
        Descargar Reporte
      </Button>
      <br />
      <br />
      <Row gutter={20}>
        <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
          <label>Concluidas / No concluidas</label>
          <Select value={filter.concluded} onChange={value => setFilter({ ...filter, concluded: value })}>
            <Option value={false}>No concluidas</Option>
            <Option value={true}>Concluidas</Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
          <label>Rango de fechas</label>
            <RangePicker  
              value={[filter.startDate, filter.endDate]}
              onChange={(dates) => {
                const startDate = dates ? dates[0] as moment.Moment : null;
                const endDate = dates ? dates[1] as moment.Moment : null;
                
                if(startDate) {
                  startDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
                } 

                if(endDate) {
                  endDate.set({ hour: 24, minute: 59, second: 59, millisecond: 59 });
                }

                if(startDate && endDate) {
                  const diffMonths = endDate.diff(startDate, 'months', true);

                  if(diffMonths > 1) {
                    message.error("No se puede seleccionar un rango mayor a un mes");
                    setFilter({ ...filter, startDate: null, endDate: null });
                    return;
                  }
                }

                setFilter({ ...filter, startDate, endDate });
              }}
              showTime={false}
              placeholder={["Fecha inicio", "Fecha fin"]}
            />
        </Col>
        {
          ["Administrador", "Procesos"].includes(userFirestore?.role as string) && <Col xs={24} sm={24} md={6} style={{ display: "grid" }}>
            <label>Vendedores</label>
            <Select loading={loadingUsers} value={filter.userId} onChange={value => setFilter({ ...filter, userId: value })}>
            <Option value="">{"Todos los vendedores"}</Option>
            {
              users.map(user => (
                <Option key={user.id} value={user.id}>{user.name}</Option>
              )) 
            }
            </Select>
          </Col>
        }
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
      />
    </div>
  )
}

export default Home;
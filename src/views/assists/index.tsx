import { Button, DatePicker, Input, message, Table } from "antd";
import useAssists from "../../hooks/useAssists";
import dayjs from "dayjs";
import { dayjsToEndDay, dayjsToStartDay } from "../../utils";

const { RangePicker } = DatePicker;

const Assists = () => {
  const { loadingAssists, assists, columns, search, setSearch, filter, setFilter, downloadExcel } = useAssists();

  return (
    <div>
      <h1>Asistencias</h1>
      <Button type="primary" onClick={downloadExcel}>
        Descargar Reporte
      </Button>
      <br/>
      <br/>
      <div>Rango de fechas</div>
      <RangePicker  
        value={[filter.startDate, filter.endDate]}
        onChange={(dates) => {
          let startDate = dates ? dates[0] as dayjs.Dayjs : null;
          let endDate = dates ? dates[1] as dayjs.Dayjs : null;

          if(!startDate || !endDate) {
            setFilter({ ...filter, startDate, endDate });
            return;
          }

          startDate = dayjsToStartDay(startDate);
          endDate = dayjsToEndDay(endDate);

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
      <br />
      <br />
      <Input placeholder="Buscar por Nombre o Correo" value={search} onChange={(e) => setSearch(e.target.value)} />
      <br />
      <br />
      <Table
        style={{ overflowX: "auto", backgroundColor: "white" }}
        loading={loadingAssists}
        columns={columns}
        pagination={false}
        dataSource={
          assists
            .filter(c => 
              c.name?.toString().toLowerCase().includes(search.toLowerCase()) 
              || c.email?.toString().toLowerCase().includes(search.toLowerCase())
            )
            .map(c => ({ ...c, key: c.id }))} 
        locale={{ emptyText: "Sin asistencias..." }}
      />
    </div>
  )
}

export default Assists;
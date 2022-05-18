import { DatePicker, Input, Table } from "antd";
import useAssists from "../../hooks/useAssists";

const Assists = () => {
  const { loadingAssists, assists, columns, search, setSearch, date, onChangeDate } = useAssists();

  return (
    <div>
      <h1>Asistencias</h1>
      
      <div>Fecha</div>
      <DatePicker value={date} onChange={onChangeDate} />
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
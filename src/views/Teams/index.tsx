import { Button, Input, Table } from "antd";
import useTeams from "../../hooks/useTeams";
import TeamDialog from "./teamDialog";

const Clients = () => {
  const { loadingTeams, teams, columns, open, team, setOpen, search, setSearch } = useTeams();

  return (
    <div>
      <h1>Equipos</h1>
      <Button
        style={{ float: "right", marginBottom: 10 }}
        type="primary"
        onClick={() => setOpen(true)}
      >
        Agregar equipo
      </Button>
      <Input placeholder="Buscar por Nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
      <br />
      <br />
      <Table
        style={{ overflowX: "auto", backgroundColor: "white" }}
        loading={loadingTeams}
        columns={columns}
        pagination={false}
        dataSource={
          teams
            .filter(c => c.name.toString().toLowerCase().includes(search.toLowerCase()))
            .map(c => ({ ...c, key: c.id }))
        } 
        locale={{ emptyText: "Sin equipos..." }}
      />
      <TeamDialog
        open={open}
        onClose={() => setOpen(false)}
        propTeam={team}
      />
    </div>
  )
}

export default Clients;
import { Button, Input, Table } from "antd";
import useTeams from "../../hooks/useTeams";
import PermissionsDialog from "./permissionsDialog";
import TeamDialog from "./teamDialog";

const Teams = () => {
  const { loadingTeams, teams, columns, open, team, setOpen, search, setSearch, openPermissions, setOpenPermissions } = useTeams();

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
      <PermissionsDialog
        open={openPermissions}
        onClose={() => setOpenPermissions(false)}
        propTeam={team}
      />
    </div>
  )
}

export default Teams;
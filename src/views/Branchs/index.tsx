import { Button, Input, Table } from "antd";
import useBranchs from "../../hooks/useBranchs";
import TeamDialog from "./branchDialog";

const Branchs = () => {
  const { loadingBranchs, branchs, columns, open, branch, setOpen, search, setSearch } = useBranchs();

  return (
    <div>
      <h1>Sucursales</h1>
      <Button
        style={{ float: "right", marginBottom: 10 }}
        type="primary"
        onClick={() => setOpen(true)}
      >
        Agregar Sucursal
      </Button>
      <Input placeholder="Buscar por Nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
      <br />
      <br />
      <Table
        style={{ overflowX: "auto", backgroundColor: "white" }}
        loading={loadingBranchs}
        columns={columns}
        pagination={false}
        dataSource={
          branchs
            .filter(c => c.name.toString().toLowerCase().includes(search.toLowerCase()))
            .map(c => ({ ...c, key: c.id }))
        } 
        locale={{ emptyText: "Sin Sucursales..." }}
      />
      <TeamDialog
        open={open}
        onClose={() => setOpen(false)}
        propBranch={branch}
      />
    </div>
  )
}

export default Branchs;
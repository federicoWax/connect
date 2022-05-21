import { Button, Table } from "antd";
import CobradorDialog from "./dialogCampaigns";
import useCampaigns from "../../hooks/useCampaigns";
import { useAuth } from "../../context/AuthContext";
 
const Campaigns = () => {
  const { loadingCampaigns, campaigns, columns, open, campaign, setOpen } = useCampaigns();
  const { userFirestore } = useAuth();
  
  return (
    <div>
      <h1>Campañas</h1>
      {
        (userFirestore?.role === "Administrador" || userFirestore?.permissions.some(p => p.module === "Campañas" && p.write)) && <Button
          style={{ float: "right", marginBottom: 10 }}
          type="primary"
          onClick={() => setOpen(true)}
        >
          Agregar campaña
        </Button>
      }
      <Table
        id=""
        style={{ overflowX: "auto", backgroundColor: "white" }}
        loading={loadingCampaigns}
        columns={columns}
        pagination={false}
        dataSource={campaigns.map(s => ({ ...s, key: s.id }))} locale={{ emptyText: "Sin campañas..." }}
      />
      <CobradorDialog
        open={open}
        onClose={() => setOpen(false)}
        propCampaign={campaign}
      />
    </div>
  )
}

export default Campaigns;
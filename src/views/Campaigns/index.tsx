import { Button, Table } from "antd";
import CobradorDialog from "./dialogCampaigns";
import useCampaigns from "../../hooks/useCampaigns";
 
const Campaigns = () => {
  const { loadingCampaigns, campaigns, columns, open, campaign, setOpen } = useCampaigns();
  
  return (
    <div>
      <h1>Camapañas</h1>
      <Button
        style={{ float: "right", marginBottom: 10 }}
        type="primary"
        onClick={() => setOpen(true)}
      >
        Agregar campaña
      </Button>
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
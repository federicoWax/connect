import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, DocumentData, Query } from 'firebase/firestore';
import useOnSnapshot from "./useOnSnapshot";
import { Campaign } from "../interfaces";
import { del } from '../services/firebase';
import { dialogDeleteDoc } from '../utils';
import useMessage from "./useMessage";

const db = getFirestore();

const useCampaigns = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaignes] = useState<Campaign[]>([]);
  const [queryCampaigns] = useState<Query<DocumentData>>(query(collection(db, "campaigns"), orderBy("name")));
  const [snapshotCampaigns, loadingCampaigns] = useOnSnapshot(queryCampaigns);
  const message = useMessage();

  const columns = [
    {
      title: 'Campaña',
      key: 'name',
      dataIndex: 'name',
      render: (text: string) => text
    },

    {
      title: 'Eliminar',
      key: 'delete',
      render: (record: Campaign) => (
        <Button
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() => {
            const deleteUser = () => del("campaigns", record.id as string);

            dialogDeleteDoc(deleteUser, message);
          }}
        />
      )
    },
    {
      title: 'Editar',
      key: 'edit',
      render: (campaing: Campaign) => (
        <Button
          shape="circle"
          icon={<EditOutlined />}
          onClick={() => {
            setOpen(true);
            setCampaign(campaing);
          }}
        />
      )
    },
  ];;

  useEffect(() => {
    let mounted = true;

    if (loadingCampaigns || !mounted) return;

    setCampaignes(snapshotCampaigns?.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Campaign[]);

    return () => {
      mounted = false;
    };
  }, [snapshotCampaigns, loadingCampaigns]);

  return { loadingCampaigns, campaigns, columns, campaign, open, setOpen, setCampaign };
};

export default useCampaigns;
import { FC, memo, useEffect, useState } from 'react'
import { Button, Card, message, Modal, Row, Spin } from 'antd';
import moment from 'moment';
import { useAuth } from '../../../context/AuthContext';
import { collection, getDocs, getFirestore, query, Timestamp, where } from 'firebase/firestore';
import { CheckOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Branch, Position } from '../../../interfaces';
import { getDocById, add } from '../../../services/firebase';

interface Props {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
};

const db = getFirestore();
const currentDate = moment();
currentDate.set({ hour:0, minute:0, second:0, millisecond:0});

const UserConfigDialog: FC<Props> = ({open, onClose, branch}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPosition, setLoadingPosition] = useState(false);
  const [withAssistance, setWithAssistance] = useState(false);
  const [position, setPosition] = useState<Position>();
  const { user, userFirestore } = useAuth();
  
  const getPosition = async () => {
    setLoadingPosition(true);

    return new Promise<Position>((resolve) => { 
      navigator.geolocation.getCurrentPosition(position => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude});
        setLoadingPosition(false);
      });
    });
  }

  useEffect(() => {
    if(open && user && !loading) {
      const getUserAsistance = async () => {
        try {
          setLoading(true);

          const assistance = await getDocs(query(collection(db, "assists"), where("userId", "==", user?.uid), where("date", "==", currentDate.toDate())));
          const _position = await getPosition();
  
          setWithAssistance(!assistance.empty);
          setPosition(_position);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }

      getUserAsistance();
    }
  }, [open, user, userFirestore]);

  const saveAssistance = async () => {
    if(saving || loading) return;

    if(!branch || !branch.radius || !branch.center) {
      message.error("No tienes una sucursal con ubicación asignada.");
      return;
    }

    if(!position) {
      message.error("No se pudo obtener tu ubicación.");
      return;
    }

    try {
      setSaving(true);

      const { radius, center } = branch;
      const { lat, lng } = center;
      const { lat: userLat, lng: userLng } = position;

      if(((lat-userLng)**2 + (lng-userLat)**2) <= radius **2) {
        await add("assists", { userId: user?.uid, date: Timestamp.fromDate(currentDate.toDate()) });
        
        message.success("Aasistencia guardada con exito.");
        
        onClose();
        
        return;
      }

      message.error("No has entrado en la zona de asistencia.");
    } catch (error) {
      console.log(error);
    } finally { 
      setSaving(false);
    }
  }

  const reloadPosition = async () => {
    if(loadingPosition) return;

    await getPosition();
  }
  return (
    <Modal
      forceRender 
      destroyOnClose
      confirmLoading={saving}
      visible={open}
      onCancel={onClose}
      title="Configuración de usuario"
      cancelText="Cerrar"
      okButtonProps={{
        style: {display: "none"}
      }}
    >
      <h3>ASISTENCIA</h3>
      <div style={{width: "100%", textAlign: "center", display: "flex"}}>
        <Card>

        {
          loading
          ?
            <Spin />
          :
            withAssistance 
            ?
              
              <>
                <div style={{margin: 10}}>
                  CHECADA
                </div>
                <CheckCircleOutlined style={{fontSize: 40, color: "green"}} />
              </>
            :
              <>
                <Button 
                  icon={<CheckOutlined />} 
                  type="primary" 
                  onClick={saveAssistance}
                  loading={saving}
                >
                  CHECAR ASISTENCIA
                </Button>
                &nbsp;
                &nbsp;
                <Button 
                  icon={<ReloadOutlined />} 
                  type="primary" 
                  onClick={reloadPosition}
                  loading={loadingPosition}
                >
                  RECARGAR MI UBICACIÓN
                </Button>
              </>
        }
        </Card>
      </div>
    </Modal>
  )
}

export default memo(UserConfigDialog);
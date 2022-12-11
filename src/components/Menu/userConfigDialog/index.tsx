import { FC, memo, useEffect, useState } from 'react'
import { Button, Card, Col, message, Modal, Row, Spin } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import { collection, getDocs, getFirestore, query, Timestamp, where } from 'firebase/firestore';
import { CheckOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Branch, Position } from '../../../interfaces';
import { add } from '../../../services/firebase';
import { endDateEndDay, startDateStartDay } from '../../../constants';

interface Props {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
};

type TypeRegisters = "ENTRADA" | "SALIDA A COMIDA" | "ENTRADA DE COMIDA" | "SALIDA";

const typeRegisters: Record<number, TypeRegisters> = {
  0: "ENTRADA",
  1: "SALIDA A COMIDA",
  2: "ENTRADA DE COMIDA",
  3: "SALIDA",
};

const db = getFirestore();

const UserConfigDialog: FC<Props> = ({open, onClose, branch}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPosition, setLoadingPosition] = useState(false);
  const [withAssistance, setWithAssistance] = useState(false);
  const [position, setPosition] = useState<Position>();
  const [countRegisters, setCountRegisters] = useState<number>(0);
  const { user, userFirestore } = useAuth();
  
  const getPosition = () => {
    setLoadingPosition(true);

    return new Promise<Position>((resolve) => { 
      navigator.geolocation.getCurrentPosition(position => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude});
        setLoadingPosition(false);
      });
    });
  }

  useEffect(() => {
    if(open && user) {
      const getUserAsistance = async () => {
        try {
          setLoading(true);

          const assistance = await getDocs(query(collection(db, "assists"), where("userId", "==", user?.uid), where("date", ">=", startDateStartDay), where("date", "<=", endDateEndDay)));
          const _position = await getPosition();
          const countAssists = assistance.docs.length;

          if(userFirestore?.team === "CMG") {
            setCountRegisters(countAssists);
          } 

          setWithAssistance(countAssists === 4);
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
        await add("assists", { userId: user?.uid, date: Timestamp.now(), typeRegister: typeRegisters[countRegisters] });
        
        message.success("Registro guardada con exito.");
        
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
      width={600}
      forceRender 
      destroyOnClose
      confirmLoading={saving}
      open={open}
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
              <Row gutter={10}>
                <Col md={12} sm={24} xs={24}>
                  <Button 
                    icon={<CheckOutlined />} 
                    type="primary" 
                    onClick={saveAssistance}
                    loading={saving}
                  >
                    CHECAR {typeRegisters[countRegisters]}
                  </Button>
                </Col>
                <br />
                <br />
                <Col md={12} sm={24} xs={24}>
                  <Button 
                    icon={<ReloadOutlined />} 
                    type="primary" 
                    onClick={reloadPosition}
                    loading={loadingPosition}
                  >
                    RECARGAR MI UBICACIÓN
                  </Button>
                </Col>
              </Row>
        }
        </Card>
      </div>
    </Modal>
  )
}

export default memo(UserConfigDialog);
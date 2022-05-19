import { FC, memo, useEffect, useState } from 'react'
import { Button, Card, Col, message, Modal, Row, Spin } from 'antd';
import moment from 'moment';
import { useAuth } from '../../../context/AuthContext';
import { collection, getDocs, getFirestore, query, Timestamp, where } from 'firebase/firestore';
import { CheckOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Branch, Position } from '../../../interfaces';
import { add } from '../../../services/firebase';

interface Props {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
};

interface TypeRegisters {
  0: string;
  1: string;
  2: string;
  3: string;
}

const typeRegisters: TypeRegisters = {
  0: "ENTRADA",
  1: "SALIDA A COMIDA",
  2: "ENTRADA DE COMIDA",
  3: "SALIDA",
};

const db = getFirestore();
const StartDate = moment().set({ hour:0, minute:0, second:0});
const EndDate = moment().set({ hour:23, minute:59, second:59});

const UserConfigDialog: FC<Props> = ({open, onClose, branch}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPosition, setLoadingPosition] = useState(false);
  const [withAssistance, setWithAssistance] = useState(false);
  const [position, setPosition] = useState<Position>();
  const [countRegisters, setCountRegisters] = useState<number>(0);
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

          const assistance = await getDocs(query(collection(db, "assists"), where("userId", "==", user?.uid), where("date", ">=", StartDate.toDate()), where("date", "<=", EndDate.toDate())));
          const _position = await getPosition();

          if(userFirestore?.team === "CMG") {
            setCountRegisters(assistance.docs.length);
          } 

          setWithAssistance(userFirestore?.team === "CMG" ? assistance.docs.length === 4 : !assistance.empty);
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
        await add("assists", { userId: user?.uid, date: Timestamp.now(), typeRegister: typeRegisters[countRegisters as keyof TypeRegisters] });
        
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
              <Row gutter={10}>
                <Col md={12} sm={24} xs={24}>
                  <Button 
                    icon={<CheckOutlined />} 
                    type="primary" 
                    onClick={saveAssistance}
                    loading={saving}
                  >
                    CHECAR {typeRegisters[countRegisters as keyof TypeRegisters]}
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
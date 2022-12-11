import { FC, useState, memo, useEffect } from "react";
import { Button, Col, Form, Input, message, Modal, Row } from "antd";
import { Branch, Center } from "../../interfaces";
import { add, update } from "../../services/firebase";
import { GoogleMap, DrawingManager, useJsApiLoader, Circle } from '@react-google-maps/api';
import { ReloadOutlined } from "@ant-design/icons";

interface Props {
  open: boolean;
  onClose: () => void;
  propBranch: Branch | null;
};
type Libraries = ("drawing" | "geometry" | "localContext" | "places" | "visualization")[];

const apiKey = "AIzaSyDAL0TdQNyLykbqiwBQInlazWDwcX9Edns";
const initBranch: Branch = {
  name: ""
};
const initCenter: Center = {
  lat: 20.6565042,
  lng: -98.9999999
};
const containerStyle = {
  width: '100%',
  height: '300px'
};

const libraries: Libraries = ["drawing"];
const initZoom = 6;

const BranchDialog: FC<Props> = ({open, onClose, propBranch}) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [branch, setBranch] = useState<Branch>(initBranch);
  const [center, setCenter] = useState<Center>(initCenter);
  const [zoom, setZoom] = useState<number>(initZoom);
  const [form] = Form.useForm(); 
  const [options, setOptions] = useState<google.maps.drawing.DrawingManagerOptions>();
  const [polygon, setPolygon] = useState<google.maps.Circle>();
  const [showCircle, setShowCircle] = useState<boolean>(false);

  const  { isLoaded , loadError }  =  useJsApiLoader ( { 
    googleMapsApiKey: apiKey, 
    libraries
  })

  useEffect(() => {
    if (propBranch) {
      setBranch(propBranch);
      form.setFieldsValue(propBranch);
    }
  }, [propBranch, form]);

  useEffect(() => {
    if(isLoaded) {
      const drawingMode = window.google.maps.drawing?.OverlayType.CIRCLE

      if(propBranch && propBranch.center) {
        setOptions({
          drawingControl: false,
        });

        setCenter(propBranch.center);
        setZoom(15);
        setShowCircle(true);
      } else {
        setOptions({
          drawingControl: true,
          drawingMode: null,
          drawingControlOptions: {
            drawingModes: [drawingMode],
          },
        });
        setCenter(initCenter);
        setZoom(initZoom);
        setShowCircle(false);
      }
    }

  }, [isLoaded, propBranch]);

  const save = async () => {
    if(saving) return;

    setSaving(true);

    const id = branch.id;
    let _branch = {...branch};     
    delete _branch.id;

    _branch.center = polygon ? { lat: Number(polygon.getCenter()?.lat()), lng: Number(polygon.getCenter()?.lng()) } : undefined;
    _branch.radius = polygon ? polygon.getRadius() : undefined;

    try {
      id ? await update("branchs", id, _branch ) : await add('branchs', _branch);

      message.success("Sucursal guardada con exito!");
    } catch (error) {
      console.log(error);
      setSaving(false);
    } finally {
      setSaving(false);
      resetForm();
    }
  }

  const resetForm = () => {
    onClose();
    form.resetFields();
    setBranch(initBranch);
    setZoom(initZoom);
    setCenter(initCenter);
    clearPolygon();
  }

  const onPolygonComplete = (polygon: google.maps.Circle) => {
    setOptions({
      drawingControl: false,
    });

    setPolygon(polygon);
  }

  const clearPolygon = () => {
    if(!polygon) return;

    polygon.setMap(null);

    setPolygon(undefined);
    setOptions({
      drawingControl: true,
      drawingMode: null,
      drawingControlOptions: {
        drawingModes: [drawingMode],
      },
    });
    setShowCircle(false);
  }

  const onLoadCircle = (circle: google.maps.Circle) => {
    setPolygon(circle);
  }

  if(!isLoaded) return null;

  const drawingMode = window.google.maps.drawing?.OverlayType.CIRCLE;

  return (
    <Modal
      forceRender 
      destroyOnClose={true}
      confirmLoading={saving}
      open={open}
      onCancel={resetForm}
      onOk={() => form.validateFields().then(save)}
      title={branch.id ? "Editar sucursal" : "Agregar sucursal"}
      cancelText="Cancelar"
      okText="Guardar"
    >
      <Form 
        form={form}
        layout="vertical" 
        style={{overflowY: "auto", overflowX: "hidden", maxHeight: 500}}
      >
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={24}>
            <Form.Item
              label="Nombre"
              name="name"
              rules={[{ required: true, message: 'Nombre requerido.' }]}
            >
              <Input
                value={branch.name} 
                onChange={(e) => setBranch({...branch, name: e.target.value})}
              />
            </Form.Item>
          </Col>
          <div style={{width: "100%"}}>
            <Button 
              style={{margin: 10, float: "right"}}  
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => clearPolygon()}
            />
          </div>
          <Col xs={24} sm={24} md={24} style={{height: 300}}>
          {
            loadError 
            ? 
              "Error al cargar el mapa" 
            :  
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
              >
                <DrawingManager
                  drawingMode={drawingMode}
                  onCircleComplete={onPolygonComplete}
                  options={options}
                />
                {
                  showCircle ? <Circle
                    onLoad={onLoadCircle}
                    center={branch.center}
                    radius={branch.radius}
                  />
                  : null
                }
              </GoogleMap>
          }
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default memo(BranchDialog);
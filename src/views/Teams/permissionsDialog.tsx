import { FC, useEffect, useState } from "react";
import { Checkbox, Col, message, Modal, Row } from "antd";
import { Permission, Team } from "../../interfaces";
import { update } from "../../services/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  propTeam: Team | null;
};

const initPermisions: Permission[] = [
  {
    module: "Ventas",
    route: "/ventas",
    read: false,
    write: false
  },
  {
    module: "Clientes",
    route: "/clientes",
    read: false,
    write: false
  },
  {
    module: "Cobradores",
    route: "/cobradores",
    read: false,
    write: false
  },
  {
    module: "Campañas",
    route: "/campanas",
    read: false,
    write: false
  },
  {
    module: "Usuarios",
    route: "/usuarios",
    read: false,
    write: false
  },
  {
    module: "Equipos",
    route: "/equipos",
    read: false,
    write: false
  },
  {
    module: "Sucursales",
    route: "/sucursales",
    read: false,
    write: false
  },
  {
    module: "Asistencias",
    route: "/asistencias",
    read: false,
    write: false
  },
];

const TeamDialog: FC<Props> = ({open, onClose, propTeam}) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<Permission[]>(initPermisions);

  useEffect(() => {
    if(propTeam?.permissions) {
      setPermissions(propTeam.permissions);
    }
  }, [propTeam]);

  const save = async () => {
    if(saving) return;

    setSaving(true);

    const id = propTeam?.id as string;
    let _propTeam= {...propTeam};     
    delete _propTeam.id;

    try {
      update("teams", id, { permissions } );

      message.success("Permisos guardados con exito!");
    } catch (error) {
      console.log(error);
      setSaving(false);
    } finally {
      setSaving(false);
      resetForm();
    }
  }

  const resetForm = () => {
    setPermissions(initPermisions);
    onClose();
  }

  return (
   <Modal
      forceRender 
      destroyOnClose={true}
      confirmLoading={saving}
      open={open}
      onCancel={resetForm}
      onOk={save}
      title="Permisos"
      cancelText="Cancelar"
      okText="Guardar"
    >
      <Row gutter={10} style={{marginTop: 10}}>
        <Col xs={16} sm={16} md={16}>
          <b>Módulo</b>
        </Col>
        <Col xs={4} sm={4} md={4}>
          <b>Leer</b>
        </Col>
        <Col xs={4} sm={4} md={4}>
          <b>Escribir</b>
        </Col>
      </Row>
      {
        permissions.map((perm) => (
          <Row key={perm.module} gutter={10} style={{marginTop: 10}}>
            <Col xs={16} sm={16} md={16}>
              {perm.module}
            </Col>
            <Col xs={4} sm={4} md={4}>
              <Checkbox 
                checked={perm.read} 
                onChange={() => setPermissions(permissions.map(p => p.module === perm.module ? ({...p, read: !p.read})  : p))} 
              />
            </Col>
            <Col xs={4} sm={4} md={4}>
              <Checkbox 
                checked={perm.write} 
                onChange={() => setPermissions(permissions.map(p => p.module === perm.module ? ({...p, write: !p.write})  : p))} 
              />
            </Col>
          </Row>
        ))
      }
    </Modal>
  )
}

export default TeamDialog;
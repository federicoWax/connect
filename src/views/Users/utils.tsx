import { UserFirestore } from "../../interfaces"
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

export const getColumns = (setUser: React.Dispatch<React.SetStateAction<UserFirestore | null>>, setOpen: React.Dispatch<React.SetStateAction<boolean>> ) => [
  {
    title: 'Nombre',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Correo',
    dataIndex: 'email',
    key: 'email',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Rol',
    dataIndex: 'role',
    key: 'role',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Teléfono',
    dataIndex: 'phone',
    key: 'phone',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Equipo',
    dataIndex: 'team',
    key: 'team',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Ciudad',
    dataIndex: 'city',
    key: 'city',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Eliminar',
    key: 'delete',
    render: (text: string, record: UserFirestore) => (
      <Button 
        shape="circle" 
        icon={<DeleteOutlined />}
        onClick={() => {}}
      />
    )
  },
  {
    title: 'Editar',
    key: 'edit',
    render: (text: string, user: UserFirestore) => (
      <Button 
        shape="circle" 
        icon={<EditOutlined />}
        onClick={() => {
          setOpen(true);
          setUser(user);
        }} 
      />
    )
  },
];

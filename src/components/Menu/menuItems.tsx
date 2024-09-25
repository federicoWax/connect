import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';
import {
  UserOutlined, DollarOutlined, UnorderedListOutlined,
  ProfileOutlined, SettingOutlined, ScheduleOutlined,
  TeamOutlined, FileExcelOutlined
} from '@ant-design/icons';
import { MdAccountBox, MdGroup, MdLocationCity, MdPayments } from 'react-icons/md';

const signOut = () => getAuth().signOut();

const styleIcon = {
  fontSize: 20
};

const menuItems = [
  {
    key: '/ventas',
    title: 'Ventas',
    label: <Link to="/ventas">Ventas</Link>,
    icon: <DollarOutlined style={styleIcon} />,
  },
  {
    key: '/clientes',
    title: 'Clientes',
    label: <Link to="/clientes">Clientes</Link>,
    icon: <MdAccountBox style={styleIcon} />,
  },
  {
    key: '/cobradores',
    title: 'Cobradores',
    label: <Link to="/cobradores">Cobradores</Link>,
    icon: <UnorderedListOutlined style={styleIcon} />,
  },
  {
    key: '/campañas',
    title: 'Campañas',
    label: <Link to="/campanas">Campañas</Link>,
    icon: <ProfileOutlined style={styleIcon} />,
  },
  {
    key: '/usuarios',
    title: 'Usuarios',
    label: <Link to="/usuarios">Usuarios</Link>,
    icon: <MdGroup style={styleIcon} />,
  },
  {
    key: '/equipos',
    title: 'Equipos',
    label: <Link to="/equipos">Equipos</Link>,
    icon: <TeamOutlined style={styleIcon} />,
  },
  {
    key: '/sucursales',
    title: 'Sucursales',
    label: <Link to="/sucursales">Sucursales</Link>,
    icon: <MdLocationCity style={styleIcon} />,
  },
  {
    key: '/asistencias',
    title: 'Asistencias',
    label: <Link to="/asistencias">Asistencias</Link>,
    icon: <ScheduleOutlined style={styleIcon} />,
  },
  {
    key: '/exceles',
    title: 'Exceles',
    label: <Link to="/exceles">Exceles</Link>,
    icon: <FileExcelOutlined style={styleIcon} />,
  },
  {
    key: '/paymentMethods',
    title: 'Metodos de pago',
    label: <Link to="/metodos-de-pago">Metodos de pago</Link>,
    icon: <MdPayments style={styleIcon} />,
  },
  {
    key: '/cuenta',
    title: '',
    icon: <SettingOutlined style={styleIcon} />,
    label: 'Cuenta',
    children: [
      {
        key: '/signOut',
        title: '',
        icon: <UserOutlined style={styleIcon} />,
        label: 'Cerrar sesión',
        onClick: async () => await signOut()
      }
    ]
  }
];

export default menuItems;
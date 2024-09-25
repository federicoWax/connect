import { Button, Table } from "antd";
import { useAuth } from "../../context/AuthContext";
import usePaymentMethods from "../../hooks/usePaymentMethods";
import PaymentMethodsDialog from "./paymentMethodsDialog";

const PaymentMethods = () => {
  const { open, setOpen, columns, paymentMethods, loading, paymentMethod } = usePaymentMethods();
  const { userFirestore } = useAuth();

  return (
    <div>
      <h1>Metodos de pago</h1>
      {
        (userFirestore?.role === "Administrador" || userFirestore?.permissions.some(p => p.module === "Metodos de pago" && p.write)) && <Button
          style={{ float: "right", marginBottom: 10 }}
          type="primary"
          onClick={() => setOpen(true)}
        >
          Agregar metodo de pago
        </Button>
      }
      <Table
        style={{ overflowX: "auto", backgroundColor: "white" }}
        loading={loading}
        columns={columns}
        pagination={false}
        dataSource={paymentMethods.map(s => ({ ...s, key: s.id }))} locale={{ emptyText: "Sin metodos de pago..." }}
      />
      <PaymentMethodsDialog
        open={open}
        onClose={() => setOpen(false)}
        paymentMethod={paymentMethod}
      />
    </div>
  );
};

export default PaymentMethods;
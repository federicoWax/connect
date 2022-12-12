import { useState } from "react";
import { Button } from "antd";
import { useAuth } from "../../context/AuthContext";
import ExcelDialog from "./excelDialog";
import { Excel } from "../../interfaces";

const Excels = () => {
  const { userFirestore } = useAuth();

  const [open, setOpen] = useState(false);
  const [excel, setExcel] = useState<Excel | null>(null);

  return (
    <div>
      <h1>Exceles</h1>
      {
        (userFirestore?.role === "Administrador" || userFirestore?.permissions.some(p => p.module === "Exceles" && p.write)) && <Button
          style={{ float: "right", marginBottom: 10 }}
          type="primary"
          onClick={() => setOpen(true)}
        >
          Agregar excel
        </Button>
      }
      <ExcelDialog 
        open={open}
        propExcel={excel}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

export default Excels;
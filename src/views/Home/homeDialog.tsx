import { FC } from "react";
import { Sale } from "../../interfaces";

interface Props {
  open: boolean;
  onClose: () => void;
  propSale: Sale | null;
};

const HomeDialog: FC<Props> = ({open, onClose, propSale}) => {
  return (
    <div>HomeDialog</div>
  )
}

export default HomeDialog;
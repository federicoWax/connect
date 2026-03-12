import { App } from "antd";

const useMessage = () => {
  const { message } = App.useApp();

  return message;
};

export default useMessage;
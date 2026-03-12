import './App.css';
import MyRouter from './router';
import AuthProvider from './context/AuthContext';
import { useEffect } from 'react';
import { App as AntdApp } from "antd";

function App() {
  useEffect(() => {
    if (window.location.hostname.includes("connect-4dee9.web.app")) {
      window.location.replace('https://www.google.com.mx/');
    }
  }, []);

  return (
    <AntdApp>
      <AuthProvider>
        <MyRouter />
      </AuthProvider>
    </AntdApp>
  );
}

export default App;

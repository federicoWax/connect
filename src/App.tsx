import './App.css';
import MyRouter from './router';
import AuthProvider from './context/AuthContext';
import { useEffect } from 'react';

function App() {
 /*  useEffect(() => {
    if(window.location.hostname.includes("connect-4dee9.web.app")) {
      window.location.replace('https://www.google.com.mx/')
    }
  }, []); */
  
  return (
    <AuthProvider>
      <MyRouter />
    </AuthProvider>
  );
}

export default App;

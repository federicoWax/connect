import './App.css';
import MyRouter from './router';
import AuthProvider from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <MyRouter />
    </AuthProvider>
  );
}

export default App;

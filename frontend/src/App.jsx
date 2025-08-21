import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Board from './components/Board';
import { useAuth } from './context/AuthContext';

function App() {
  const { token } = useAuth();

  return (
    <div className="app-container">
      <h1>TaskFlow</h1>
      
      {token ? (
        <Board />
      ) : (
        <div className="auth-container">
          <Register />
          <Login />
        </div>
      )}
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // NEW: Import the useAuth hook

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // NEW: Get the login function from our context

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://taskflow-backend-new.onrender.com/login', {
        username: username,
        password: password
      });
      // NEW: Instead of logging, call the login function from context with the token
      login(response.data.access_token);
      
    } catch (error) {
      console.error('There was an error logging in!', error);
      alert('Login failed!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
import React, { useState } from 'react';
import axios from 'axios'; // NEW: Import axios

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // NEW: Make the function async to use await
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // NEW: Send a POST request to the backend's /register endpoint
      const response = await axios.post('http://localhost:5000/register', {
        username: username,
        password: password
      });
      // Log the success message from the backend
      console.log('Registration successful:', response.data);
      alert('Registration successful!'); // Show a success alert
    } catch (error) {
      // Log any errors
      console.error('There was an error registering!', error);
      alert('Registration failed!'); // Show an error alert
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Register</h2>
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
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
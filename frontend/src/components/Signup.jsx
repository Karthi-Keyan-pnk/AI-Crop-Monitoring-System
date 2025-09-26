import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import axios from "axios";
const Signup = () => {
  
  const [username,setUser] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [phonenumber,setPhone] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5001/user/register", {
        username,
        email,
        password,
        phonenumber
      });

      const data = res.data;
      if (data.status == 'ok') {
        setMessage("Signup successful! Please login.");
        navigate("/"); 
      } else {
        setMessage(data.message || "Signup failed.");
      }
    } catch (err) {
      setMessage("Error connecting to server.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) =>setUser(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              name="phonenumber"
              placeholder="Phone Number"
              value={phonenumber}
              onChange={(e) =>setPhone(e.target.value)}
              required
              pattern="[0-9]{10}"
              title="Enter a valid 10-digit phone number"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <button type="submit">Sign Up</button>
          </div>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Signup;

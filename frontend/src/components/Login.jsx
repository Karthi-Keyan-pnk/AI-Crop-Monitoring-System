import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";
import axios from "axios";
import { UserContext } from './Hooks/UseContext';
const node_url = import.meta.env.VITE_NODE_URL;

const Login = () => {
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      window.alert("Fill the details");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${node_url}/user/login`, {
        email,
        password,
      });

      const data = res.data;

      if (data.status === "ok") {
        const userData = {
          _id: data.user._id,
          username: data.user.username,
          email: data.user.email,
          phonenumber: data.user.phonenumber
        };
        setUser(userData);
        setMessage("Login successful!");
        navigate("/");
      }
      else {
        setMessage(data.message || "Login failed.");
      }
    } catch (err) {
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login to AICI</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {message && (
          <p
            className={`message ${message.includes("successful") ? "success" : "error"
              }`}
          >
            {message}
          </p>
        )}
        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

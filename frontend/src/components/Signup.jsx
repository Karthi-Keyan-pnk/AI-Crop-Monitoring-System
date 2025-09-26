import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const Signup = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phonenumber: "", // keep string here (input sends string)
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5001/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // phone goes as string
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Signup successful! Please login.");
        navigate("/"); // redirect to login
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
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              name="phonenumber"
              placeholder="Phone Number"
              value={form.phonenumber}
              onChange={handleChange}
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
              value={form.password}
              onChange={handleChange}
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

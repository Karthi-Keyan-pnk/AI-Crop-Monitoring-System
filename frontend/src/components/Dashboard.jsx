import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { FaTractor, FaList, FaMapMarkerAlt, FaSearch, FaBell, FaCog, FaFlag } from "react-icons/fa";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from "chart.js";
import axios from "axios";
import { UserContext } from "./Hooks/UseContext";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [temperature, setTemperature] = useState(0);
  const [sevenDayTemps, setSevenDayTemps] = useState([]);
  const [sevenDayLabels, setSevenDayLabels] = useState([]);

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    return names[0][0].toUpperCase();
  };

  useEffect(() => {
    const fetchSevenDayTemps = async (lat, lon) => {
      try {
        const res = await axios.get(
          `http://localhost:5001/climate/get_week_weather?lat=${lat}&lon=${lon}`
        );
        if (res.data.temperatures && res.data.labels && res.data.temperatures.length === 7) {
          setSevenDayTemps(res.data.temperatures);
          const formattedLabels = res.data.labels.map(dateStr => {
            const [y, m, d] = dateStr.split("-");
            return `${d}/${m}/${y}`;
          });
          setSevenDayLabels(formattedLabels);
          setTemperature(res.data.temperatures[3]);
        } else {
          setSevenDayTemps([]);
          setSevenDayLabels([]);
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
        setSevenDayTemps([]);
        setSevenDayLabels([]);
      }
    };

    if (user && user.lat && user.lon) {
      fetchSevenDayTemps(user.lat, user.lon);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          fetchSevenDayTemps(lat, lon);
        },
        (err) => {
          console.error("Geolocation error:", err);
        }
      );
    }
  }, [user]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return <div className="dashboard"><p>Loading user data...</p></div>;

  const pieData = {
    labels: ["Rice", "Oats", "Corns"],
    datasets: [
      {
        data: [5, 3, 2],
        backgroundColor: ["#2E7D32", "#66BB6A", "#A5D6A7"],
        borderWidth: 0,
      },
    ],
  };

  const lineData = {
    labels: sevenDayLabels.length === 7 ? sevenDayLabels : ["No Data"],
    datasets: [
      {
        label: "Temperature °C (Past 3, Today, Next 3)",
        data: sevenDayTemps.length === 7 ? sevenDayTemps : [0],
        borderColor: "#2E7D32",
        backgroundColor: "rgba(46,125,50,0.2)",
        tension: 0.4,
        borderWidth: 4,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const yMin = sevenDayTemps.length === 7 ? Math.floor(Math.min(...sevenDayTemps)) - 2 : 10;
  const yMax = sevenDayTemps.length === 7 ? Math.ceil(Math.max(...sevenDayTemps)) + 2 : 40;
  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: yMin, max: yMax } },
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          {user.avatar ? (
            <img src={user.avatar} alt="user" />
          ) : (
            <div className="logo-initials">{getInitials(user.username)}</div>
          )}
          <h6>Welcome Back {user.username}!</h6>
        </div>

        <ul className="menu">
          <li>
            <Link to="/machinery" className="sidebar-btn">
              <FaTractor className="icon" /> Machinery
            </Link>
          </li>
          <li>
            <Link to="/reports" className="sidebar-btn">
              <FaList className="icon" /> Reports
            </Link>
          </li>
          <li>
            <Link to="/map" className="sidebar-btn">
              <FaMapMarkerAlt className="icon" /> Map
            </Link>
          </li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div className="search-bar">
            <FaSearch />
            <input type="text" placeholder="Search owners or fields" />
          </div>
          <div className="top-icons">
            <FaFlag />
            <FaCog />
            <FaBell />
            <span className="user-name">
              {user.username}{" "}
              {user.avatar ? (
                <img src={user.avatar} alt="user" />
              ) : (
                <div className="user-initials">{getInitials(user.username)}</div>
              )}
            </span>
          </div>
        </div>

        {/* Cards Layout */}
        <div className="cards-row">
          {/* Temperature Left */}
          <div className="card temperature-card">
            <h3>Field Info - Weather Forecast</h3>
            <p>Current Temperature: {temperature}°C</p>
            <div className="linechart-container">
              {sevenDayTemps.length === 7 ? (
                <Line data={lineData} options={lineOptions} className="line-chart" />
              ) : (
                <div style={{ textAlign: 'center', color: '#888' }}>No weather data available</div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <div className="card pie-card">
              <h4>Crop Distribution</h4>
              <div className="pie-container">
                <Pie data={pieData} />
              </div>
            </div>

            <div className="card map-card">
              <h4>Field Map</h4>
              <div className="map-placeholder">
                <FaMapMarkerAlt style={{ fontSize: "40px", color: "#4caf50" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

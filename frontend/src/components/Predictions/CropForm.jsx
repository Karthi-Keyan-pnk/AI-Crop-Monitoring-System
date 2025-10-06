import React, { useState, useEffect } from "react";
import img6 from "../../assets/Img_6.jpeg";
import "./cropform.css";
import axios from "axios";
import { getUserId } from "../Hooks/userUtils";

const fast_url = import.meta.env.VITE_FAST_URL;
const node_url = import.meta.env.VITE_NODE_URL;

export default function CropForm() {
  const [loading, setLoading] = useState(false);
  const [climate, setClimate] = useState({
    temperature: "",
    humidity: "",
    season: "",
    date: "",
    time: "",
  });
  const [climateLoading, setClimateLoading] = useState(true);

  // Fetch climate data
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocation not supported");
      setClimateLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await axios.get(
            `${node_url}/climate/get_climate?lat=${latitude}&lon=${longitude}`
          );
          const data = res.data;

          setClimate({
            temperature: data.temperature || "",
            humidity: data.humidity || "",
            season: data.season || "",
            date: data.date || "",
            time: data.time || "",
          });
        } catch (err) {
          console.error("❌ Fetch error:", err);
        } finally {
          setClimateLoading(false);
        }
      },
      (err) => {
        console.error("❌ Geolocation error:", err.message);
        setClimateLoading(false);
      }
    );
  }, []);

  // Predict crop handler
  const predictCrop = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const payload = {
      crop: formData.get("crop"),
      season: climate.season,
      sowing_date: climate.date,
      ph: parseFloat(formData.get("ph")),
      avg_water: parseFloat(formData.get("avg_water")),
      temperature: climate.temperature,
      humidity: climate.humidity,
    };

    try {
      const userId = getUserId();
      const res = await axios.post(`${fast_url}/predict_crop`, payload, {
        headers: {
          'user-id': userId || ''
        }
      });
      const data = res.data;
      alert(
        `✅ Water Needed: ${data.water_required} L/ha\n📅 Days until Harvest: ${data.days_until_harvest}`
      );
    } catch (err) {
      console.error("❌ Prediction error:", err);
      if (err.response?.status === 401) {
        alert("Please log in again to continue using the prediction features.");
      } else if (err.response?.status === 403) {
        alert("You don't have permission to access this feature. Please contact support.");
      } else {
        alert("Error predicting crop. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-form-container">
      <div className="crop-form-card">
        <div className="form-image-section">
          <img src={img6} alt="Agricultural field" className="form-image" />
          <div className="image-overlay">
            <h2>🌱 Harvest & Water Intelligence</h2>
            <p>Get accurate predictions for your crop water needs and harvest timing</p>
          </div>
        </div>

        <div className="form-content-section">
          <div className="form-header">
            <h3>🌱 Crop Prediction Form</h3>
            <p>Enter your crop details for intelligent predictions</p>
          </div>

          {climateLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Getting your location and climate data...</p>
            </div>
          ) : (
            <form onSubmit={predictCrop} className="crop-form">
              <div className="form-group">
                <label htmlFor="crop">Crop Name</label>
                <input
                  id="crop"
                  name="crop"
                  type="text"
                  placeholder="Enter crop name"
                  required
                />
              </div>

              <div className="auto-fill-grid">
                <div className="form-group">
                  <label>Season</label>
                  <div className="readonly-field">{climate.season}</div>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <div className="readonly-field">{climate.date}</div>
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <div className="readonly-field">{climate.time}</div>
                </div>
                <div className="form-group">
                  <label>Temperature</label>
                  <div className="readonly-field">
                    {climate.temperature ? `${climate.temperature} °C` : "No data"}
                  </div>
                </div>
                <div className="form-group">
                  <label>Humidity</label>
                  <div className="readonly-field">
                    {climate.humidity ? `${climate.humidity} %` : "No data"}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ph">Soil pH Level</label>
                <input
                  id="ph"
                  name="ph"
                  type="number"
                  step="any"
                  placeholder="Enter soil pH (0-14)"
                  min="0"
                  max="14"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="avg_water">Average Water (L/ha)</label>
                <input
                  id="avg_water"
                  name="avg_water"
                  type="number"
                  step="any"
                  placeholder="Enter water amount in liters per hectare"
                  min="0"
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading || climateLoading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span> Predicting...
                  </>
                ) : (
                  <>
                    <span className="button-icon">🔍</span> Predict Now
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

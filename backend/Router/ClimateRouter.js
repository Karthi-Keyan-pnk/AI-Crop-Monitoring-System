const express = require("express");
const fetch = require("node-fetch"); // works with v2

const router = express.Router();

// New endpoint for 7-day (past 3, current, next 3) temperature data
// Route for current weather only
router.get("/get_climate", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing latitude or longitude" });
    }
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OpenWeather API key" });
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    if (!data.main) {
      return res.status(500).json({ error: "Invalid API response", details: data });
    }
    res.json({
      temperature: data.main.temp,
      humidity: data.main.humidity,
      season: getSeason(new Date().getMonth() + 1),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch climate data" });
  }
});

// Route for 7-day (past 3, current, next 3) temperature data
router.get("/get_week_weather", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing latitude or longitude" });
    }

    // Get dates for past 3 days, today, next 3 days
    const today = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(formatDate(d));
    }
    const start_date = dates[0];
    const end_date = dates[dates.length-1];

    // 1. Fetch past 3 days (archive) + today + next 3 days (forecast) in one call
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${start_date}&end_date=${end_date}&daily=temperature_2m_mean&timezone=auto`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!data.daily || !data.daily.time || !data.daily.temperature_2m_mean) {
      return res.status(500).json({ error: "Invalid Open-Meteo response", details: data });
    }
    // Return all 7 days
    res.json({
      temperatures: data.daily.temperature_2m_mean,
      labels: data.daily.time,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch week weather data" });
  }
});

function getSeason(month) {
  if ([12, 1, 2].includes(month)) return "winter";
  if ([3, 4, 5].includes(month)) return "spring";
  if ([6, 7, 8].includes(month)) return "summer";
  return "rainy";
}

module.exports = router;

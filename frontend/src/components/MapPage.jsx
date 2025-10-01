// src/components/MapPage.jsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapPage = () => {
  const [coords, setCoords] = useState({ lat: null, lon: null });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error fetching location:", error);
        alert("Please allow location access to view the map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {coords.lat && coords.lon ? (
        <MapContainer center={[coords.lat, coords.lon]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={[coords.lat, coords.lon]}>
            <Popup>Your current location</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p>Fetching your location...</p>
      )}
    </div>
  );
};

export default MapPage;

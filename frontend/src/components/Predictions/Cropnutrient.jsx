import React, { useState, useRef } from "react";
import img13 from "../../assets/Img_13.jpeg";
import "./cropnutrient.css";
import { UserContext } from "../Hooks/UseContext";
export default function CropNutrient() {
  const [loading, setLoading] = useState(false);
  const [inputVideo, setInputVideo] = useState(null);
  const [outputVideo, setOutputVideo] = useState(null);

  const handleVideoChange = (e) => {  
    const file = e.target.files[0];
    if (file) {
      setInputVideo(file);
      setOutputVideo(null);
    }
  };

  async function analyzeHealth(e) {
    e.preventDefault();
    if (!inputVideo) return alert("Please upload a crop video.");

    setLoading(true);
    const formData = new FormData();
    formData.append("video", inputVideo);

    try {
      const response = await fetch("http://localhost:8000/predict_nutrient_deficiency", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error analyzing crop health");

      const blob = await response.blob();
      setOutputVideo(URL.createObjectURL(blob));
    } catch (error) {
      alert("Error analyzing crop health");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="crop-health-container">
      <div className="health-header card">
        <div className="header-content">
          <h2>Crop Health Video Analysis</h2>
          <p>Upload a video of your crop to analyze its health and nutrient status</p>
        </div>
        <div className="header-image">
          <img src={img13} alt="Crop Health Analysis" />
        </div>
      </div>

      <div className="analysis-section">
        <div className="upload-card card">
          <h3>Upload Crop Video</h3>
          <form onSubmit={analyzeHealth} className="upload-form">
            <div className="form-group">
              <label htmlFor="crop_video" className="file-input-label">
                <span className="file-input-icon">📁</span>
                <span className="file-input-text">
                  {inputVideo ? "Video Selected" : "Choose a video file"}
                </span>
                <input
                  type="file"
                  id="crop_video"
                  name="crop_video"
                  accept="video/mp4"
                  onChange={handleVideoChange}
                  required
                  className="file-input"
                />
              </label>
            </div>
            <button 
              type="submit" 
              className="analyze-button"
              disabled={loading || !inputVideo}
            >
              {loading ? "Analyzing..." : "Analyze Health"}
            </button>
          </form>
        </div>

        {inputVideo && (
          <div className="preview-card card">
            <h3>Input Video Preview</h3>
            <div className="video-container">
              <video 
                src={URL.createObjectURL(inputVideo)}
                controls
                className="preview-video"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>

      {outputVideo && (
        <div className="output-section card">
          <h3>Processed Video Analysis</h3>
          <div className="video-container">
            <video 
              src={outputVideo}
              controls
              className="output-video"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}


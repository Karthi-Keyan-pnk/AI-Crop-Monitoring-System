import React, { useState, useEffect } from "react";
import img5 from "../../assets/Img_5.jpeg";
import "./pestform.css";
import axios from "axios";

const fast_url = import.meta.env.VITE_FAST_URL;

export default function PestForm() {
  const [inputImage, setInputImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Clean up object URL
  useEffect(() => {
    return () => previewImage && URL.revokeObjectURL(previewImage);
  }, [previewImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const clearImage = () => {
    setInputImage(null);
    setPreviewImage(null);
    setResult(null);
  };

  const predictPest = async (e) => {
    e.preventDefault();
    if (!inputImage) return alert("Upload a pest image.");

    setLoading(true);
    const formData = new FormData();
    formData.append("image", inputImage);

    try {
      const res = await axios.post(`${fast_url}/predict_pest`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error detecting pest.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pest-form-container">
      <div className="pest-form-card">
        <div className="form-image-section">
          <img src={img5} alt="Pest Detection" className="form-image" />
          <div className="image-overlay">
            <h2>🐛 Pest Detection</h2>
            <p>Identify pests and get pesticide recommendations</p>
          </div>
        </div>

        <div className="form-content-section">
          <div className="form-header">
            <h3>Pest Detection & Pesticide Recommendation</h3>
            <p>Upload an image of the pest affecting your crops</p>
          </div>

          <form onSubmit={predictPest} className="pest-form">
            <div className="file-upload-area">
              <label htmlFor="pest_image" className="file-upload-label">
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  {previewImage ? "Image Selected" : "Choose an image file"}
                </div>
                <input
                  type="file"
                  id="pest_image"
                  name="pest_image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="file-input"
                />
              </label>

              {previewImage && (
                <div className="image-preview">
                  <img src={previewImage} alt="Selected pest" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={clearImage}
                  >
                    × Remove
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="detect-button"
              disabled={loading || !previewImage}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Detecting...
                </>
              ) : (
                <>
                  <span className="button-icon">🔍</span>
                  Detect Pest & Recommend
                </>
              )}
            </button>
          </form>

          {result && (
            <div className="pest-result">
              <h4>Detection Results</h4>
              <div className="result-cards">
                <div className="result-card">
                  <div className="card-icon">🐛</div>
                  <h5>Pest Identified</h5>
                  <p>{result.pest}</p>
                </div>
                <div className="result-card">
                  <div className="card-icon">🧪</div>
                  <h5>Recommended Pesticide</h5>
                  <p>{result.pesticide}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

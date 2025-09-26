import React, { useState } from "react";
import img5 from "../../assets/Img_5.jpeg";
import "./pestform.css"; // We'll create this CSS file
const fast_url = import.meta.env.VITE_FAST_URL;

export default function PestForm() {
  const [result, setResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function predictPest(e) {
    e.preventDefault();
    const file = e.target.pest_image.files[0];
    if (!file) return alert("Upload a pest image.");

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${fast_url}/predict_pest`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Error detecting pest");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setResult(null);
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
                  {selectedImage ? "Image Selected" : "Choose an image file"}
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
              
              {selectedImage && (
                <div className="image-preview">
                  <img src={selectedImage} alt="Selected pest" />
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="detect-button"
              disabled={loading || !selectedImage}
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


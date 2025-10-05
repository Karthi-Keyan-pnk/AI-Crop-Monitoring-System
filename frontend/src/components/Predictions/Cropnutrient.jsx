import React, { useContext, useState, useEffect } from "react";
import img13 from "../../assets/Img_13.jpeg";
import "./cropnutrient.css";
import { UserContext } from "../Hooks/UseContext";
import axios from "axios";
import { getUserId } from "../Hooks/userUtils";

const fast_url = import.meta.env.VITE_FAST_URL;

export default function CropNutrient() {
  const { user } = useContext(UserContext);

  const [inputImage, setInputImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setMobileNumber(user.phonenumber || "");
    }
  }, [user]);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputImage(file);
      setResult(null);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  
  const clearImage = () => {
    setInputImage(null);
    setImagePreview(null);
  };

  
  const analyzeNutrient = async (e) => {
    e.preventDefault();
    if (!inputImage) return alert("Please upload a crop image.");

    setLoading(true);

    const formData = new FormData();
    formData.append("image", inputImage);
    formData.append("mobile_number", mobileNumber);
    formData.append("email", email);

    try {
      const userId = getUserId();
      const response = await axios.post(
        `${fast_url}/predict_nutrient_deficiency`,
        formData,
        { 
          headers: { 
            'user-id': userId || ''
          } 
        }
      );
      setResult(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Please log in again to continue using the nutrient analysis features.");
      } else if (err.response?.status === 403) {
        alert("You don't have permission to access this feature. Please contact support.");
      } else {
        alert("Error analyzing crop nutrient deficiency. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-nutrient-container">
      <div className="header">
        <img src={img13} alt="Crop Nutrient" />
        <h2>Crop Nutrient Deficiency Detection</h2>
      </div>

      <div className="content-wrapper">
        
        <div className="image-preview-section">
          <h3>Uploaded Image</h3>
          <div className="image-preview-container">
            {imagePreview ? (
              <div className="preview-with-controls">
                <img
                  src={imagePreview}
                  alt="Uploaded crop"
                  className="uploaded-image"
                />
                <button
                  type="button"
                  className="clear-image-btn"
                  onClick={clearImage}
                >
                  × Remove Image
                </button>
              </div>
            ) : (
              <div className="placeholder-image">
                <div className="placeholder-icon">📷</div>
                <p>No image uploaded yet</p>
                <p className="placeholder-hint">Upload an image to get started</p>
              </div>
            )}
          </div>
        </div>

        
        <form onSubmit={analyzeNutrient} className="nutrient-form">
          <div className="file-input-container">
            <label htmlFor="image-upload" className="file-input-label">
              Choose field Image
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            <p className="file-input-hint">Supported formats: JPG, PNG, JPEG</p>
          </div>

          <input
            type="text"
            placeholder="Mobile Number"
            value={mobileNumber}
            readOnly
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            readOnly
          />

          <button type="submit" disabled={loading || !inputImage}>
            {loading ? (
              <>
                <span className="button-spinner"></span> Analyzing...
              </>
            ) : (
              <>
                <span className="button-icon">🔍</span> Analyze Nutrient Deficiency
              </>
            )}
          </button>
        </form>
      </div>

      
      {result && (
        <div className="nutrient-result">
          <h3>Analysis Results</h3>
          <div className="results-content">
            <div className="image-with-result">
              <div className="result-image-section">
                <h4>Analyzed Image</h4>
                <img
                  src={imagePreview}
                  alt="Analyzed crop"
                  className="analyzed-image"
                />
              </div>
              <div className="result-details">
                <h4>WhatsApp Messages</h4>
                <ul>
                  {result.whatsapp_messages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
                {result.whatsapp_url && (
                  <a
                    href={result.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn"
                  >
                    📱 Send Message on WhatsApp
                  </a>
                )}
                {result.email_sent_to && (
                  <div className="email-confirmation">
                    <span>✅ Email sent to: {result.email_sent_to}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

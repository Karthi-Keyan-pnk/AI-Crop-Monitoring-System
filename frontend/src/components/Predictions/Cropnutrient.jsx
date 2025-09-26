import React, { useContext, useState, useEffect } from "react";
import img13 from "../../assets/Img_13.jpeg";
import "./cropnutrient.css";
import { UserContext } from "../Hooks/UseContext";
import axios from 'axios';
const fast_url = import.meta.env.VITE_FAST_URL;

export default function CropNutrient() {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [inputImage, setInputImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
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

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setInputImage(null);
    setImagePreview(null);
  };

  async function analyzeNutrient(e) {
    e.preventDefault();
    if (!inputImage) return alert("Please upload a crop image.");
    if (!mobileNumber) return alert("Please enter your mobile number.");
    if (!email) return alert("Please enter your email address.");



    const formData = new FormData();
    formData.append("image", inputImage);
    formData.append("mobile_number", mobileNumber);
    formData.append("email", email);

    try {
      const response = await axios.post(
        `${fast_url}/predict_nutrient_deficiency`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setLoading(true);
      setResult(response.data);
    } catch (error) {
      alert("Error analyzing crop nutrient deficiency");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

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
                  alt="Uploaded crop preview"
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
            placeholder="Enter your mobile number"
            value={mobileNumber}
            onChange={e => setMobileNumber(e.target.value)}
            readOnly
            required
          />
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            readOnly
            required
          />
          <button
            type="submit"
            disabled={loading || !inputImage} 
          >
            {loading ? "Analyzing..." : "Analyze Nutrient Deficiency"}
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

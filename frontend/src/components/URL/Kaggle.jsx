import React, { useEffect } from "react";

const Kaggle = () => {


  useEffect(() => {
    window.location.href = `https://www.kaggle.com/datasets/sanjai2005/agri-land-drone-image-dataset`;
  }, []);

  return (
    <div>
      <p>Redirecting to Kaggle...</p>
    </div>
  );
};

export default Kaggle;

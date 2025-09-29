import React, { useEffect } from "react";

const Kaggle = () => {


  useEffect(() => {
    window.location.href = `https://www.kaggle.com/datasets/vijayakanthm23alr121/aerial`;
  }, []);

  return (
    <div>
      <p>Redirecting to Kaggle...</p>
    </div>
  );
};

export default Kaggle;

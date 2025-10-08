import React, { useEffect } from "react";

const Github = () => {


  useEffect(() => {
    window.location.href = `https://github.com/Nishanth-cyber/AI-Crop-Monitoring-System/`;
  }, []);

  return (
    <div>
      <p>Redirecting to Github...</p>
    </div>
  );
};

export default Github;

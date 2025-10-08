import React, { useEffect } from "react";

const Plantix = () => {


  useEffect(() => {
    window.location.href = `https://play.google.com/store/apps/details?id=com.peat.GartenBank`;
  }, []);

  return (
    <div>
      <p>Redirecting to PLANTIX...</p>
    </div>
  );
};

export default Plantix;

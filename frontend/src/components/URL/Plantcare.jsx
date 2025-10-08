import React, { useEffect } from "react";

const Plantcare = () => {


  useEffect(() => {
    window.location.href = `https://play.google.com/store/apps/details?id=com.rethinkandrevive1.golddustgardening&pli=1 `;
  }, []);

  return (
    <div>
      <p>Redirecting to PLANT CARE & GARDEN GOLDDUST...</p>
    </div>
  );
};

export default Plantcare;

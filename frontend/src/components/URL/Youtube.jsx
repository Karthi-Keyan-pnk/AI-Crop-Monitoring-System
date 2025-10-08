import React, { useEffect } from "react";

const YoutubeRedirect = () => {


  useEffect(() => {
    window.location.href = `https://drive.google.com/file/d/1DrujLuhAIxXsu0o57sn6hLygPqiZrPpo/view?usp=sharing`;
  }, []);

  return (
    <div>
      <p>Redirecting to Google Drive...</p>
    </div>
  );
};

export default YoutubeRedirect;

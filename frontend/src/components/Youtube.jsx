import React, { useEffect } from "react";

const YoutubeRedirect = () => {


  useEffect(() => {
    window.location.href = `https://youtu.be/8FfhJK1HJME?si=9wgIr1vFvVlcbXaz`;
  }, []);

  return (
    <div>
      <p>Redirecting to YouTube...</p>
    </div>
  );
};

export default YoutubeRedirect;

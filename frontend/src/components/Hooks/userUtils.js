// Utility function to get user identifier for API calls
export const getUserId = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("user"));
    return user?._id || null;
  } catch (error) {
    console.error("Error parsing user data from sessionStorage:", error);
    return null;
  }
};

// Helper function to add user-id header to axios requests
export const addUserIdHeader = (config) => {
  const userId = getUserId();
  if (userId) {
    config.headers = {
      ...config.headers,
      'user-id': userId
    };
  }
  return config;
};

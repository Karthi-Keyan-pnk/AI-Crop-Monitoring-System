import { Navigate } from "react-router-dom";
import { UserContext } from "./Hooks/UseContext";
import { useContext } from "react";
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

if (!user) {
  return <Navigate to="/login" replace />;
}

return children;

};

export default ProtectedRoute;
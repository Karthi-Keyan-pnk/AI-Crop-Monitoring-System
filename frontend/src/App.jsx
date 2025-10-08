import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Hero from "./components/Hero";
import DiseaseDetection from "./components/Predictions/Disease";
import Predictions from "./components/Predictions";
import PestAnalysis from "./components/Predictions/PestForm";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Crophealth from "./components/Predictions/Cropnutrient";
import { UserProvider } from "./components/Hooks/UseContext";
import Youtube from './components/URL/Youtube';
import Kaggle from './components/URL/Kaggle';
import Github from './components/URL/Github';
import Plantix from './components/URL/Plantix';
import Plantcare from './components/URL/Plantcare';
import Dashboard from "./components/Dashboard";
import MapPage from "./components/MapPage"; 

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

       
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Hero />} />
          <Route path="predict" element={<Predictions />} />
          <Route path="pest" element={<PestAnalysis />} />
          <Route path="disease" element={<DiseaseDetection />} />
          <Route path="crophea" element={<Crophealth />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="map" element={<MapPage />} /> 
        </Route>

       
        <Route path="/demo-video" element={<Youtube />} />
        <Route path="/kaggle-ref" element={<Kaggle />} />
        <Route path="/github-url" element={<Github />} />
        <Route path="/exist-1" element={<Plantix />} />
        <Route path="/exist-2" element={<Plantcare />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserProvider>
  );
}

export default App;

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import RegisterPage from "../src/layout/pages/auth/RegisterPage";
import LoginPage from "../src/layout/pages/auth/Login";
import DashboardPage from "../src/Component/auth/Home/Home";
import Home from "./api/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Home />}>
          <Route path="/home" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
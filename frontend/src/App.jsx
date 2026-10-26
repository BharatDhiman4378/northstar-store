
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import RegisterPage from "./layout/pages/auth/RegisterPage";
import LoginPage from "./layout/pages/auth/Login";
import DashboardPage from "./Component/auth/Home/Home";
import Home from "./api/ProtectedRoute";

import ProductPage from "./layout/pages/auth/ProductsPage";
import ProductDetailPage from "./layout/pages/auth/ProductDetailPage";
import CartPage from "./layout/pages/auth/CartPage";
import StoreLayout from "./layout/pages/auth/StoreLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/products" replace />}
        />

        {/* Public authentication routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected dashboard */}
        <Route element={<Home />}>
          <Route path="/home" element={<DashboardPage />} />
        </Route>

        {/* Public storefront with shared header and footer */}
        <Route element={<StoreLayout />}>
          <Route path="/products" element={<ProductPage />} />
          <Route
            path="/products/:id"
            element={<ProductDetailPage />}
          />
          <Route path="/cart" element={<CartPage />} />
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/products" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { Route, Routes } from "react-router-dom";
import { AuthLayout, GuestLayout } from "./components/layouts/Layout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/main/Home";
import BuilderPage from "./pages/main/Builder";
import PreviewPage from "./pages/main/Preview";
import { useEffect } from "react";
import { useStore } from "@/stores/store";

function App() {
  const checkSession = useStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder/:id" element={<BuilderPage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Route>
    </Routes>
  );
}

export default App;

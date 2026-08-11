import { Route, Routes } from "react-router-dom";
import { AuthLayout, GuestLayout } from "./components/layouts/Layout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/main/Home";
import BuilderPage from "./pages/main/Builder";
import PreviewPage from "./pages/main/Preview";
import { useEffect } from "react";
import { useStore } from "@/stores/store";
import { supabase } from "./lib/supabaseClient";
import Publish from "./pages/main/Publish";

function App() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      useStore.setState({
        user: session?.user ?? null,
        isCheckingSession: false,
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />

      {/* Protected Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/builder/:id" element={<BuilderPage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Route>

      {/* Publish Routes */}
      <Route path="/publish/:id" element={<Publish />} />
    </Routes>
  );
}

export default App;

import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import AdminMain from "./pages/admin/AdminMain";
import Dashboard from "./pages/admin/Dashboard";
import FacultyInfo from "./pages/admin/FacultyInfo";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <AdminMain>
              <Dashboard />
            </AdminMain>
          }
        />
        <Route
          path="/faculty-info"
          element={
            <AdminMain>
              <FacultyInfo />
            </AdminMain>
          }
        />
      </Routes>
    </Router>
  );
}

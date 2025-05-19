import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
{/* for programchairperson*/}
import AdminMain from "./pages/programchairperson/AdminMain";
import Dashboard from "./pages/programchairperson/Dashboard";
import FacultyInfo from "./pages/programchairperson/FacultyInfo";
import LiveVideo from "./pages/programchairperson/LiveVideo";
import Schedule from "./pages/programchairperson/Schedule";
import UserMain from "./pages/user/UserMain";
import FacultyReports from "./pages/programchairperson/FacultyReports";
{/* for faculty*/}
import UpdateCredentials from "./pages/user/UpdateCredentials";
import FacultyDashboard from "./pages/user/FacultyDashboard";
import FacultySchedule from "./pages/user/FacultySchedule";
import { FacultyProvider } from "./context/FacultyContext";
{/* for superadmin*/}
import SuperadminMain from "./pages/superadmin/SuperadminMain";
import SuperadminDashboard from "./pages/superadmin/SuperadminDashboard";
import DeanInfo from "./pages/superadmin/DeanInfo";
import ProgramChairInfoOnly from "./pages/superadmin/ProgramChairInfoOnly";
import InstructorInfoOnly from "./pages/superadmin/InstructorInfoOnly";

{/* for dean*/}
import DeanMain from "./pages/dean/DeanMain";
import DeanDashboard from "./pages/dean/DeanDashboard";
import ProgramchairInfo from "./pages/dean/ProgramchairInfo";
import DeanLiveVideo from "./pages/dean/DeanLiveVideo";



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route path="/update-credentials/:id" element={<UpdateCredentials />} />

        {/* Superadmin Routes */}
        <Route
          path="/superadmin-dashboard/:id"
          element={
            <SuperadminMain>
              <SuperadminDashboard />
            </SuperadminMain>
          }
        />

        <Route
          path="/dean-info/:id"
          element={
            <SuperadminMain>
              <DeanInfo />
            </SuperadminMain>
          }
        />

        <Route
          path="/programchairinfo-only/:id"
          element={
            <SuperadminMain>
              <ProgramChairInfoOnly />
            </SuperadminMain>
          }
        />

        <Route
          path="/instructorinfo-only/:id"
          element={
            <SuperadminMain>
              <InstructorInfoOnly />
            </SuperadminMain>
          }
        />

        {/* Dean Routes */}
        <Route
          path="/dean-dashboard/:id"
          element={
            <DeanMain>
              <DeanDashboard />
            </DeanMain>
          }
        />

        <Route
          path="/programchair-info/:id"
          element={
            <FacultyProvider>
              <DeanMain>
                <ProgramchairInfo />
              </DeanMain>
            </FacultyProvider>
          }
        />

        <Route
          path="/deanlivevideo/:id"
          element={
              <DeanMain>
                <DeanLiveVideo />
              </DeanMain>
          }
        />


        {/* User Routes */}
        <Route
          path="/faculty-dashboard/:id"
          element={
            <UserMain>
              <FacultyDashboard />
            </UserMain>
          }
        />

        <Route
          path="/user-schedule/:id"
          element={
            <UserMain>
              <FacultySchedule />
            </UserMain>
          }
        />

        {/* Programchairperson Routes */}
        <Route
          path="/dashboard/:id"
          element={
            <AdminMain>
              <Dashboard />
            </AdminMain>
          }
        />

        <Route
          path="/faculty-info/:id"
          element={
            <FacultyProvider>
              <AdminMain>
                <FacultyInfo />
              </AdminMain>
            </FacultyProvider>
          }
        />

        <Route
          path="/live-video/:id"
          element={
            <AdminMain>
              <LiveVideo />
            </AdminMain>
          }
        />

        <Route
          path="/schedule/:id"
          element={
            <AdminMain>
              <Schedule />
            </AdminMain>
          }
        />

        <Route
          path="/faculty-reports/:id"
          element={
              <AdminMain>
                <FacultyReports />
              </AdminMain>
          }
        />
      </Routes>
    </Router>
  );
}

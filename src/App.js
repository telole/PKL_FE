// import logo from './logo.svg';
// import './App.css';
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./views/admin/Login";
import MainDashboard from "./views/admin/MainDashboard";
import Studentmanagement from "./views/admin/StudentManagement";
import StoreStudent from "./composables/cards/StudentManagementCard/StoreStudentDataPanel";
import Document from "./views/admin/StudentDocument";
import Location from "./views/admin/Location";
import Teachermanagement from "./views/admin/Teachermanagement";
import CompaniesPartner from "./views/admin/CompaniesPartner";
import Statistics from "./views/admin/Statistics";
import StudentDashboard from "./views/student/Dashboard";
import LocationStudent from "./views/student/LocationStudent";
import ActivityStudent from "./views/student/ActivityStudent";
import DocumentStudent from "./views/student/DocumentStudent";
import CreateReports from "./views/student/CreateReports";
import Progress from "./views/student/Progress";
import PresenceStudent from "./views/student/PresenceStudent";
import PresenceAdmin from "./views/admin/PresenceAdmin";
import { RequireAuth } from "./composables/hooks/useAuth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <RequireAuth roles={["student"]}>
              <StudentDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/home/locations"
          element={
            <RequireAuth roles={["student"]}>
              <LocationStudent />
            </RequireAuth>
          }
        />
        <Route
          path="/home/activities"
          element={
            <RequireAuth roles={["student"]}>
              <ActivityStudent />
            </RequireAuth>
          }
        />
        <Route
          path="/home/reports"
          element={
            <RequireAuth roles={["student"]}>
              <DocumentStudent />
            </RequireAuth>
          }
        />
        <Route
          path="/home/reports/create"
          element={
            <RequireAuth roles={["student"]}>
              <CreateReports />
            </RequireAuth>
          }
        />
        <Route
          path="/home/progress"
          element={
            <RequireAuth roles={["student"]}>
              <Progress />
            </RequireAuth>
          }
        />
        <Route
          path="/home/presence"
          element={
            <RequireAuth roles={["student"]}>
              <PresenceStudent />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth roles={["teacher", "admin", "supervisor"]}>
              <MainDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/management"
          element={
            <RequireAuth roles={["teacher", "admin", "supervisor"]}>
              <Studentmanagement />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/Student"
          element={
            <RequireAuth roles={["teacher", "admin", "supervisor"]}>
              <StoreStudent />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/document"
          element={
            <RequireAuth roles={["teacher", "admin", "supervisor"]}>
              <Document />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/teacher"
          element={
            <RequireAuth roles={["teacher", "admin", "supervisor"]}>
              <Teachermanagement />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/locations"
          element={
            <RequireAuth roles={["teacher", "admin", "supervisor"]}>
              <Location />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/partners"
          element={
            <RequireAuth roles={["teacher", "admin", "supervisor"]}>
              <CompaniesPartner />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/presences"
          element={
            <RequireAuth roles={["teacher", "admin", "supervisor"]}>
              <PresenceAdmin />
            </RequireAuth>
          }
        />
        <Route
          path="/statistics"
          element={
            <RequireAuth roles={["teacher", "admin", "supervisor"]}>
              <Statistics />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

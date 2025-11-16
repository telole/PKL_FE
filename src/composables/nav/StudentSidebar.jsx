import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  FileText,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../hooks/UseApi";
import { useSetError } from "../hooks/SetError";

export default function StudentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = api();
  const token = localStorage.getItem("token");
  const { setError } = useSetError();

  function isActive(path) {
    return location.pathname === path;
  }

  function handleLogout() {
    const confirmLogout = window.confirm("Logout sekarang?");
    if (!confirmLogout) return;

    axios
      .post(
        "/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("role");
        navigate("/");
      })
      .catch((err) => {
        setError(err, "Gagal melakukan logout.");
      });
  }

  return (
    <aside className="w-64 bg-white border-r shadow-sm min-h-screen">
      <nav className="p-6">
        <div className="text-center py-4 border-b border-gray-200 mb-4">
          <h1 className="text-lg font-semibold text-gray-800">Sistem PKL - Siswa</h1>
        </div>
        
        <p className="text-gray-400 uppercase text-xs mb-2">Navigasi</p>
        <ul className="space-y-2 mb-6">
          <li>
            <Link
              to="/home"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/home")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-50 text-gray-700"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/home/locations"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/home/locations")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-50 text-gray-700"
              }`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Lokasi PKL
            </Link>
          </li>
          <li>
            <Link
              to="/home/activities"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/home/activities")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-50 text-gray-700"
              }`}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Kegiatan PKL
            </Link>
          </li>
          <li>
            <Link
              to="/home/reports"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/home/reports")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-50 text-gray-700"
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Laporan Harian
            </Link>
          </li>
          <li>
            <Link
              to="/home/progress"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/home/progress")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-50 text-gray-700"
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Progres PKL
            </Link>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </button>
      </nav>
    </aside>
  );
}
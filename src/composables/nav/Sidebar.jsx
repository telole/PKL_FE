import {
  Home,
  Users,
  FileText,
  UserCheck,
  MapPin,
  FileBarChart,
  BarChart,
  Building2,
  LogOut
} from "lucide-react";
import { api } from "../hooks/hooks";
import { useNavigate, Link, useLocation } from "react-router-dom";

function Sidebar() {
  const axios = api();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 ambil path aktif
  const token = localStorage.getItem("token");

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
        console.error("Logout gagal:", err.response?.data || err.message);
      });
  }

  // Helper function untuk menentukan menu aktif
  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <aside className="w-64 bg-white min-h-screen border-r">
      <nav className="p-4">
        <p className="text-gray-400 uppercase text-xs mb-2">Administrasi</p>
        <ul className="space-y-2 mb-6">
          <li>
            <Link
              to="/admin"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/admin")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <Home
                className={`w-4 h-4 mr-2 ${
                  isActive("/admin") ? "text-blue-600" : ""
                }`}
              />
              Dashboard Admin
            </Link>
          </li>
          <li>
            <Link
              to="/admin/management"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/admin/management")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <Users
                className={`w-4 h-4 mr-2 ${
                  isActive("/admin/management") ? "text-blue-600" : ""
                }`}
              />
              <span>Manajemen Siswa</span>
            </Link>
          </li>
          <li>
            <Link
              to="/documents"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/documents")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Dokumen Siswa
            </Link>
          </li>
          <li>
            <Link
              to="/supervisors"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/supervisors")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Pembimbing PKL
            </Link>
          </li>
        </ul>

        <p className="text-gray-400 uppercase text-xs mb-2">Monitoring</p>
        <ul className="space-y-2 mb-6">
          <li>
            <Link
              to="/locations"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/locations")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Lokasi PKL
            </Link>
          </li>
          <li>
            <Link
              to="/reports"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/reports")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <FileBarChart className="w-4 h-4 mr-2" />
              Laporan Siswa
            </Link>
          </li>
          <li>
            <Link
              to="/statistics"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/statistics")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <BarChart className="w-4 h-4 mr-2" />
              Statistik
            </Link>
          </li>
          <li>
            <Link
              to="/partners"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/partners")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Perusahaan Partner
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

export default Sidebar;

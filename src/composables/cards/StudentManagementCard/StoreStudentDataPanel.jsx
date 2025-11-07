import MainPanel from "../../nav/MainPanel";
import Sidebar from "../../nav/Sidebar";
import { useNavigate } from "react-router-dom";
import { Search, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useSetError } from "../../hooks/SetError";

export default function StoreStudent() {
  const navigate = useNavigate();
  const { setError, setValidationErrors } = useSetError();

  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    nis: "",
    class: "",
    major: "",
    phone: "",
    address: "",
    KELAS: "",
    photo_path: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await axios.post("students", form);
      alert(res.data.message);
      navigate("/admin/management"); 
    } catch (err) {
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors || {};
        setErrors(setValidationErrors(validationErrors));
      } else {
        setError(err, "Terjadi kesalahan server. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      username: "",
      password: "",
      full_name: "",
      email: "",
      nis: "",
      class: "",
      major: "",
      phone: "",
      address: "",
      KELAS: "",
      photo_path: "",
    });
    setErrors({});
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <MainPanel />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-blue-600"/>
                <h2 className="text-lg font-semibold text-gray-800">
                  Manajemen Data Siswa
                </h2>
              </div>
              <p className="text-sm text-gray-500">
                Kelola data siswa PKL bidang Teknologi Jaringan Komputer & Pemrograman
              </p>
            </div>
          </div>

         <div className="flex flex-col sm:flex-row items-center bg-white shadow-sm rounded-lg p-4 mb-6 gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari siswa berdasarkan nama, NIS, kelas, atau spesialisasi..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
              <UserPlus className="w-4 h-4" /> Tambah Siswa
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">Username *</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.username && (
                <p className="text-red-600 text-xs mt-1">{errors.username[0]}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password[0]}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Nama Lengkap *</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.full_name ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.full_name && (
                <p className="text-red-600 text-xs mt-1">{errors.full_name[0]}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">NIS *</label>
              <input
                type="text"
                name="nis"
                value={form.nis}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.nis ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.nis && (
                <p className="text-red-600 text-xs mt-1">{errors.nis[0]}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Kelas *</label>
              <input
                type="text"
                name="class"
                value={form.class}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.class ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.class && (
                <p className="text-red-600 text-xs mt-1">{errors.class[0]}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Jurusan *</label>
              <input
                type="text"
                name="major"
                value={form.major}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.major ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.major && (
                <p className="text-red-600 text-xs mt-1">{errors.major[0]}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Telepon</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.phone && (
                <p className="text-red-600 text-xs mt-1">{errors.phone[0]}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-gray-700">Alamat</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.address ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.address && (
                <p className="text-red-600 text-xs mt-1">{errors.address[0]}</p>
              )}
            </div>

            {/* KELAS */}
            <div>
              <label className="text-sm font-medium text-gray-700">KELAS</label>
              <input
                type="text"
                name="KELAS"
                value={form.KELAS}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.KELAS ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.KELAS && (
                <p className="text-red-600 text-xs mt-1">{errors.KELAS[0]}</p>
              )}
            </div>

            {/* Photo Path */}
            <div>
              <label className="text-sm font-medium text-gray-700">Path Foto</label>
              <input
                type="text"
                name="photo_path"
                value={form.photo_path}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.photo_path ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.photo_path && (
                <p className="text-red-600 text-xs mt-1">{errors.photo_path[0]}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex justify-end mt-4 space-x-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-100"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-md text-sm text-white ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

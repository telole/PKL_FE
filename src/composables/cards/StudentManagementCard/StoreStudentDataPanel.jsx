import MainPanel from "../../nav/MainPanel";
import Sidebar from "../../nav/Sidebar";
import { useNavigate } from "react-router-dom";
import { Search, UserPlus, Users, Building2, GraduationCap, UserCheck } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSetError } from "../../hooks/SetError";
import { useSetLoading } from "../../hooks/setLoading";
import { useToast } from "../../hooks/useToast";
import { api } from "../../hooks/UseApi";

export default function StoreStudent() {
  const navigate = useNavigate();
  const { setError, setValidationErrors } = useSetError();
  const { showNotif } = useToast();
  const axiosApi = useMemo(() => api(), []);

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
    company_id: "",
    teacher_id: "",
    supervisor_id: "",
    internship_title: "",
    internship_description: "",
    internship_status: "pending",
    internship_notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useSetLoading(false);
  const [companies, setCompanies] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Fetch options for dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        
        const companiesRes = await axiosApi.get("companie");
        setCompanies(companiesRes.data.data || []);

        const teachersRes = await axiosApi.get("teachers");
        const teachersData = teachersRes.data.Data || teachersRes.data.data || [];
        setTeachers(Array.isArray(teachersData) ? teachersData : []);

        const supervisorsRes = await axiosApi.get("supervisors");
        setSupervisors(supervisorsRes.data.data || supervisorsRes.data.Data || []);
      } catch (err) {
        setError(err, "Gagal memuat data untuk dropdown.");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await axiosApi.post("students", form);
      showNotif("success", res.data.message || "Data siswa berhasil ditambahkan.");
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
      company_id: "",
      teacher_id: "",
      supervisor_id: "",
      internship_title: "",
      internship_description: "",
      internship_status: "pending",
      internship_notes: "",
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

            {/* Divider for Internship Section */}
            <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
              <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Informasi PKL
              </h3>
            </div>

            {/* Company */}
            <div>
              <label className="text-sm font-medium text-gray-700">Perusahaan *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <select
                  name="company_id"
                  value={form.company_id}
                  onChange={handleChange}
                  disabled={loadingOptions}
                  className={`mt-1 w-full border rounded-md p-2 pl-10 text-sm ${
                    errors.company_id ? "border-red-500" : "border-gray-300"
                  } focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                >
                  <option value="">Pilih Perusahaan</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.company_id && (
                <p className="text-red-600 text-xs mt-1">{errors.company_id[0]}</p>
              )}
            </div>

            {/* Teacher */}
            <div>
              <label className="text-sm font-medium text-gray-700">Pembimbing Sekolah *</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <select
                  name="teacher_id"
                  value={form.teacher_id}
                  onChange={handleChange}
                  disabled={loadingOptions}
                  className={`mt-1 w-full border rounded-md p-2 pl-10 text-sm ${
                    errors.teacher_id ? "border-red-500" : "border-gray-300"
                  } focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                >
                  <option value="">Pilih Pembimbing</option>
                  {teachers.map((teacher) => {
                    const user = Array.isArray(teacher.users) ? teacher.users[0] : teacher.users;
                    return (
                      <option key={teacher.id} value={teacher.id}>
                        {user?.full_name || `Pembimbing ${teacher.id}`} {teacher.spesialis ? `- ${teacher.spesialis}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              {errors.teacher_id && (
                <p className="text-red-600 text-xs mt-1">{errors.teacher_id[0]}</p>
              )}
            </div>

            {/* Supervisor */}
            <div>
              <label className="text-sm font-medium text-gray-700">Supervisor Perusahaan *</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <select
                  name="supervisor_id"
                  value={form.supervisor_id}
                  onChange={handleChange}
                  disabled={loadingOptions}
                  className={`mt-1 w-full border rounded-md p-2 pl-10 text-sm ${
                    errors.supervisor_id ? "border-red-500" : "border-gray-300"
                  } focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                >
                  <option value="">Pilih Supervisor</option>
                  {supervisors.map((supervisor) => {
                    const user = Array.isArray(supervisor.users) ? supervisor.users[0] : supervisor.users;
                    return (
                      <option key={supervisor.id} value={supervisor.id}>
                        {user?.full_name || `Supervisor ${supervisor.id}`} {supervisor.position ? `- ${supervisor.position}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              {errors.supervisor_id && (
                <p className="text-red-600 text-xs mt-1">{errors.supervisor_id[0]}</p>
              )}
            </div>

            {/* Internship Title */}
            <div>
              <label className="text-sm font-medium text-gray-700">Judul PKL *</label>
              <input
                type="text"
                name="internship_title"
                value={form.internship_title}
                onChange={handleChange}
                placeholder="Contoh: PKL M. Deni F"
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.internship_title ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.internship_title && (
                <p className="text-red-600 text-xs mt-1">{errors.internship_title[0]}</p>
              )}
            </div>

            {/* Internship Status */}
            <div>
              <label className="text-sm font-medium text-gray-700">Status PKL *</label>
              <select
                name="internship_status"
                value={form.internship_status}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.internship_status ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              {errors.internship_status && (
                <p className="text-red-600 text-xs mt-1">{errors.internship_status[0]}</p>
              )}
            </div>

            {/* Internship Description */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Deskripsi PKL</label>
              <textarea
                name="internship_description"
                value={form.internship_description}
                onChange={handleChange}
                placeholder="Contoh: PKL di perusahaan Digital Nusantara"
                rows={3}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.internship_description ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.internship_description && (
                <p className="text-red-600 text-xs mt-1">{errors.internship_description[0]}</p>
              )}
            </div>

            {/* Internship Notes */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Catatan PKL</label>
              <textarea
                name="internship_notes"
                value={form.internship_notes}
                onChange={handleChange}
                placeholder="Catatan tambahan untuk PKL"
                rows={2}
                className={`mt-1 w-full border rounded-md p-2 text-sm ${
                  errors.internship_notes ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.internship_notes && (
                <p className="text-red-600 text-xs mt-1">{errors.internship_notes[0]}</p>
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

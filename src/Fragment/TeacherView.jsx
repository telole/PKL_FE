import { useEffect, useState, useMemo } from "react";
import { api } from "../composables/hooks/UseApi";
import { useSetError } from "../composables/hooks/SetError";
import { useToast } from "../composables/hooks/useToast";
import { Edit, Mail, Phone, Search, Trash2, UserPlus, Users, X, Loader2 } from "lucide-react";

export default function TeacherView() { 
  const axios = useMemo(() => api(), []);
  const { setError, setValidationErrors } = useSetError();
  const { showNotif } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    nip: "",
    spesialis: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("teachers");
        const list = res?.data?.Data || res?.data?.data || [];
        setTeachers(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err, "Gagal memuat data pembimbing.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const filtered = teachers.filter((t) => {
    const user = Array.isArray(t.users) ? t.users[0] : t.users;
    const hay = [
      user?.full_name,
      user?.email,
      t.spesialis,
      t.phone,
      user?.username,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitLoading(true);

    try {
      const res = await axios.post("teachers", form);
      showNotif("success", res.data.message || "Pembimbing berhasil ditambahkan.");
      setIsModalOpen(false);
      setForm({
        username: "",
        password: "",
        full_name: "",
        email: "",
        nip: "",
        spesialis: "",
        phone: "",
      });
      // Refresh the list
      const refreshTeachers = async () => {
        try {
          const res = await axios.get("teachers");
          const list = res?.data?.Data || res?.data?.data || [];
          setTeachers(Array.isArray(list) ? list : []);
        } catch (err) {
          setError(err, "Gagal memuat data pembimbing.");
        }
      };
      refreshTeachers();
    } catch (err) {
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors || {};
        setErrors(setValidationErrors(validationErrors));
      } else {
        setError(err, "Terjadi kesalahan saat menambahkan pembimbing.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm({
      username: "",
      password: "",
      full_name: "",
      email: "",
      nip: "",
      spesialis: "",
      phone: "",
    });
    setErrors({});
  };

  return (
    <main className="flex-1 p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-600"></Users>
          <h2 className="text-lg font-semibold text-gray-800">Manajemen Pembimbing PKL</h2>
        </div>
        <p className="text-sm text-gray-500">
          Kelola data pembimbing dan penugasan siswa PKL.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"></Search>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Cari pembimbing berdasarkan nama, spesialisasi, atau email..."
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
        >
          <UserPlus className="w-4 h-4"></UserPlus> Tambah Pembimbing
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Memuat data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">Tidak ada data.</div>
          ) : (
            filtered.map((t) => {
              const user = Array.isArray(t.users) ? t.users[0] : t.users;
              const internships = Array.isArray(t.internships) ? t.internships : [];
              const superviseCount = internships.length;
              return (
                <div key={t.id} className="bg-blue-50 rounded-lg border p-4 relative h-64 flex flex-col">
                  <div className="absolute top-3 right-3 flex space-x-2 text-gray-500">
                    <Edit className="w-4 h-4 cursor-pointer hover:text-blue-600"></Edit>
                    <Trash2 className="w-4 h-4 cursor-pointer hover:text-red-600"></Trash2>
                  </div>
                  <h3 className="text-gray-900 font-semibold">{user?.full_name || user?.username || '-'}</h3>
                  <p className="text-sm text-gray-600 mb-2">Guru {t.spesialis || 'Spesialisasi tidak tersedia'}</p>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">{t.spesialis || 'General'}</span>

                  <div className="mt-3 space-y-1 text-sm text-gray-700">
                    <p><Mail className="inline w-4 h-4 mr-1"></Mail> {user?.email || '-'}</p>
                    <p><Phone className="inline w-4 h-4 mr-1"></Phone> {t.phone || '-'}</p>
                  </div>

                  <div className="mt-3 text-sm text-gray-700 flex-1 overflow-auto pr-1">
                    <p className="font-medium">Siswa Bimbingan ({superviseCount})</p>
                    {superviseCount > 0 ? (
                      internships.slice(0, 3).map((internship) => {
                        const student = internship?.students;
                        const studentUser = student?.users;
                        const studentName = studentUser?.full_name || studentUser?.username || '-';
                        const studentClass = student?.KELAS || student?.class || '-';
                        return (
                          <p key={internship.id}>
                            <i data-lucide="user" className="inline w-4 h-4 mr-1"></i> {studentName} - {studentClass}
                          </p>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-xs">Belum ada siswa bimbingan</p>
                    )}
                    {superviseCount > 3 && (
                      <p className="text-gray-500 text-xs mt-1">dan {superviseCount - 3} siswa lainnya...</p>
                    )}
                    {superviseCount > 0 && (
                      <button type="button" className="text-blue-600 text-sm mt-1 inline-block"></button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Tambah Pembimbing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">Tambah Pembimbing</h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    } focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Masukkan username"
                  />
                  {errors.username && (
                    <p className="text-red-600 text-xs mt-1">
                      {Array.isArray(errors.username) ? errors.username[0] : errors.username}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Minimal 6 karakter"
                  />
                  {errors.password && (
                    <p className="text-red-600 text-xs mt-1">
                      {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                    </p>
                  )}
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm ${
                      errors.full_name ? "border-red-500" : "border-gray-300"
                    } focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.full_name && (
                    <p className="text-red-600 text-xs mt-1">
                      {Array.isArray(errors.full_name) ? errors.full_name[0] : errors.full_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="contoh@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1">
                      {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                    </p>
                  )}
                </div>

                {/* NIP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIP
                  </label>
                  <input
                    type="text"
                    name="nip"
                    value={form.nip}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm ${
                      errors.nip ? "border-red-500" : "border-gray-300"
                    } focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Nomor Induk Pegawai (opsional)"
                  />
                  {errors.nip && (
                    <p className="text-red-600 text-xs mt-1">
                      {Array.isArray(errors.nip) ? errors.nip[0] : errors.nip}
                    </p>
                  )}
                </div>

                {/* Spesialis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spesialis
                  </label>
                  <input
                    type="text"
                    name="spesialis"
                    value={form.spesialis}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm ${
                      errors.spesialis ? "border-red-500" : "border-gray-300"
                    } focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Bidang spesialisasi (opsional)"
                  />
                  {errors.spesialis && (
                    <p className="text-red-600 text-xs mt-1">
                      {Array.isArray(errors.spesialis) ? errors.spesialis[0] : errors.spesialis}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telepon
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Nomor telepon (opsional)"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-xs mt-1">
                      {Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={submitLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Tambah Pembimbing
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
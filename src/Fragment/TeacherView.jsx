import { useEffect, useState } from "react";
import { api } from "../composables/hooks/UseApi";
import { useSetError } from "../composables/hooks/SetError";
import { Edit, Mail, Phone, Search, Trash2, UserPlus, Users } from "lucide-react";

export default function TeacherView() { 
  const axios = api();
  const { setError } = useSetError();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

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
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md flex items-center gap-2 text-sm">
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
    </main>
  )
}
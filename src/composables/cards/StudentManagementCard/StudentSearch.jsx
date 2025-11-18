import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { api } from "../../hooks/UseApi";
import { useSetError } from "../../hooks/SetError";
import { useToast } from "../../hooks/useToast";

export default function StudentSearch() {
  const axios = api();
  const { setError } = useSetError();
  const { showNotif } = useToast();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get("students")
      .then((res) => {
        const data = res.data.students || res.data;
        setStudents(data);
        setFiltered(data);
      })
      .catch((err) => setError(err, "Gagal mengambil data siswa."));
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filteredData = students.filter(
      (s) =>
        s.name?.toLowerCase().includes(value) ||
        s.nis?.toString().includes(value) ||
        s.class?.toLowerCase().includes(value) ||
        s.location?.toLowerCase().includes(value) ||
        s.specialization?.toLowerCase().includes(value)
    );
    setFiltered(filteredData);
  };

  const handleAddStudent = () => {
    showNotif("warning", "Fitur tambah siswa belum diimplementasikan.");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
      <div className="relative w-[78%]">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Cari siswa berdasarkan nama, NIS, kelas, lokasi, atau spesialisasi..."
          className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
      <button
        onClick={handleAddStudent}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Tambah Siswa
      </button>
      <div className="mt-6 w-full">
        {filtered.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filtered.map((s) => (
              <li key={s.id} className="py-2 flex justify-between">
                <span>
                  <strong>{s.name}</strong> ({s.nis})
                </span>
                <span className="text-sm text-gray-500">
                  {s.class} • {s.specialization}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-3">Tidak ada siswa ditemukan.</p>
        )}
      </div>
    </div>
  );
}

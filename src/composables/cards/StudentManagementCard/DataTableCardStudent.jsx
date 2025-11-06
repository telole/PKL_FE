  import { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { api } from "../../hooks/UseApi";
  import { Plus, Search } from "lucide-react";

  export default function StudentTableManagement() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState(""); // state untuk keyword
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const axios = api();

    useEffect(() => {
      axios
        .get("students")
        .then((res) => {
          const students = res.data.student || [];
          setData(students);
          setFilteredData(students);
          console.log(students);
        })
        .catch((err) => {
          console.error(err.response?.data);
          setError(err.response?.data || "Error fetching Data");
        });
    }, []);

    const HandleRedirect = ()  =>  {

      navigate('/admin/Student')
    }

    useEffect(() => {
      if (!searchKeyword) {
        setFilteredData(data);
      } else {
        const keyword = searchKeyword.toLowerCase();
        const filtered = data.filter((s) => {
          const internship = s.internshps?.[0] || {};
          const company = internship.company || {};
          const user = s.users || {};
          return (
            (user.full_name?.toLowerCase().includes(keyword) ||
              s.nis?.toLowerCase().includes(keyword) ||
              s.KELAS?.toLowerCase().includes(keyword) ||
              company.name?.toLowerCase().includes(keyword) ||
              company.specialist?.toLowerCase().includes(keyword))
          );
        });
        setFilteredData(filtered);
      }
    }, [searchKeyword, data]);

    return (
      <>
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
          <div className="relative w-[78%]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari siswa berdasarkan nama, NIS, kelas, lokasi, atau spesialisasi..."
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <button
          onClick={HandleRedirect}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Siswa
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-x-auto p-4">
          <h2 className="text-lg font-semibold mb-3">Daftar Siswa</h2>

          {error && (
            <div className="text-red-600 text-sm mb-3">
              ⚠ {typeof error === "string" ? error : JSON.stringify(error)}
            </div>
          )}

          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="py-3 px-4 text-left">NIS</th>
                <th className="py-3 px-4 text-left">Siswa</th>
                <th className="py-3 px-4 text-left">Lokasi PKL</th>
                <th className="py-3 px-4 text-left">Periode</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Spesialisasi</th>
                <th className="py-3 px-4 text-left">Pembimbing</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.length > 0 ? (
                filteredData.map((s) => {
                  const internship = s.internshps?.[0] || null;
                  const company = internship?.company;
                  const teacher = internship?.teacher;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{s.nis || "-"}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {s.users?.full_name || "Tanpa Nama"}
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-1">
                          {s.KELAS}
                        </span>
                      </td>
                      <td className="px-4 py-3">{company ? company.name : "-"}</td>
                      <td className="px-4 py-3">
                        {internship
                          ? `${internship.start_date} s/d ${internship.end_date}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            internship?.status === "finished"
                              ? "bg-green-100 text-green-700"
                              : internship?.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : internship?.status === "approved"
                              ? "bg-blue-100 text-blue-700"
                              : internship?.status === "pending"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {internship?.status || "Belum PKL"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{company?.specialist || "-"}</td>
                      <td className="px-4 py-3">{company?.contact_person || "-"}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <i data-lucide="edit-2" className="w-4 h-4"></i>
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          title="Hapus"
                        >
                          <i data-lucide="trash-2" className="w-4 h-4"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    Tidak ada data siswa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  import { useEffect, useState, useMemo, useCallback } from "react";
  import { useNavigate } from "react-router-dom";
  import { api } from "../../hooks/UseApi";
  import { useSetError } from "../../hooks/SetError";
  import { useToast } from "../../hooks/useToast";
  import { useOpenModal } from "../../hooks/useOpenModal";
  import { useConfirmModal } from "../../hooks/useConfirmModal";
  import { Plus, Search, X, Loader2, Edit2, Trash2 } from "lucide-react";

  export default function StudentTableManagement() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const axios = useMemo(() => api(), []);
    const { setError: handleSetError } = useSetError();
    const { showNotif } = useToast();
    const { isOpen: isModalOpen, data: selectedStudent, open, close, setData: setSelectedStudent } = useOpenModal();
    const { confirm, ConfirmModal } = useConfirmModal();

    const fetchData = useCallback(async () => {
      try {
        const res = await axios.get("students");
        const students = res.data.student || [];
        setData(students);
        setFilteredData(students);
      } catch (err) {
        handleSetError(err, "Gagal memuat data siswa.");
        setError(err.response?.data || "Error fetching Data");
      }
    }, []);

    useEffect(() => {
      fetchData();
    }, []);

    const HandleRedirect = () => {
      navigate('/admin/Student');
    };

    const handleEditStatus = (student) => {
      const internship = student.internshps?.[0] || null;
      if (!internship) {
        showNotif("warning", "Siswa ini belum memiliki data PKL.");
        return;
      }
      setSelectedStudent({
        ...student,
        internship: internship,
        internshipStatus: internship.status || "pending"
      });
      open();
    };

    const handleUpdateStatus = async (e) => {
      e.preventDefault();
      if (!selectedStudent || !selectedStudent.internship) return;

      setLoading(true);
      try {
        await axios.put(`intern/${selectedStudent.internship.id}`, {
          status: selectedStudent.internshipStatus
        });

        // Update local state
        setData(prevData =>
          prevData.map(s => {
            if (s.id === selectedStudent.id) {
              const updatedInternships = s.internshps?.map(intern =>
                intern.id === selectedStudent.internship.id
                  ? { ...intern, status: selectedStudent.internshipStatus }
                  : intern
              ) || [];
              return { ...s, internshps: updatedInternships };
            }
            return s;
          })
        );

        close();
        showNotif("success", "Status PKL berhasil diperbarui.");
        fetchData(); // Refresh data
      } catch (err) {
        handleSetError(err, "Gagal memperbarui status PKL.");
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = (student) => {
      confirm(
        `Yakin ingin menghapus siswa "${student.users?.full_name || student.nis}"? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait termasuk PKL.`,
        async () => {
          try {
            setLoading(true);
            await axios.delete(`students/${student.id}`);
            showNotif("success", "Siswa berhasil dihapus.");
            fetchData(); // Refresh data
          } catch (err) {
            handleSetError(err, "Gagal menghapus siswa.");
          } finally {
            setLoading(false);
          }
        },
        {
          title: "Konfirmasi Hapus Siswa",
          confirmText: "Hapus",
          cancelText: "Batal",
          variant: "danger",
        }
      );
    };

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
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.length > 0 ? (
                filteredData.map((s) => {
                  const internship = s.internshps?.[0] || null;
                  const company = internship?.company;
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
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditStatus(s)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit Status PKL"
                            disabled={!internship || loading}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Hapus Siswa"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

        {/* Modal Edit Status Internship */}
        {isModalOpen && selectedStudent && selectedStudent.internship && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Edit Status PKL</h3>
                <button
                  onClick={close}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Siswa
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedStudent.users?.full_name || "Tidak diketahui"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    NIS: {selectedStudent.nis || "-"} | Kelas: {selectedStudent.KELAS || "-"}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi PKL
                  </label>
                  <p className="text-gray-900">
                    {selectedStudent.internship?.company?.name || "-"}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status PKL <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedStudent.internshipStatus || "pending"}
                    onChange={(e) =>
                      setSelectedStudent({
                        ...selectedStudent,
                        internshipStatus: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="in_progress">In Progress</option>
                    <option value="finished">Finished</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={close}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    disabled={loading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmModal />
      </>
    );
  }

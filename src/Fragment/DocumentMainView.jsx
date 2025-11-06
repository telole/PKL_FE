import { useEffect, useState } from "react";
import { api } from "../composables/hooks/UseApi";
import { useToast } from "../composables/hooks/useToast";
import MainPanel from "../composables/nav/MainPanel";
import Sidebar from "../composables/nav/Sidebar";
import {
  Download,
  FileText,
  FolderOpen,
  Search,
  Trash2,
  X,
  Pencil,
} from "lucide-react";

export default function MainDocument() {
  const [data, setData] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const axios = api();
  const { showNotif } = useToast();

  // --- Fetch data utama ---
  const fetchData = async () => {
    try {
      const res = await axios.get(`reportsa?_=${Date.now()}`);
      setData(res.data.data || []);
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Notifikasi menggunakan useToast

  // --- Download dokumen ---
  const handleDownload = async (doc) => {
    try {
      const res = await axios.get(`reportsa/download/${doc.id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title || "dokumen"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      showNotif("success", "Dokumen berhasil diunduh.");
    } catch (err) {
      console.error(err);
      showNotif("error", "Gagal mengunduh dokumen.");
    }
  };

  // --- Hapus dokumen ---
  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus dokumen ini?")) {
      try {
        await axios.delete(`reportsa/${id}`);
        fetchData();
        showNotif("success", "Dokumen berhasil dihapus.");
      } catch (err) {
        console.error(err);
        showNotif("error", "Gagal menghapus dokumen.");
      }
    }
  };

  // --- Update status ---
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`reportsa/${selectedDoc.id}`, {
        status: selectedDoc.status,
      });

      setIsModalOpen(false);

      setData((prev) =>
        prev.map((item) =>
          item.id === selectedDoc.id
            ? { ...item, status: selectedDoc.status }
            : item
        )
      );

      fetchData();
      showNotif("success", "Status dokumen berhasil diperbarui.");
    } catch (err) {
      console.error(err.response?.data);
      showNotif("error", "Gagal memperbarui status dokumen.");
    }
  };

  return (
    <>
      {/* Panel utama di atas semua */}
      <MainPanel />

      {/* Notifikasi dipindah ke useToast */}

      {/* Layout utama */}
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />

        <div className="flex flex-col flex-1">
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-blue-600" />
                Manajemen Dokumen Siswa
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Kelola, verifikasi, dan pantau semua dokumen siswa.
              </p>
            </div>

            {/* --- Pencarian --- */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari dokumen siswa..."
                    className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                  />
                </div>
              </div>
            </div>

            {/* --- Tabel dokumen --- */}
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium">Dokumen</th>
                    <th className="py-3 px-4 text-left font-medium">Siswa</th>
                    <th className="py-3 px-4 text-left font-medium">
                      Tanggal Upload
                    </th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.length > 0 ? (
                    data.map((d) => {
                      const student = d.internship?.students;
                      const user = student?.users;
                      return (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {d.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {d.content || "-"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">
                              {user?.full_name || "Tidak diketahui"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {student?.KELAS || student?.class || "-"}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {new Date(d.created_at).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                d.status === "ditolak"
                                  ? "bg-red-100 text-red-600"
                                  : d.status === "terkirim"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() =>
                                  setSelectedDoc(d) || setIsModalOpen(true)
                                }
                                title="Edit Status"
                                className="text-yellow-500 hover:text-yellow-700"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDownload(d)}
                                title="Download"
                                className="text-green-500 hover:text-green-700"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(d.id)}
                                title="Hapus"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-gray-500">
                        Tidak ada dokumen ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>

      {/* --- Modal Edit Status --- */}
      {isModalOpen && selectedDoc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Edit Status Dokumen
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Judul Dokumen
                </label>
                <p className="text-gray-900 text-sm font-medium">
                  {selectedDoc.title}
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedDoc.status}
                  onChange={(e) =>
                    setSelectedDoc({
                      ...selectedDoc,
                      status: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="terkirim">Terkirim</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

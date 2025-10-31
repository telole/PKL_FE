import { Plus } from "lucide-react";
import Sidebar from "../composables/nav/Sidebar";
import MainPanel from "../composables/nav/MainPanel";

export default function Studentmanagement() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <MainPanel />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <i data-lucide="users" className="w-5 h-5 text-blue-600"></i>
                <h2 className="text-lg font-semibold text-gray-800">
                  Manajemen Data Siswa
                </h2>
              </div>
              <p className="text-sm text-gray-500">
                Kelola data siswa PKL bidang Teknologi Jaringan Komputer & Pemrograman
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
            <div className="relative w-[78%]">
              <i data-lucide="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"></i>
              <input
                type="text"
                placeholder="Cari siswa berdasarkan nama, NIS, kelas, lokasi, atau spesialisasi..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tambah Siswa
            </button>
          </div>

          {/* Tabel Data */}
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
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
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">2023001</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    Angga
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-1">
                      XII TJKT 1
                    </span>
                  </td>
                  <td className="px-4 py-3">PT Telkom Indonesia</td>
                  <td className="px-4 py-3">1/6/2023 s/d 31/8/2023</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                      ✔ Aktif
                    </span>
                  </td>
                  <td className="px-4 py-3">Teknologi Jaringan</td>
                  <td className="px-4 py-3">Budi Santoso</td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button className="text-blue-500 hover:text-blue-700" title="Edit">
                      <i data-lucide="edit-2" className="w-4 h-4"></i>
                    </button>
                    <button className="text-red-500 hover:text-red-700" title="Hapus">
                      <i data-lucide="trash-2" className="w-4 h-4"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}


import Sidebar from "../../composables/nav/Sidebar";
import MainPanel from "../../composables/nav/MainPanel";
import StudentTableManagement from "../../composables/cards/StudentManagementCard/DataTableCardStudent";

export default function Studentmanagement() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
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

          {/* <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
            <div className="relative w-[78%]">
              <Search data-lucide="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
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
          </div> */}

          <StudentTableManagement/>
        </main>
      </div>
    </div>
  );
}

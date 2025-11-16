import {
  BarChart3,
  BookOpen,
  Calendar,
  Code,
  MapPin,
  Server,
} from "lucide-react";
import { Link } from "react-router-dom";
import StudentLayout from "../../composables/layouts/StudentLayout";

export default function Dashboard() {
  return (
    <StudentLayout>
      <div className="p-6 space-y-6 overflow-y-auto">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Dashboard PKL</h2>
            <p className="text-gray-600">
              Selamat datang di sistem Praktek Kerja Lapangan Teknologi Jaringan Komputer &
              Pemrograman
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-blue-700">Lokasi PKL</h3>
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-blue-600 mb-3">
                Lihat dan cari lokasi tempat praktek kerja lapangan
              </p>
              <Link to="/home/locations" className="text-blue-700 font-medium text-sm">
                Lihat detail →
              </Link>
            </div>

            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-green-700">Kegiatan PKL</h3>
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-green-600 mb-3">
                Informasi kegiatan siswa selama praktek kerja
              </p>
              <Link to="/home/activities" className="text-green-700 font-medium text-sm">
                Lihat detail →
              </Link>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-yellow-700">Laporan Harian</h3>
                <BookOpen className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-sm text-yellow-600 mb-3">
                Buat dan lihat laporan harian kegiatan PKL
              </p>
              <Link to="/home/reports" className="text-yellow-700 font-medium text-sm">
                Lihat detail →
              </Link>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-purple-700">Progres PKL</h3>
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-purple-600 mb-3">
                Pantau perkembangan dan pencapaian selama PKL
              </p>
              <Link to="/home/progress" className="text-purple-700 font-medium text-sm">
                Lihat detail →
              </Link>
            </div>
          </div>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Spesialisasi Program PKL
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold">
                  <Server className="w-5 h-5" />
                  Teknologi Jaringan
                </div>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="font-medium text-gray-800">Administrasi Server</p>
                    <p className="text-sm text-gray-500">
                      Konfigurasi dan pengelolaan server Linux/Windows, virtualisasi, dan cloud
                      computing.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="font-medium text-gray-800">Konfigurasi Jaringan</p>
                    <p className="text-sm text-gray-500">
                      Implementasi dan troubleshooting jaringan LAN/WAN, routing, dan switching.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="font-medium text-gray-800">Keamanan Jaringan</p>
                    <p className="text-sm text-gray-500">
                      Implementasi firewall, VPN, deteksi intrusi, dan keamanan infrastruktur jaringan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2 text-purple-700 font-semibold">
                  <Code className="w-5 h-5" />
                  Pemrograman
                </div>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="font-medium text-gray-800">Pengembangan Web</p>
                    <p className="text-sm text-gray-500">
                      Front-end dan back-end development menggunakan HTML, CSS, JavaScript, dan
                      framework modern.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="font-medium text-gray-800">Basis Data & Backend</p>
                    <p className="text-sm text-gray-500">
                      Desain database, API development, dan integrasi sistem menggunakan SQL dan
                      NoSQL.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="font-medium text-gray-800">Mobile Development</p>
                    <p className="text-sm text-gray-500">
                      Pengembangan aplikasi mobile menggunakan React Native, Flutter, atau native
                      development.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Distribusi Kelas Spesialisasi
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="font-semibold text-gray-700">XII TKJ 1</p>
                <p className="text-sm text-gray-500">
                  Fokus pada Pemrograman dan Jarkom PCC dan PIC
                </p>
                <span className="mt-2 inline-block text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
                  Pemrograman
                </span>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="font-semibold text-gray-700">XII TKJ 2</p>
                <p className="text-sm text-gray-500">
                  Fokus pada Jarkom dan Pemrograman Irjar dan SOJ
                </p>
                <span className="mt-2 inline-block text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  Jaringan
                </span>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="font-semibold text-gray-700">XII TKJ 3</p>
                <p className="text-sm text-gray-500">
                  Fokus pada Pemrograman dan Jarkom PCC dan PIC
                </p>
                <span className="mt-2 inline-block text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
                  Pemrograman
                </span>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="font-semibold text-gray-700">XII TKJ 4</p>
                <p className="text-sm text-gray-500">
                  Fokus pada Jarkom dan Pemrograman Irjar dan SOJ
                </p>
                <span className="mt-2 inline-block text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  Jaringan
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Pengumuman Terbaru
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <p className="text-gray-800 font-medium">
                  Pelatihan Pemrograman akan diadakan pada tanggal 09 Agustus 2025
                </p>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <p className="text-gray-800 font-medium">
                  Pelatihan Jarkom untuk siswa XII TKJ 1 akan dilaksanakan pada tanggal 30 Juli 2025
                </p>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <p className="text-gray-800 font-medium">
                  Siswa XII TKJ 3 akan berangkat PKL pada tanggal 29 Juli 2025
                </p>
              </div>
            </div>
          </section>
        </div>
    </StudentLayout>
  );
}
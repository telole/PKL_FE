import { MapPin, Users } from "lucide-react";

export default function LokasiTab({ filteredLocations, locationData }) {
  const totalLokasi = filteredLocations.reduce((sum, d) => sum + d.lokasi.length, 0);
  const totalSiswa = filteredLocations.reduce((sum, d) => sum + d.siswa.reduce((a, b) => a + b, 0), 0);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Lokasi PKL */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            Distribusi Lokasi PKL
          </h3>
          <div className="space-y-3">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((d) => {
                const count = d.lokasi.length;
                const percent = totalLokasi > 0 ? Math.round((count / totalLokasi) * 100) : 0;
                return (
                  <div key={d.kota} className="progress-container">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{d.kota}</span>
                      <span>{count} lokasi</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 relative">
                      <div
                        className="progress-bar"
                        style={{
                          background: "linear-gradient(to right,#8B5CF6,#C084FC)",
                        }}
                        data-width={percent}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">Tidak ada data lokasi</p>
            )}
          </div>
        </div>

        {/* Kapasitas Siswa per Kota */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Kapasitas Siswa per Kota
          </h3>
          <div className="space-y-3">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((d) => {
                const siswaTotal = d.siswa.reduce((a, b) => a + b, 0);
                const percent = totalSiswa > 0 ? Math.round((siswaTotal / totalSiswa) * 100) : 0;
                return (
                  <div key={d.kota} className="progress-container">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{d.kota}</span>
                      <span>{siswaTotal} siswa</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 relative">
                      <div
                        className="progress-bar"
                        style={{
                          background: "linear-gradient(to right,#3B82F6,#60A5FA)",
                        }}
                        data-width={percent}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">Tidak ada data siswa</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Ringkasan */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
        <div className="p-4 overflow-x-auto">
          {filteredLocations.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-left font-medium bg-gray-50">Kota</th>
                  <th className="py-3 px-4 text-left font-medium bg-gray-50">Jumlah Lokasi</th>
                  <th className="py-3 px-4 text-left font-medium bg-gray-50">Jumlah Siswa</th>
                  <th className="py-3 px-4 text-left font-medium bg-gray-50">Presentase Siswa</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.map((d) => {
                  const lokasiTotal = d.lokasi.length;
                  const siswaTotal = d.siswa.reduce((a, b) => a + b, 0);
                  const presentase = totalSiswa > 0 ? Math.round((siswaTotal / totalSiswa) * 100) + "%" : "0%";
                  return (
                    <tr key={d.kota} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{d.kota}</td>
                      <td className="px-4 py-3">{lokasiTotal}</td>
                      <td className="px-4 py-3">{siswaTotal}</td>
                      <td className="px-4 py-3">{presentase}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Tidak ada data lokasi</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


import { FileText, BarChart3 } from "lucide-react";

export default function LaporanTab({ reportData, filteredReports, statusChartRef }) {
  const total = reportData.approved + reportData.pending + reportData.rejected;
  const approvedPercent = total > 0 ? Math.round((reportData.approved / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((reportData.pending / total) * 100) : 0;
  const rejectedPercent = total > 0 ? Math.round((reportData.rejected / total) * 100) : 0;

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "disetujui" || statusLower === "approved") return "text-green-600";
    if (statusLower === "tertunda" || statusLower === "pending" || statusLower === "terkirim") return "text-yellow-600";
    if (statusLower === "ditolak" || statusLower === "rejected") return "text-red-600";
    return "text-gray-600";
  };

  const formatStatus = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "disetujui" || statusLower === "approved") return "Disetujui";
    if (statusLower === "tertunda" || statusLower === "pending") return "Tertunda";
    if (statusLower === "terkirim") return "Terkirim";
    if (statusLower === "ditolak" || statusLower === "rejected") return "Ditolak";
    return status || "Unknown";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ringkasan Status */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <h2 className="font-medium text-gray-700 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Ringkasan Status Laporan
            </h2>
          </div>
          <div className="p-4">
            <div className="flex justify-around mb-4 flex-wrap gap-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{reportData.approved}</div>
                <div className="text-sm text-gray-500">Disetujui</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{reportData.pending}</div>
                <div className="text-sm text-gray-500">Tertunda</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{reportData.rejected}</div>
                <div className="text-sm text-gray-500">Ditolak</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                <div className="flex justify-between text-sm mb-1 px-1">
                  <span className="text-gray-500 font-medium">Disetujui</span>
                  <span className="text-gray-500 font-medium">{approvedPercent}%</span>
                </div>
                <div className="relative w-full h-3 bg-gray-200 rounded">
                  <div className="absolute left-0 top-0 h-3 bg-green-600 rounded" style={{ width: `${approvedPercent}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between text-sm mb-1 px-1">
                  <span className="text-gray-500 font-medium">Tertunda</span>
                  <span className="text-gray-500 font-medium">{pendingPercent}%</span>
                </div>
                <div className="relative w-full h-3 bg-gray-200 rounded">
                  <div className="absolute left-0 top-0 h-3 bg-yellow-600 rounded" style={{ width: `${pendingPercent}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between text-sm mb-1 px-1">
                  <span className="text-gray-500 font-medium">Ditolak</span>
                  <span className="text-gray-500 font-medium">{rejectedPercent}%</span>
                </div>
                <div className="relative w-full h-3 bg-gray-200 rounded">
                  <div className="absolute left-0 top-0 h-3 bg-red-600 rounded" style={{ width: `${rejectedPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Distribusi Status */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50 flex items-center">
            <h2 className="font-medium text-gray-700 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Distribusi Status Laporan
            </h2>
          </div>
          <div className="p-4 h-72 relative">
            <canvas ref={statusChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Tabel Laporan */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
          <h2 className="font-medium text-gray-700 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Daftar Laporan
          </h2>
        </div>
        <div className="p-4 overflow-x-auto">
          {filteredReports && filteredReports.length > 0 ? (
            <table className="min-w-full table-auto border border-gray-200 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Nama Siswa</th>
                  <th className="px-4 py-2 text-left">Judul Laporan</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{report.id}</td>
                    <td className="px-4 py-2">
                      {report.internship?.students?.users?.full_name || 
                       report.studentName || 
                       "Tidak diketahui"}
                    </td>
                    <td className="px-4 py-2">{report.title || "Laporan PKL"}</td>
                    <td className={`px-4 py-2 ${getStatusColor(report.status)}`}>
                      {formatStatus(report.status)}
                    </td>
                    <td className="px-4 py-2">{formatDate(report.created_at || report.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Tidak ada laporan ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


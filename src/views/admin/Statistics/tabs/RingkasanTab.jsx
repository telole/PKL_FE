import { useMemo } from "react";
import { Users, FileText, MapPin, BarChart3, PieChart } from "lucide-react";

export default function RingkasanTab({ summaryData, monthlyReportTrend }) {
  // Calculate max value for trend chart
  const maxTrendValue = useMemo(() => {
    if (!monthlyReportTrend || monthlyReportTrend.length === 0) return 1;
    return Math.max(...monthlyReportTrend.map((m) => m.count), 1);
  }, [monthlyReportTrend]);

  return (
    <>
      {/* Statistik Ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-3">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Siswa PKL</p>
              <p className="text-xl font-bold">{summaryData.totalStudents}</p>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Aktif: {summaryData.activeStudents}</span>
            <span>Selesai: {summaryData.completedStudents}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-3">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Laporan</p>
              <p className="text-xl font-bold">{summaryData.totalReports}</p>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Disetujui: {summaryData.approvedReports}</span>
            <span>Tertunda: {summaryData.pendingReports}</span>
            <span>Ditolak: {summaryData.rejectedReports}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-3">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Lokasi & Pembimbing</p>
              <p className="text-xl font-bold">{summaryData.totalLocations}</p>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Lokasi: {summaryData.totalLocations}</span>
            <span>Pembimbing: {summaryData.totalTeachers}</span>
          </div>
        </div>
      </div>

      {/* Tren & Distribusi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tren Laporan Bulanan */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <h2 className="font-medium text-gray-700 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Tren Laporan Bulanan
            </h2>
          </div>
          <div className="p-6 h-72 flex items-end justify-between text-center">
            {monthlyReportTrend && monthlyReportTrend.length > 0 ? (
              monthlyReportTrend.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full max-w-[50px] bg-blue-500 rounded-t mx-auto"
                    style={{ height: `${Math.max((month.count / maxTrendValue) * 100, 10)}%` }}
                  ></div>
                  <p className="text-xs mt-1 text-gray-600">{month.month}</p>
                </div>
              ))
            ) : (
              <div className="w-full text-center text-gray-500 text-sm py-8">
                Tidak ada data tren laporan
              </div>
            )}
          </div>
        </div>

        {/* Distribusi Spesialisasi Siswa */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <h2 className="font-medium text-gray-700 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-blue-600" />
              Distribusi Spesialisasi Siswa
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {summaryData.specializations && summaryData.specializations.length > 0 ? (
              summaryData.specializations.map((spec) => (
                <div key={spec.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{spec.name}</span>
                    <span>{spec.count} siswa</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${spec.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">Tidak ada data spesialisasi</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


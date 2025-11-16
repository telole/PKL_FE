import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, Plus, Eye, ChevronDown, Loader2 } from "lucide-react";
import StudentLayout from "../../composables/layouts/StudentLayout";
import { api } from "../../composables/hooks/UseApi";
import { useSetError } from "../../composables/hooks/SetError";
import { useSetLoading } from "../../composables/hooks/setLoading";

// FIXED: gunakan lowercase + tambah fallback "pending"
const STATUS_COLORS = {
  terkirim: { bg: "bg-blue-100", text: "text-blue-700", label: "Terkirim" },
  disetujui: { bg: "bg-green-100", text: "text-green-700", label: "Disetujui" },
  ditolak: { bg: "bg-red-100", text: "text-red-700", label: "Ditolak" },
  pending: { bg: "bg-gray-200", text: "text-gray-700", label: "Pending" },
};

export default function DocumentStudent() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useSetLoading(true);
  const axios = useMemo(() => api(), []);
  const { setError } = useSetError();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get("reports");
        setReports(response.data.data || []);
      } catch (err) {
        setError(err, "Gagal memuat data laporan.");
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusBadge = (status) => {
    const statusKey = status?.toLowerCase() || "pending";
    const statusConfig = STATUS_COLORS[statusKey] || STATUS_COLORS["pending"];

    return (
      <span className={`text-xs ${statusConfig.bg} ${statusConfig.text} px-2 py-1 rounded`}>
        {statusConfig.label}
      </span>
    );
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

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      searchQuery === "" ||
      (report.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.content || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "" ||
      (report.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(reports.map((r) => r.status?.toLowerCase()).filter(Boolean))];
    return statuses;
  }, [reports]);

  return (
    <StudentLayout>
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Laporan Harian</h1>
            <p className="text-gray-600 mt-1">Buat dan kelola laporan harian kegiatan PKL</p>
          </div>
        </div>

        {/* Search + Button */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Cari laporan..."
            />
          </div>

          <button
            onClick={() => navigate("/home/reports/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Buat Laporan Baru
          </button>
        </div>

        {/* List Header */}
        <div className="mt-8 flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Riwayat Laporan</h2>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-gray-500 text-sm cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              {uniqueStatuses.map((status) => {
                const statusConfig = STATUS_COLORS[status] || STATUS_COLORS.pending;
                return (
                  <option key={status} value={status}>
                    {statusConfig.label}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-gray-600 font-medium mt-4">Memuat laporan...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg mb-2">
              {searchQuery || statusFilter ? "Tidak ada laporan yang cocok" : "Belum ada laporan"}
            </p>
            <p className="text-gray-500 text-sm">
              {searchQuery || statusFilter
                ? "Coba ubah kata kunci pencarian atau filter status"
                : "Klik tombol 'Buat Laporan Baru' untuk membuat laporan pertama Anda"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-white p-5 rounded-lg border hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                    <span className="text-gray-500 text-sm">
                      {formatDate(report.created_at || report.date)}
                    </span>
                  </div>

                  <button className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700">
                    <Eye className="w-4 h-4" />
                    Lihat
                  </button>
                </div>

                <p className="font-medium mt-2 text-gray-900">{report.title || "Laporan Harian"}</p>
                <p className="text-gray-600 text-sm mt-1">
                  {report.description || report.content || "Tidak ada deskripsi"}
                </p>

                {report.feedback && (
                  <>
                    <p className="mt-3 font-medium text-gray-700">Umpan Balik:</p>
                    <p className="text-gray-600 text-sm">{report.feedback}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
